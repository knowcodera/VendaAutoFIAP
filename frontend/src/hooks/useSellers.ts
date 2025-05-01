import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Seller, ApiSellersResponse, ApiSellerResponse, CreateSellerInput, UpdateSellerInput } from '../types/seller';

// URL da API - Backend rodando na porta 3000
const API_URL = 'http://localhost:3000/api';

// Fetch de todos os vendedores
export const useSellers = () => {
  return useQuery<ApiSellersResponse>({
    queryKey: ['sellers'],
    queryFn: () => 
      axios.get(`${API_URL}/sellers`).then(res => res.data)
  });
};

// Fetch de um vendedor específico
export const useSeller = (id: number) => {
  return useQuery<ApiSellerResponse>({
    queryKey: ['sellers', id],
    queryFn: () => 
      axios.get(`${API_URL}/sellers/${id}`).then(res => res.data),
    enabled: !!id
  });
};

// Criar um novo vendedor
export const useCreateSeller = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiSellerResponse, Error, CreateSellerInput>({
    mutationFn: (data: CreateSellerInput) => 
      axios.post(`${API_URL}/sellers`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    }
  });
};

// Atualizar um vendedor existente
export const useUpdateSeller = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiSellerResponse, Error, UpdateSellerInput>({
    mutationFn: (data: UpdateSellerInput) => 
      axios.put(`${API_URL}/sellers/${data.id}`, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['sellers', variables.id] });
    }
  });
};

// Excluir um vendedor
export const useDeleteSeller = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id: number) => 
      axios.delete(`${API_URL}/sellers/${id}`).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    }
  });
}; 