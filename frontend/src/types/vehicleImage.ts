export interface VehicleImage {
  id: number;
  filename: string;
  url: string;
  description?: string;
  isPrimary: boolean;
  vehicleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleImageInput {
  image: File;
  description?: string;
  isPrimary: boolean;
  vehicleId: number;
}

export interface UpdateVehicleImageInput {
  id: number;
  description?: string;
  isPrimary?: boolean;
}

export interface ApiVehicleImageResponse {
  status: string;
  data: VehicleImage;
}

export interface ApiVehicleImagesResponse {
  status: string;
  results: number;
  data: VehicleImage[];
} 