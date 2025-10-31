"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Textarea } from "@/components/ui";
import { useAuth, useLocationData } from "@/hooks";
import { useMobile } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CheckCircle2,
  ArrowRight,
  Star,
  Navigation
} from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  postalCode: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CustomerRegistrationForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { setSelectedLocation } = useLocationData();
  const isMobile = useMobile();
  
  const [step, setStep] = useState(1);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName) newErrors.lastName = "Le nom est requis";
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.phone) {
      newErrors.phone = "Le téléphone est requis";
    } else if (!/^[0-9+\s-]+$/.test(formData.phone)) {
      newErrors.phone = "Numéro invalide";
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.address) newErrors.address = "L'adresse est requise";
    if (!formData.city) newErrors.city = "La ville est requise";
    if (!formData.postalCode) {
      newErrors.postalCode = "Le code postal est requis";
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Code postal invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert(
        "La géolocalisation n'est pas prise en charge par votre navigateur. Veuillez saisir votre adresse manuellement."
      );
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const props = feature.properties;
            
            // Update form data with geocoded address
            updateField("address", props.name || "");
            updateField("city", props.city || "");
            updateField("postalCode", props.postcode || "");
            
            alert("Adresse détectée avec succès !");
          }
        } catch (error) {
          alert("Impossible de récupérer l'adresse. Veuillez la saisir manuellement.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Impossible d'obtenir votre position.";
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Autorisation de localisation refusée. Veuillez saisir votre adresse manuellement.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Informations de localisation indisponibles. Veuillez saisir votre adresse manuellement.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "La demande de localisation a expiré. Veuillez réessayer ou saisir votre adresse manuellement.";
        }
        alert(message);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);
    
    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'customer'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || 'Erreur lors de l\'inscription');
        return;
      }

      // Save location data if available
      if (currentLocation) {
        setSelectedLocation(currentLocation);
      }
      
      // Use our Zustand store through the hook
      login(result.data);
      
      // Redirect to dashboard
      router.push("/get-started/customer");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Informations personnelles", shortTitle: "Infos", icon: User },
    { number: 2, title: "Adresse", shortTitle: "Adresse", icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3 flex-wrap">
          Créez votre compte client
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-3 py-1 rounded-full">
            <Star className="w-3 h-3" />
            <span className="text-xs font-bold">GRATUIT</span>
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Accédez à des milliers de prestataires de confiance près de chez vous en quelques minutes.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((s, index) => {
            const StepIcon = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;
            
            return (
              <div key={s.number} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? "bg-primary-50 text-primary-700 border-2 border-primary-200" 
                    : isCompleted
                    ? "bg-green-50 text-green-700 border-2 border-green-200"
                    : "bg-gray-100 text-gray-500 border-2 border-gray-200"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? "bg-primary-600 text-white" 
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-white"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`font-medium ${isMobile ? 'hidden' : 'inline'}`}>{s.title}</span>
                <span className={isMobile ? 'inline' : 'hidden'}>{s.shortTitle || s.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isCompleted ? "bg-green-400" : "bg-gray-300"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Informations personnelles
                </h2>
                <p className="text-sm text-gray-600">
                  Renseignez vos coordonnées pour créer votre compte.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Nom"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  error={errors.lastName}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  error={errors.email}
                  helperText="Nous vous enverrons des notifications sur cette adresse"
                  required
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  error={errors.phone}
                  helperText="Exemple : +33 6 12 34 56 78"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  error={errors.password}
                  helperText="Minimum 8 caractères"
                  autoComplete="new-password"
                  required
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Votre adresse
                </h2>
                <p className="text-sm text-gray-600">
                  Nous avons besoin de votre localisation pour vous proposer les meilleurs prestataires près de chez vous.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Adresse
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="inline-flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingLocation ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Détection en cours...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3" />
                        Utiliser ma position
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Exemple : 123 Rue de la République"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.address 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Code postal"
                  type="text"
                  maxLength={5}
                  pattern="[0-9]*"
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  error={errors.postalCode}
                  required
                />
                <Input
                  label="Ville"
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  error={errors.city}
                  required
                />
              </div>

              {/* Benefits preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Ce que vous pourrez faire</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    Rechercher des prestataires près de chez vous
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    Comparer les prix et les avis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    Réserver des services en quelques clics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    Suivre vos réservations en temps réel
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex gap-4 justify-between items-center ${isMobile ? 'flex-col' : 'flex-row'}`}>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className={`${isMobile ? 'w-full order-2' : 'w-auto order-1'}`}
            >
              Retour
            </Button>
          )}
          
          {step < steps.length ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className={`${isMobile ? 'w-full order-1' : 'w-auto order-2 ml-auto'}`}
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className={`${isMobile ? 'w-full order-1' : 'w-auto order-2'}`}
            >
              Créer mon compte gratuit
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Se connecter
            </Link>
          </p>
          <p className="mt-2">
            En vous inscrivant, vous acceptez nos{" "}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
              conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
}

