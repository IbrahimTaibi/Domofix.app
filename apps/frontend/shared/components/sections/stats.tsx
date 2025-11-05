import Link from 'next/link'
import { Button } from '@/shared/components'

export default function StatsSection() {
  const stats = [
    { value: '10K+', label: 'Utilisateurs actifs' },
    { value: '500+', label: 'Prestataires' },
    { value: '50+', label: 'Catégories de services' },
    { value: '4.9', label: 'Note moyenne' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-3">
            Rejoignez notre communauté grandissante
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Découvrez l’avenir des services locaux.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-light mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/get-started">
            <Button variant="primary" size="lg">
              Commencer gratuitement
            </Button>
          </Link>
          <Link href="#providers">
            <Button variant="outline" size="lg">
              Devenir prestataire
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
