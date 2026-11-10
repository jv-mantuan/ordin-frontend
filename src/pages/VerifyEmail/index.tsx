import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { codeSchema, type CodeFormData, type CodeFormInput } from '../../schemas/auth.schema'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useCooldown } from '../../hooks/useCooldown'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthButton } from '../../components/auth/AuthButton'
import { CodeInput } from '../../components/auth/CodeInput'
import { TextAction } from '../../components/auth/TextAction'

const RESEND_COOLDOWN_S = 60

export function VerifyEmailPage() {
  const { verifyEmail, resendVerificationCode } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const email = (useLocation().state as { email?: string } | null)?.email
  // A code was just sent by sign-up / sign-in, so start throttled.
  const cooldown = useCooldown(RESEND_COOLDOWN_S, true)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CodeFormInput, unknown, CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  if (!email) return <Navigate to="/signup" replace />

  const onSubmit = async ({ code }: CodeFormData) => {
    const { error } = await verifyEmail(email, code)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('E-mail confirmado.')
    navigate('/', { replace: true })
  }

  const onResend = async () => {
    cooldown.start()
    const { error } = await resendVerificationCode(email)
    if (error) toast.error(error)
    else toast.info('Enviamos um novo código.')
  }

  return (
    <AuthLayout
      title="Confirme seu e-mail"
      subtitle={`Enviamos um código de 6 dígitos para ${email}. Ele vale por 5 minutos.`}
      footer={
        <Link to="/signup" style={{ color: colors.accentGreenBright, fontWeight: 500 }}>
          Usar outro e-mail
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
        <AuthButton type="submit" loading={isSubmitting}>
          {isSubmitting ? 'Confirmando…' : 'Confirmar'}
        </AuthButton>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
        <span style={{ fontSize: '13px', color: colors.textSecondary }}>
          Não recebeu? Confira o spam ou{' '}
          <TextAction onClick={onResend} disabled={cooldown.active}>
            {cooldown.active ? `reenvie em ${cooldown.left}s` : 'reenviar código'}
          </TextAction>
        </span>
        <span style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
          Se este e-mail já tiver conta, entre com sua senha ou use “Esqueci minha senha”.
        </span>
      </div>
    </AuthLayout>
  )
}
