"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Textarea } from "@/components/ui";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  address: string;
  city: string;
  postalCode: string;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

export function ProviderRegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    address: "",
    city: "",
    postalCode: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    if (!formData.businessName) newErrors.businessName = "Le nom d'entreprise est requis";
    if (!formData.address) newErrors.address = "L'adresse est requise";
    if (!formData.city) newErrors.city = "La ville est requise";
    if (!formData.postalCode) {
      newErrors.postalCode = "Le code postal est requis";
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Code postal invalide";
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Maximum 500 caractères";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Registration data:", formData);
    setIsLoading(false);
    
    // TODO: Navigate to success page or dashboard
    alert("Inscription réussie ! Votre compte sera activé après vérification.");
  };

  const steps = [
    { number: 1, title: "Informations personnelles", icon: User },
    { number: 2, title: "Activité professionnelle", icon: Briefcase },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3 flex-wrap">
          Commencez comme prestataire Tawa
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-bold">1 MOIS GRATUIT</span>
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Créez votre compte en quelques minutes et commencez à recevoir des demandes dès aujourd'hui.
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
                  <span className="font-medium hidden sm:inline">{s.title}</span>
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
                  required
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Activité professionnelle
                </h2>
                <p className="text-sm text-gray-600">
                  Parlez-nous de votre activité et de votre localisation.
                </p>
              </div>

              <Input
                label="Nom d'entreprise / Professionnel"
                type="text"
                value={formData.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                error={errors.businessName}
                helperText="Ce nom apparaîtra sur votre profil public"
                required
              />

              <Input
                label="Adresse"
                type="text"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                error={errors.address}
                required
              />

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

              <Textarea
                label="Description de votre activité (optionnel)"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                error={errors.description}
                helperText={`${formData.description.length}/500 caractères`}
                placeholder="Décrivez vos services, votre expérience, et ce qui vous démarque..."
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              Retour
            </Button>
          )}
          
          {step < steps.length ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="w-full sm:w-auto ml-auto"
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full sm:w-auto"
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

