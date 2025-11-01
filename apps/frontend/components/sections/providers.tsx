import Link from 'next/link'
import { Button } from '@/components/ui'
import { Users, Smartphone, TrendingUp, Clock } from 'lucide-react'

export default function ProvidersSection() {
  const benefits = [
    { icon: Users, title: 'Touchez plus de clients', color: 'text-primary-600' },
    { icon: Smartphone, title: 'Gestion simplifiée', color: 'text-primary-600' },
    { icon: TrendingUp, title: 'Développez votre activité', color: 'text-primary-600' },
    { icon: Clock, title: 'Horaires flexibles', color: 'text-primary-600' },
  ]

  return (
    <section id="providers" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-3">
            Pour les prestataires
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Transformez vos compétences en revenus. Rejoignez Tawa et atteignez des clients près de chez vous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div key={index} className="flex items-center justify-center space-x-3">
                <IconComponent className={`w-5 h-5 ${benefit.color} flex-shrink-0`} />
                <h3 className="text-base font-medium text-gray-900">
                  {benefit.title}
                </h3>
              </div>
            )
          })}
        </div>

        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-light text-gray-900 mb-4 text-center">
            Prêt à commencer ?
          </h3>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Rejoignez des milliers de prestataires qui développent leur activité avec Tawa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/provider">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Rejoindre en tant que prestataire
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
