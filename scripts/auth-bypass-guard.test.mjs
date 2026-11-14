// pnpm test:bypass-guard — proves the dev-only e2e auth bypass (src/lib/authBypass.ts) cannot ship.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import assert from 'node:assert/strict'

const MARKERS = ['ordin-e2e-bypass-token', 'ordin.e2e.session']
const dirs = []

function viteBuild(extraEnv) {
  const outDir = mkdtempSync(join(tmpdir(), 'ordin-bypass-guard-'))
  dirs.push(outDir)
  const env = { ...process.env, VITE_NEON_AUTH_URL: 'https://neon-auth.invalid/neondb/auth', ...extraEnv }
  // Without the flag, make sure a VITE_AUTH_BYPASS from the caller's shell doesn't leak in.
  if (!extraEnv.VITE_AUTH_BYPASS) delete env.VITE_AUTH_BYPASS
  // One command string: pnpm is a .cmd shim on Windows, so it needs a shell.
  const result = spawnSync(`pnpm exec vite build --outDir "${outDir}" --emptyOutDir --logLevel error`, {
    env,
    shell: true,
    encoding: 'utf8',
  })
  return { outDir, status: result.status, output: `${result.stdout}\n${result.stderr}` }
}

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })))

test('build fails when VITE_AUTH_BYPASS=true', () => {
  const { status, output } = viteBuild({ VITE_AUTH_BYPASS: 'true' })
  assert.notEqual(status, 0, 'vite build must refuse to build with the bypass flag')
  assert.match(output, /VITE_AUTH_BYPASS/)
})

test('production bundle has no bypass code', () => {
  const { status, output, outDir } = viteBuild({})
  assert.equal(status, 0, output)
  const leaks = filesUnder(outDir).flatMap((file) => {
    const text = readFileSync(file, 'utf8')
    return MARKERS.filter((m) => text.includes(m)).map((m) => `${file}: ${m}`)
  })
  assert.deepEqual(leaks, [])
})
