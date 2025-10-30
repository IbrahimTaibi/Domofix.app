"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Email validation
    if (!formData.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // Call the authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Show specific error message from API
        setErrors(prev => ({
          ...prev,
          email: result.error === 'Identifiants invalides' ? result.message : '',
          password: result.error === 'Identifiants invalides' ? result.message : ''
        }));
        return;
      }

      // Use our Zustand store through the hook
      login(result.data);
      
      // Redirect based on user type
      const redirectPath = result.data.userType === 'provider' 
        ? '/get-started/provider' 
        : result.data.userType === 'admin'
        ? '/admin'
        : '/get-started/customer';
      
      router.push(redirectPath);
    } catch (error) {
      console.error("Login error:", error);
      setErrors(prev => ({
        ...prev,
        email: "Erreur de connexion. Veuillez réessayer.",
        password: ""
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connexion à votre compte
        </h1>
        <p className="text-gray-600">
          Entrez vos identifiants pour accéder à votre espace personnel
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Se connecter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Social Login Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">ou</span>
            </div>
          </div>
          
          {/* Social Login Buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => console.log("Google login")}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Se connecter avec Google"
            >
              <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.788 5.108A9 9 0 1021 12h-8" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => console.log("Facebook login")}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Se connecter avec Facebook"
            >
              <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Pas encore de compte ?{" "}
            <Link href="/get-started" className="text-primary-600 hover:text-primary-700 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}