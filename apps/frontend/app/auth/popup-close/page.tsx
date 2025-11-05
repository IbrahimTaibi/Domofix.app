"use client";

import { useEffect } from "react";

export default function PopupClosePage() {
  useEffect(() => {
    try {
      // Notify opener that sign-in is complete
      window.opener?.postMessage({ type: "nextauth:signin", status: "success" }, window.location.origin);
    } catch {}
    // Close this popup window
    try { window.close(); } catch {}
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Authentification terminée. Cette fenêtre va se fermer.</p>
    </div>
  );
}