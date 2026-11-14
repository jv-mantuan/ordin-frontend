import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { TopBar } from '../../components/shared/TopBar'
import { AuthField } from '../../components/auth/AuthField'
import { AuthButton } from '../../components/auth/AuthButton'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { displayName, initials } from '../../lib/user'
import { profileSchema, type ProfileFormData } from '../../schemas/auth.schema'
import { radius, spacing } from '../../theme'

export function ProfilePage() {
  const { colors } = useTheme()
  const { isMobile, isTablet } = useBreakpoint()
  const { user, updateName } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  // Keep the form in step with the session (e.g. renamed in another tab, then the tab regained focus).
  useEffect(() => {
    reset({ name: user?.name ?? '' })
  }, [user?.name, reset])

  const onSubmit = async (data: ProfileFormData) => {
    const { error } = await updateName(data.name)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Nome atualizado.')
    reset({ name: data.name })
  }

  // The avatar previews the initials of the name being typed.
  const typedName = useWatch({ control, name: 'name' })
  const preview = user ? { ...user, name: typedName ?? '' } : null

  const pagePadding = isMobile ? '16px' : isTablet ? '24px' : '30px'

  return (
    <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
      <main style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        <div style={{
          padding: pagePadding,
          paddingBottom: isMobile ? '80px' : pagePadding,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>
          <TopBar title="Perfil" />

          <section style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '480px',
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.xl,
            padding: isMobile ? spacing.lg : spacing.xl,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xl,
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, minWidth: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: radius.full,
                  background: `linear-gradient(135deg, ${colors.accentGreenMuted}, ${colors.accentGreen})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: colors.white,
                  flexShrink: 0,
                }}
              >
                {initials(preview)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textPrimary,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {displayName(user)}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}
            >
              <AuthField
                label="Nome"
                autoComplete="name"
                error={errors.name?.message}
                {...register('name')}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textSecondary }}>E-mail</span>
                <span style={{
                  fontSize: '14px',
                  color: colors.textPrimary,
                  overflowWrap: 'anywhere',
                }}>
                  {user?.email}
                </span>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>O e-mail não pode ser alterado.</span>
              </div>

              <AuthButton type="submit" loading={isSubmitting} disabled={!isDirty}>
                Salvar
              </AuthButton>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
