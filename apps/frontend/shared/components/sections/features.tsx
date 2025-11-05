import { MapPin, Star, DollarSign, Zap, Shield, Smartphone } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: 'Localisation en temps réel',
      description: 'Trouvez des services selon votre position actuelle.',
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Des avis authentiques de vrais clients.',
    },
    {
      icon: DollarSign,
      title: 'Tarifs transparents',
      description: 'Aucun frais caché ni surprise.',
    },
    {
      icon: Zap,
      title: 'Réservation instantanée',
      description: 'Réservez en quelques clics.',
    },
    {
      icon: Shield,
      title: 'Sûr et sécurisé',
      description: 'Prestataires vérifiés et paiements sécurisés.',
    },
    {
      icon: Smartphone,
      title: 'Toujours accessible',
      description: 'Accédez aux services à tout moment, où que vous soyez.',
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Une plateforme complète conçue pour rendre les services locaux accessibles et simples.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="p-6 rounded-lg hover:bg-gray-50 transition-all group will-change-transform hover:translate-y-[-2px]"
              >
                <div className="flex items-start space-x-4">
                  <IconComponent className="w-5 h-5 text-[#0D77FF] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
