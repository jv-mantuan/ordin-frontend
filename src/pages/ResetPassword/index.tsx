import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  PASSWORD_MIN,
  resetPasswordSchema,
  type ResetPasswordFormData,
  type ResetPasswordFormInput,
} from '../../schemas/auth.schema'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useCooldown } from '../../hooks/useCooldown'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthField } from '../../components/auth/AuthField'
import { AuthButton } from '../../components/auth/AuthButton'
import { CodeInput } from '../../components/auth/CodeInput'
import { TextAction } from '../../components/auth/TextAction'

const RESEND_COOLDOWN_S = 60

export function ResetPasswordPage() {
  const { resetPassword, requestPasswordReset, signOut } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const email = (useLocation().state as { email?: string } | null)?.email
  const cooldown = useCooldown(RESEND_COOLDOWN_S, true)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInput, unknown, ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  })

  if (!email) return <Navigate to="/esqueci-senha" replace />

  const onSubmit = async ({ code, password }: ResetPasswordFormData) => {
    const { error } = await resetPassword(email, code, password)
    if (error) {
      toast.error(error)
      return
    }
    // Neon revokes existing sessions on reset; drop any local one too and sign in fresh.
    await signOut()
    toast.success('Senha redefinida. Entre com a nova senha.')
    navigate('/login', { replace: true })
  }

  const onResend = async () => {
    cooldown.start()
    const { error } = await requestPasswordReset(email)
    if (error) toast.error(error)
    else toast.info('Enviamos um novo código.')
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle={`Digite o código enviado para ${email} e escolha a nova senha. O código vale por 5 minutos.`}
      footer={
        <Link to="/login" style={{ color: colors.accentGreenBright, fontWeight: 500 }}>
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <CodeInput value={field.value} onChange={field.onChange} error={errors.code?.message} autoFocus />
          )}
        />
        <AuthField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
          error={errors.password?.message}
          {...register('password')}
        />
        <AuthField
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <AuthButton type="submit" loading={isSubmitting} style={{ marginTop: '4px' }}>
          {isSubmitting ? 'Redefinindo…' : 'Redefinir senha'}
        </AuthButton>
      </form>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <span style={{ fontSize: '13px', color: colors.textSecondary }}>
          Não recebeu? Confira o spam ou{' '}
          <TextAction onClick={onResend} disabled={cooldown.active}>
            {cooldown.active ? `reenvie em ${cooldown.left}s` : 'reenviar código'}
          </TextAction>
        </span>
      </div>
    </AuthLayout>
  )
}
