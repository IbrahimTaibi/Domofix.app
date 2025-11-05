"use client";

import { useState } from "react";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import { useMobile } from "@/shared/hooks";

export default function SearchPreview() {
  const isMobile = useMobile();
  const [zipCode, setZipCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode) return;
    startSearch(zipCode);
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert(
        "La géolocalisation n’est pas prise en charge par votre navigateur. Veuillez saisir un code postal.",
      );
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = `${position.coords.latitude},${position.coords.longitude}`;
        startSearch(location);
      },
      (error) => {
        setIsLoading(false);
        let message = "Impossible d’obtenir votre position.";
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Autorisation de localisation refusée. Veuillez saisir un code postal.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Informations de localisation indisponibles. Veuillez saisir un code postal.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "La demande de localisation a expiré. Réessayez ou saisissez un code postal.";
        }
        alert(message);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0,
      },
    );
  };

  const startSearch = (location: string) => {
    setIsLoading(true);

    setTimeout(() => {
      setServiceCount(Math.floor(Math.random() * 200) + 100);
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm w-full max-w-md sm:max-w-xl mx-auto relative min-w-0">
      {/* Code postal */}
      {!showResults && (
        <div className="transition-all duration-500 opacity-100 translate-y-0">
          <form onSubmit={handleZipSubmit} className="space-y-3">
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Code postal"
                className={`px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-center ${isMobile ? 'w-full' : 'flex-1'}`}
                maxLength={5}
                pattern="[0-9]*"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !zipCode}
                className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-1 ${isMobile ? 'w-full' : 'w-auto'}`}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Rechercher"
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 disabled:opacity-50">
              <Navigation className="w-4 h-4" />
              Utiliser ma position
            </button>
          </form>
        </div>
      )}

      {/* Loading or Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
          <span className="text-sm text-gray-600">Recherche de services…</span>
        </div>
      ) : (
        serviceCount !== null &&
        showResults && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>
                  {serviceCount} services à {zipCode}
                </span>
              </div>
              <button
                onClick={() => {
                  setServiceCount(null);
                  setZipCode("");
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="text-primary-600 hover:text-primary-700 text-xs">
                Modifier
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des services…"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
