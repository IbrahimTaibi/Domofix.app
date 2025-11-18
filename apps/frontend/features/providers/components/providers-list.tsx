"use client";

import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import Button from "@/shared/components/button";
import { Star } from "lucide-react";
import type { ProviderSummary } from "@/features/providers/store/providers-selection-store";

export interface ProvidersListProps {
  providers: ProviderSummary[];
  request?: {
    id: string;
    category?: string;
    status?: string;
    estimatedTimeOfService?: string;
  } | null;
  selectedIds?: string[];
  avgPrice?: number | null;
  minPrice?: number | null;
  earliestEtsTime?: number | null;
  serviceId: string;
  onApprove: (providerId: string) => Promise<void> | void;
}

export default function ProvidersList({
  providers,
  request,
  selectedIds = [],
  avgPrice,
  minPrice,
  earliestEtsTime,
  serviceId,
  onApprove,
}: ProvidersListProps) {
  const isAccepted = request?.status === "accepted";
  const acceptedProviderId = (request as any)?.acceptedProviderId;

  return (
    <ul className="space-y-3">
      {providers.map((p) => {
        const isThisProviderAccepted = isAccepted && p.id === acceptedProviderId;

        return (
        <li
          key={p.id}
          className={`group relative overflow-hidden rounded-2xl border bg-white p-4 sm:p-6 shadow-sm ring-2 ${
            isThisProviderAccepted
              ? "ring-green-300 border-green-300 bg-green-50/30"
              : selectedIds.includes(p.id)
                ? "ring-primary-300 border-primary-300"
                : "ring-gray-200 border-gray-200"
          } transition hover:shadow-lg`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="inline-block w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-gray-900">
                    {p.name}
                  </span>
                  {isThisProviderAccepted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-300">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Approuvé
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200">
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    {p.rating ?? "N/A"}
                    <span className="text-[10px] text-yellow-600">
                      ({p.reviewCount ?? 0})
                    </span>
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {p.title || "Prestataire"}
                </div>
                {p.specialties?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.specialties.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-right">
                {p.proposedPriceRange ? (
                  <div className="text-sm font-semibold text-gray-900">
                    {p.proposedPriceRange.min}–{p.proposedPriceRange.max} DT
                  </div>
                ) : p.proposedPrice != null ? (
                  <div className="text-sm font-semibold text-gray-900">
                    {p.proposedPrice} DT
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Prix proposé N/A</div>
                )}
                {(() => {
                  const val = p.proposedPriceRange
                    ? p.proposedPriceRange.min
                    : (p.proposedPrice ?? null);
                  const isLowest =
                    minPrice != null && val != null && val === minPrice;
                  const save =
                    avgPrice != null && val != null
                      ? Math.max(0, Math.round(avgPrice - val))
                      : null;
                  return (
                    <div className="mt-2 flex flex-wrap items-center justify-end gap-1">
                      {isLowest ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                          Meilleur prix
                        </span>
                      ) : null}
                      {save && save > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
                          Économies ~{save} DT
                        </span>
                      ) : null}
                      {(p.rating ?? 0) >= 4.7 ? (
                        <span className="inline-flex rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] text-yellow-700 ring-1 ring-yellow-200">
                          Top note
                        </span>
                      ) : null}
                      {p.proposedEts &&
                      earliestEtsTime &&
                      new Date(p.proposedEts as any).getTime() ===
                        earliestEtsTime ? (
                        <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 ring-1 ring-indigo-200">
                          Rapide ETS
                        </span>
                      ) : null}
                      {(p.completedCount ?? 0) >= 10 ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-200">
                          Expérimenté
                        </span>
                      ) : null}
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">
                        Terminés {p.completedCount ?? 0}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            {p.proposedEts ? (
              <div>
                ETS: {format(new Date(p.proposedEts as any), "dd/MM HH:mm")}
              </div>
            ) : (
              <div className="text-gray-500">ETS N/A</div>
            )}
            <div className="mt-1">
              Categorie: {String(request?.category ?? "—")}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
            {(() => {
              const isAccepted = request?.status === "accepted";
              const isClosed = request?.status === "completed" || request?.status === "closed";
              const isDisabled = isAccepted || isClosed;

              return (
                <>
                  <Button
                    disabled={isDisabled}
                    onClick={async () => {
                      if (!isDisabled) await onApprove(p.id);
                    }}>
                    {isAccepted ? "Déjà approuvé" : "Approuver"}
                  </Button>
                </>
              );
            })()}
            <Link href={`/services/${serviceId}/providers/${p.id}`}>
              <Button variant="outline">Voir profil</Button>
            </Link>
          </div>
        </li>
        );
      })}
    </ul>
  );
}
