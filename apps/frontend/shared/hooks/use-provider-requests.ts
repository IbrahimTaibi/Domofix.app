"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Request, RequestStatus } from "@domofix/shared-types";
import {
  listProviderAllRequests,
  type ListRequestsParams,
} from "@/features/requests/services/requests-service";
import { useRequestsUiStore } from "@/shared/store/requests-ui-store";

export interface UseProviderRequestsResult {
  items: Request[];
  loading: boolean;
  error: string | null;
  status?: RequestStatus;
  setStatus: (s?: RequestStatus) => void;
  page: number;
  setPage: (p: number) => void;
  refresh: () => Promise<void>;
}

export function useProviderRequests(): UseProviderRequestsResult {
  const { status, page, limit, setStatus, setPage } = useRequestsUiStore();
  const [items, setItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListRequestsParams = { status, offset, limit };
      const res = await listProviderAllRequests(params);
      setItems(res);
    } catch (err: any) {
      let msg = "Impossible de charger les demandes";
      const statusCode =
        typeof err?.statusCode === "number" ? err.statusCode : 0;
      if (statusCode === 401)
        msg = "Veuillez vous connecter en tant que prestataire.";
      else if (statusCode === 403)
        msg = "Accès refusé. Réservé aux prestataires.";
      else if (typeof err?.message === "string") msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [status, offset, limit]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    items,
    loading,
    error,
    status,
    setStatus,
    page,
    setPage,
    refresh: fetchList,
  };
}
