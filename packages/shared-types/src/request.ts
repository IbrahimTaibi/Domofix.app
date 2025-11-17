import { Address, User } from './auth';
import { Location, ServiceCategory } from './service';

// Request lifecycle status
export enum RequestStatus {
  OPEN = 'open',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

// Provider application to a request
export interface RequestApplication {
  providerId: string;
  message?: string;
  createdAt: string;
  proposedEts?: string;
  proposedPrice?: number;
  proposedPriceRange?: { min: number; max: number };
}

// Request entity used across client and server
export interface Request {
  id: string;
  customerId: string;
  address?: Address;
  location?: Location; // If using Maps geolocation
  phone: string;
  category: ServiceCategory;
  estimatedTimeOfService: string; // ISO string in UTC
  details?: string;
  photos?: string[];
  status: RequestStatus;
  applications: RequestApplication[];
  applicationsMeta?: Record<string, { name: string; avatar?: string }>;
  acceptedProviderId?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs for data transfer
export interface CreateRequestRequest {
  address?: Address;
  location?: Location;
  phone: string;
  category: ServiceCategory;
  estimatedTimeOfService: string; // ISO string; must be in future
  details?: string;
}

export interface ApplyForRequestRequest {
  message?: string;
  proposedEts?: string;
  proposedPrice?: number;
  proposedPriceMin?: number;
  proposedPriceMax?: number;
}

export interface AcceptProviderRequest {
  providerId: string;
}

export interface CompleteRequestRequest {}
