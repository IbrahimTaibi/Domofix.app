import ErrorView from '@/shared/components/error/error-view'

export default function InternalError() {
  return (
    <ErrorView
      code={500}
      title="Erreur interne du serveur"
      description="Une erreur s’est produite de notre côté. Veuillez réessayer plus tard."
      actions={[
        { label: 'Retour à l’accueil', href: '/' },
      ]}
    />
  )
}