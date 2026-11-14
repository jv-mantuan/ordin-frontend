// Starts a throwaway Ordin API for the Playwright suite:
// local Postgres database `ordin_e2e` (derived from the backend's env/test.env), auth bypass on
// (AUTH_USE_NEON=false: every request is the master user), port 3100.
// The API is compiled into the backend's node_modules/.cache so the backend's own dist/ (used by a
// dev server in watch mode) is never touched.
import { execSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
export const E2E_DATABASE = 'ordin_e2e'
export const E2E_API_PORT = '3100'

const here = dirname(fileURLToPath(import.meta.url))
const backendDir = resolve(here, '../../ordin-backend-node')

/** Points a Postgres URL at the e2e database. Throws unless the host is local. */
function toE2eUrl(raw, name) {
  if (!raw) throw new Error(`${name} missing in the backend test env file`)
  const url = new URL(raw)
  url.pathname = `/${E2E_DATABASE}`
  // pg and Prisma let `?host=` / `?hostaddr=` override the URL's host, so check what they will use.
  const hosts = [url.hostname, ...url.searchParams.getAll('host'), ...url.searchParams.getAll('hostaddr')]
  const remote = hosts.find((h) => !LOCAL_HOSTS.has(h))
  if (remote !== undefined) {
    throw new Error(`Refusing to run e2e API against non-local database host ${remote || '(empty)'}`)
  }
  return url.toString()
}

function readEnvFile() {
  const i = process.argv.indexOf('--env-file')
  const path = i > -1 ? resolve(process.argv[i + 1]) : join(backendDir, 'env', 'test.env')
  return parseEnv(readFileSync(path, 'utf8'))
}

async function prepareDatabase(env) {
  const require = createRequire(join(backendDir, 'package.json'))
  const pg = require('pg')

  const admin = new URL(env.DATABASE_URL)
  admin.pathname = '/postgres'
  const adminClient = new pg.Client({ connectionString: admin.toString() })
  await adminClient.connect()
  try {
    const { rowCount } = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [E2E_DATABASE])
    if (!rowCount) await adminClient.query(`CREATE DATABASE ${E2E_DATABASE}`)
  } finally {
    await adminClient.end()
  }

  execSync('npx prisma migrate deploy', { cwd: backendDir, env: { ...process.env, ...env }, stdio: 'inherit' })

  const client = new pg.Client({ connectionString: env.DATABASE_URL })
  await client.connect()
  try {
    await client.query(readFileSync(join(backendDir, 'test/sql/neon-auth.sql'), 'utf8'))
    // Fresh data every run; specs use unique names so parallel projects don't collide.
    await client.query('TRUNCATE transactions, categories, users, neon_auth.account, neon_auth."user" CASCADE')
  } finally {
    await client.end()
  }
}

function compileApi() {
  const outDir = join(backendDir, 'node_modules/.cache/ordin-e2e-ui')
  mkdirSync(outDir, { recursive: true })
  execSync(
    `npx tsc -p tsconfig.build.json --outDir "${outDir}" --tsBuildInfoFile "${outDir}.tsbuildinfo"`,
    { cwd: backendDir, stdio: 'inherit' },
  )
  // node_modules is a package-scope boundary: without this the ESM output is read as CommonJS.
  writeFileSync(join(outDir, 'package.json'), '{ "type": "module" }\n')
  return join(outDir, 'main.js')
}

async function main() {
  if (!existsSync(backendDir)) throw new Error(`Backend not found at ${backendDir}`)
  const fileEnv = readEnvFile()
  const env = {
    ...fileEnv,
    DATABASE_URL: toE2eUrl(fileEnv.DATABASE_URL, 'DATABASE_URL'),
    DIRECT_URL: toE2eUrl(fileEnv.DIRECT_URL ?? fileEnv.DATABASE_URL, 'DIRECT_URL'),
    NODE_ENV: 'test',
    AUTH_USE_NEON: 'false',
    NEON_AUTH_URL: '',
    PORT: E2E_API_PORT,
    CORS_ORIGINS: '',
  }

  await prepareDatabase(env)
  const entry = compileApi()

  const api = spawn(process.execPath, [entry], { cwd: backendDir, env: { ...process.env, ...env }, stdio: 'inherit' })
  const stop = () => api.kill()
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  api.on('exit', (code) => process.exit(code ?? 0))
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
