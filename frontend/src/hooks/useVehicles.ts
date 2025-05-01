import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Vehicle, ApiResponse, CreateVehicleInput, UpdateVehicleInput } from '../types/vehicle';
import { VehicleFiltersState } from '@/components/VehicleFilters';

// URL da API - Backend rodando na porta 3000
const API_URL = 'http://localhost:3000/api';

// Construir query params para filtros
const buildQueryParams = (filters?: VehicleFiltersState) => {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  // Adicionar parâmetros ao objeto URLSearchParams
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.model) params.append('model', filters.model);
  if (filters.minYear && filters.minYear > 1950) params.append('minYear', filters.minYear.toString());
  if (filters.maxYear && filters.maxYear < new Date().getFullYear()) params.append('maxYear', filters.maxYear.toString());
  if (filters.minPrice && filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice && filters.maxPrice < 500000) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.color) params.append('color', filters.color);
  if (filters.minKm && filters.minKm > 0) params.append('minMileage', filters.minKm.toString());
  if (filters.maxKm && filters.maxKm < 200000) params.append('maxMileage', filters.maxKm.toString());
  if (filters.fuelType) params.append('fuelType', filters.fuelType);
  if (filters.transmission) params.append('transmission', filters.transmission);
  if (filters.condition) params.append('condition', filters.condition);
  
  // Tratar ordenação
  if (filters.sortBy) {
    const [field, direction] = filters.sortBy.split('-');
    if (field && direction) {
      let sortField = 'price';
      
      // Mapear campos para os esperados pela API
      switch (field) {
        case 'price':
          sortField = 'price';
          break;
        case 'year':
          sortField = 'year';
          break;
        case 'created':
          sortField = 'createdAt';
          break;
        case 'km':
          sortField = 'mileage';
          break;
      }
      
      params.append('sortBy', sortField);
      params.append('sortDirection', direction);
    }
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// Fetch de todos os veículos com filtros
export const useVehicles = (filters?: VehicleFiltersState) => {
  const queryParams = buildQueryParams(filters);
  
  // Verificar se é para exibir apenas vendidos (não faz parte do VehicleFiltersState)
  const sold = filters && 'sold' in filters ? (filters as any).sold : false;
  
  const queryString = queryParams || (sold ? '?sold=true' : '');
  
  return useQuery<ApiResponse<Vehicle[]>>({
    queryKey: ['vehicles', { filters }],
    queryFn: () => 
      axios.get(`${API_URL}/vehicles${queryString}`).then(res => res.data)
  });
};

// Criação de veículo
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (vehicle: CreateVehicleInput) => 
      axios.post(`${API_URL}/vehicles`, vehicle).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });
};

// Busca de veículo por ID
export const useVehicle = (id: number) => {
  return useQuery<ApiResponse<Vehicle>>({
    queryKey: ['vehicle', id],
    queryFn: () => 
      axios.get(`${API_URL}/vehicles/${id}`).then(res => res.data),
    enabled: !!id
  });
};

// Registro de venda de veículo
export const useSellVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, buyerCPF }: { id: number; buyerCPF: string }) => {
      console.log(`[HOOK] Chamando endpoint de venda - ID: ${id}, CPF: ${buyerCPF}`);
      
      return axios.patch(`${API_URL}/vehicles/${id}/sell`, { buyerCPF })
        .then(res => {
          console.log('[HOOK] Resposta da API de venda:', res.data);
          return res.data;
        })
        .catch(error => {
          console.error('[HOOK] Erro ao chamar API de venda:', error);
          throw error;
        });
    },
    onSuccess: (data, { id }) => {
      console.log('[HOOK] Venda realizada com sucesso. Invalidando queries.');
      // Invalidar todas as queries de veículos
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Invalidar qualquer query que comece com 'vehicles'
          return Array.isArray(queryKey) && queryKey[0] === 'vehicles';
        }
      });
      // Invalidar também a query específica de veículos vendidos
      queryClient.invalidateQueries({ queryKey: ['vehiclesSold'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
    },
    onError: (error) => {
      console.error('[HOOK] Erro na mutação de venda:', error);
    }
  });
};

// Atualizar veículo
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehicleInput }) => 
      axios.put(`${API_URL}/vehicles/${id}`, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
    }
  });
};

// Excluir veículo
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      axios.delete(`${API_URL}/vehicles/${id}`).then(() => id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });
};

// Query específica para buscar apenas veículos vendidos
export const useVehiclesSold = () => {
  return useQuery<ApiResponse<Vehicle[]>>({
    queryKey: ['vehiclesSold'],
    queryFn: () => axios.get(`${API_URL}/vehicles?sold=true`).then(res => res.data),
  });
}; 