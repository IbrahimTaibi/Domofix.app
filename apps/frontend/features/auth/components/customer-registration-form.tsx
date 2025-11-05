"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/shared/components';
import { useAuth } from '../hooks/useAuth';

export function CustomerRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        ...formData,
        role: 'customer',
      });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Créer un compte client
        </h1>
        <p className="mt-2 text-gray-600">
          Rejoignez Domofix et accédez à des milliers de prestataires
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            type="text"
            placeholder="Prénom"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            name="lastName"
            type="text"
            placeholder="Nom"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          name="email"
          type="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}