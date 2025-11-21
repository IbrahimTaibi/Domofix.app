import { ServiceCategory } from '@domofix/shared-types'

export const CATEGORY_LABELS: Record<string, string> = {
  [ServiceCategory.PLUMBER]: 'Plombier',
  [ServiceCategory.ELECTRICIAN]: 'Électricien',
  [ServiceCategory.CLEANER]: 'Agent d\'entretien',
  [ServiceCategory.CARPENTER]: 'Menuisier',
  [ServiceCategory.PAINTER]: 'Peintre',
  [ServiceCategory.GARDENER]: 'Jardinier',
  [ServiceCategory.BARBER]: 'Coiffeur/Barbier',
  [ServiceCategory.DELIVERY]: 'Livraison',
  [ServiceCategory.TUTOR]: 'Tuteur',
  [ServiceCategory.OTHER]: 'Autre',
}

export function getCategoryLabel(category: string | ServiceCategory): string {
  return CATEGORY_LABELS[category] || category
}
