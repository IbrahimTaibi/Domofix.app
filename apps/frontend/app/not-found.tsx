import ErrorView from '@/shared/components/error/error-view'

export default function NotFound() {
  return (
    <ErrorView
      code={404}
      title="Page introuvable"
      description="La page que vous recherchez n'existe pas ou a été déplacée."
      actions={[
        { label: 'Retour à l’accueil', href: '/' },
        { label: 'Aller à la connexion', href: '/auth' },
      ]}
    />
  )
}