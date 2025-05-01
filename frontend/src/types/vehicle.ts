import { VehicleImage } from "./vehicleImage";
import { PaymentResponseDTO } from "./payment";

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  isSold: boolean;
  sold: boolean;
  buyerCPF: string | null;
  saleDate?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  createdAt: Date;
  updatedAt: Date;
  sellerId?: number;
  numberOfDoors?: number;
  description?: string;
  images?: VehicleImage[];
  primaryImageUrl?: string | null;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  results?: number;
  message?: string;
  errors?: any[];
}

export type CreateVehicleInput = Omit<Vehicle, 'id' | 'isSold' | 'sold' | 'buyerCPF' | 'saleDate' | 'createdAt' | 'updatedAt' | 'images'>;
export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface VehicleFormData {
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
  description?: string;
}

// Tipo para os dados retornados pela chamada de início de venda
export interface StartSaleResponseData {
  payment: PaymentResponseDTO;
}

// Renomear este tipo ou criar um novo para a resposta da API
// Vou criar um novo para clareza
export interface StartSaleApiResponse extends ApiResponse<StartSaleResponseData> {}
