export interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: string;
  cpf: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
  vehicles?: number[];
}

export interface SellerFormData {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: string;
  cpf: string;
  zipCode?: string;
}

export interface CreateSellerInput extends SellerFormData {}

export interface UpdateSellerInput extends SellerFormData {
  id: number;
}

export interface ApiSellerResponse {
  status: string;
  data: Seller;
}

export interface ApiSellersResponse {
  status: string;
  results: number;
  data: Seller[];
} 