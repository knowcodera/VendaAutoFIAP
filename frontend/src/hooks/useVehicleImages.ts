import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    ApiVehicleImageResponse,
    ApiVehicleImagesResponse,
    UpdateVehicleImageInput
} from '../types/vehicleImage';

// URL da API - Backend rodando na porta 3000
const API_URL = 'http://localhost:3000/api';

// Buscar todas as imagens de um veículo
export const useVehicleImages = (vehicleId: number | undefined) => {
  return useQuery<ApiVehicleImagesResponse>({
    queryKey: ['vehicleImages', vehicleId],
    queryFn: () => 
      axios.get(`${API_URL}/vehicle-images/vehicle/${vehicleId}`).then(res => res.data),
    enabled: !!vehicleId
  });
};

// Fazer upload de uma imagem para um veículo
export const useUploadVehicleImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    ApiVehicleImageResponse, 
    Error, 
    { vehicleId: number, file: File, description?: string, isPrimary?: boolean }
  >({
    mutationFn: ({ vehicleId, file, description, isPrimary }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      if (description) {
        formData.append('description', description);
      }
      
      if (isPrimary !== undefined) {
        formData.append('isPrimary', isPrimary.toString());
      }
      
      return axios.post(
        `${API_URL}/vehicle-images/upload/${vehicleId}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(res => res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicleImages', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });
};

// Atualizar uma imagem de veículo
export const useUpdateVehicleImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    ApiVehicleImageResponse, 
    Error, 
    { id: number, vehicleId: number, data: UpdateVehicleImageInput }
  >({
    mutationFn: ({ id, data }) => 
      axios.put(`${API_URL}/vehicle-images/${id}`, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicleImages', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });
};

// Excluir uma imagem de veículo
export const useDeleteVehicleImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { id: number, vehicleId: number }>({
    mutationFn: ({ id }) => 
      axios.delete(`${API_URL}/vehicle-images/${id}`).then(() => undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicleImages', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });
};

// Definir uma imagem como primária
export const useSetPrimaryVehicleImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { status: string, message: string }, 
    Error, 
    { vehicleId: number, imageId: number }
  >({
    mutationFn: ({ vehicleId, imageId }) => 
      axios.patch(`${API_URL}/vehicle-images/set-primary/${imageId}/vehicle/${vehicleId}`).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicleImages', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });
}; 