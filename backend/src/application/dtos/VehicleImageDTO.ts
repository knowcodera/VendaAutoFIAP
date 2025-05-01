export interface VehicleImageDTO {
  id?: number;
  filename: string;
  path: string;
  url: string;
  description?: string;
  isPrimary: boolean;
  vehicleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleImageResponseDTO {
  id: number;
  filename: string;
  url: string;
  description?: string;
  isPrimary: boolean;
  vehicleId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleImageDTO {
  filename: string;
  path: string;
  url: string;
  description?: string;
  isPrimary: boolean;
  vehicleId: number;
}

export interface UpdateVehicleImageDTO {
  description?: string;
  isPrimary?: boolean;
} 