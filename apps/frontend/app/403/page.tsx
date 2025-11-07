import ErrorView from '@/shared/components/error/error-view'

export default function Forbidden() {
  return (
    <ErrorView
      code={403}
      title="Accès interdit"
      description="Vous n’avez pas les permissions nécessaires pour accéder à cette ressource."
      actions={[
        { label: 'Retour à l’accueil', href: '/' },
        { label: 'Se connecter', href: '/auth' },
      ]}
    />
  )
}