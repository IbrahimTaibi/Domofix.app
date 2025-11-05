// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Service Types
export enum ServiceCategory {
  PLUMBER = 'plumber',
  BARBER = 'barber',
  CLEANER = 'cleaner',
  TUTOR = 'tutor',
  DELIVERY = 'delivery',
  ELECTRICIAN = 'electrician',
  CARPENTER = 'carpenter',
  PAINTER = 'painter',
  GARDENER = 'gardener',
  OTHER = 'other',
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  providerId: string;
  price: number;
  duration: number; // in minutes
  images?: string[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  services: Service[];
  rating: number;
  reviewCount: number;
  yearsOfExperience?: number;
  certifications?: string[];
  profileImage?: string;
  availability?: Availability;
  pricingRange?: {
    min: number;
    max: number;
  };
}

export interface Availability {
  days: string[]; // ['monday', 'tuesday', etc.]
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timeZone?: string;
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  providerId: string;
  status: BookingStatus;
  bookingDate: Date;
  scheduledDate: Date;
  scheduledTime: string;
  location: Location;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Search and Filter Types
export interface SearchFilters {
  category?: ServiceCategory;
  location?: Location;
  radius?: number; // in kilometers
  minRating?: number;
  maxPrice?: number;
  availability?: Date;
}

export interface SearchResult {
  services: Service[];
  providers: Provider[];
  total: number;
}