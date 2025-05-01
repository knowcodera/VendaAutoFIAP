import { VehicleImageResponseDTO } from "./VehicleImageDTO";
import { PaymentStatus } from "../../domain/entities/Payment";

export interface CreateVehicleDTO {
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  numberOfDoors?: number;
  sellerId?: number;
  features?: string[];
}

export interface UpdateVehicleDTO {
  id: number;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  price?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  numberOfDoors?: number;
  features?: string[];
  description?: string;
}

export interface SellVehicleDTO {
  buyerCPF: string;
}

export interface VehicleResponseDTO {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  isSold: boolean;
  buyerCPF: string | null;
  saleDate?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  numberOfDoors?: number;
  sellerId?: number;
  primaryImageUrl?: string | null;
  images?: VehicleImageResponseDTO[];
  createdAt: Date;
  updatedAt: Date;
  paymentStatus?: PaymentStatus;
  paymentId?: number;
  paymentExternalId?: string | null;
} 