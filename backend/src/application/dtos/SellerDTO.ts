// src/application/dtos/SellerDTO.ts

// DTO para criação de vendedor
export interface CreateSellerDTO {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: Date;
  cpf: string;
  zipCode?: string;
}

// DTO para atualização de vendedor
export interface UpdateSellerDTO {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthDate?: Date;
  cpf?: string;
  zipCode?: string;
}

// DTO para resposta de vendedor
export interface SellerResponseDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: Date;
  cpf: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
  vehicles?: number[]; // IDs dos veículos relacionados
} 