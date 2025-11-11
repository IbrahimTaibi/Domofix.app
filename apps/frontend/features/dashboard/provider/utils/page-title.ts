export interface PageMeta {
  title: string;
  subtitle?: string;
  lighten?: boolean;
}

export function pageMetaForPath(pathname?: string): PageMeta {
  const defaultMeta: PageMeta = {
    title: "Tableau de bord",
    subtitle: "Vue d’ensemble: activité, messages, et raccourcis.",
    lighten: true,
  };
  if (!pathname) return defaultMeta;

  const segs = pathname.split("/").filter(Boolean);
  // Expect: ["dashboard","provider", ...]
  if (segs[0] !== "dashboard" || segs[1] !== "provider") return defaultMeta;

  // Top-level pages under /dashboard/provider
  if (segs.length === 2) return defaultMeta;

  const third = segs[2];
  switch (third) {
    case "history":
      return { title: "Historique", subtitle: "Vos actions et demandes passées." };
    case "messages":
      return { title: "Messages", subtitle: "Conversations avec vos clients." };
    case "invoices":
      return { title: "Factures", subtitle: "Gérer vos facturations." };
    case "stock":
      return { title: "Stock", subtitle: "Suivi des articles et disponibilités." };
    case "requests": {
      const fourth = segs[3];
      switch (fourth) {
        case "toutes":
          return { title: "Toutes les demandes", subtitle: "Liste des demandes disponibles." };
        case "en-cours":
          return { title: "Demandes en cours", subtitle: "Vos demandes en progression." };
        case "proximite":
          return { title: "À proximité", subtitle: "Demandes proches de votre zone." };
        case "urgentes":
          return { title: "Demandes urgentes", subtitle: "Interventions prioritaires (Pro)." };
        default:
          return { title: "Demandes", subtitle: "Parcourez les demandes disponibles." };
      }
    }
    case "team": {
      const fourth = segs[3];
      switch (fourth) {
        case "membres":
          return { title: "Membres", subtitle: "Gérer votre équipe." };
        case "invitations":
          return { title: "Invitations", subtitle: "Envoyer et gérer les invitations." };
        case "roles":
          return { title: "Rôles et permissions", subtitle: "Définir les droits de l’équipe." };
        default:
          return { title: "Équipe", subtitle: "Organisation de votre équipe." };
      }
    }
    case "support": {
      const fourth = segs[3];
      switch (fourth) {
        case "assistance":
          return { title: "Assistance", subtitle: "Obtenir de l’aide." };
        case "bug":
          return { title: "Signaler un bug", subtitle: "Signalez un problème technique." };
        case "help":
          return { title: "Centre d’aide", subtitle: "Guides et FAQ." };
        default:
          return { title: "Support", subtitle: "Aide et support client." };
      }
    }
    case "settings": {
      const fourth = segs[3];
      switch (fourth) {
        case "profile":
          return { title: "Profil", subtitle: "Vos informations de compte." };
        case "preferences":
          return { title: "Préférences", subtitle: "Personnalisez l’expérience." };
        case "abonnements":
          return { title: "Abonnements", subtitle: "Gérer votre offre." };
        default:
          return { title: "Paramètres", subtitle: "Configurer votre compte." };
      }
    }
    default:
      return defaultMeta;
  }
}