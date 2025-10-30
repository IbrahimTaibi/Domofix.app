"use client";

import { useState } from "react";
import { mockUsers, mockCredentials } from "@/lib/mock-data/users";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

export default function MockUsersInfo() {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'provider':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Utilisateurs de test disponibles
        </h3>
        <button
          onClick={() => setShowCredentials(!showCredentials)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {showCredentials ? (
            <>
              <EyeOff className="h-4 w-4" />
              Masquer mots de passe
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Afficher mots de passe
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getUserTypeColor(
                      user.userType
                    )}`}
                  >
                    {user.userType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{user.email}</span>
                  <button
                    onClick={() => copyToClipboard(user.email, user.email)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copier l'email"
                  >
                    {copiedEmail === user.email ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {showCredentials && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Mot de passe:</span>
                <code className="px-2 py-1 bg-gray-200 rounded text-gray-800">
                  {mockCredentials[user.email]}
                </code>
                <button
                  onClick={() => copyToClipboard(mockCredentials[user.email], `${user.email}-password`)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copier le mot de passe"
                >
                  {copiedEmail === `${user.email}-password` ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce:</strong> Utilisez ces comptes pour tester la fonctionnalité de connexion. 
          Chaque type d'utilisateur (customer, provider, admin) redirige vers une page différente après connexion.
        </p>
      </div>
    </div>
  );
}