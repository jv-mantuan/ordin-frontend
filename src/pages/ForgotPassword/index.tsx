import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../schemas/auth.schema'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthField } from '../../components/auth/AuthField'
import { AuthButton } from '../../components/auth/AuthButton'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    // The server answers the same whether or not the email has an account, and so do we.
    const { error } = await requestPasswordReset(email)
    if (error) {
      toast.error(error)
      return
    }
    navigate('/redefinir-senha', { state: { email } })
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail e enviaremos um código para redefinir a senha."
      footer={
        <Link to="/login" style={{ color: colors.accentGreenBright, fontWeight: 500 }}>
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
        <AuthField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          autoFocus
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthButton type="submit" loading={isSubmitting} style={{ marginTop: '4px' }}>
          {isSubmitting ? 'Enviando…' : 'Enviar código'}
        </AuthButton>
      </form>
    </AuthLayout>
  )
}
