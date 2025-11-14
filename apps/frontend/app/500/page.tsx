export default function Error500Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Erreur interne du serveur</h1>
        <p className="text-sm text-gray-600 mb-4">Une erreur s’est produite. Réessayez plus tard.</p>
        <a href="/dashboard/provider" className="inline-flex items-center px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Retour au tableau de bord</a>
      </div>
    </main>
  )
}
