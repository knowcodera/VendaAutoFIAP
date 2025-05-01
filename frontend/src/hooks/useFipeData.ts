import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// URL da API FIPE
const FIPE_API_URL = 'https://parallelum.com.br/fipe/api/v1';

// Tipos para os dados da API FIPE
interface FipeBrand {
  codigo: string;
  nome: string;
}

interface FipeModel {
  codigo: string;
  nome: string;
}

interface FipeYear {
  codigo: string;
  nome: string;
}

interface FipePrice {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  SiglaCombustivel: string;
}

// Hook para buscar marcas de veículos
export const useFipeBrands = () => {
  return useQuery<FipeBrand[]>({
    queryKey: ['fipe', 'brands'],
    queryFn: () => 
      axios.get(`${FIPE_API_URL}/carros/marcas`).then(res => res.data),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};

// Hook para buscar modelos de uma marca específica
export const useFipeModels = (brandId: string | null) => {
  return useQuery<{ modelos: FipeModel[] }>({
    queryKey: ['fipe', 'models', brandId],
    queryFn: () => 
      axios.get(`${FIPE_API_URL}/carros/marcas/${brandId}/modelos`).then(res => res.data),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};

// Hook para buscar anos de um modelo específico
export const useFipeYears = (brandId: string | null, modelId: string | null) => {
  return useQuery<FipeYear[]>({
    queryKey: ['fipe', 'years', brandId, modelId],
    queryFn: () => 
      axios.get(`${FIPE_API_URL}/carros/marcas/${brandId}/modelos/${modelId}/anos`).then(res => res.data),
    enabled: !!brandId && !!modelId,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};

// Hook para buscar o preço de um veículo específico
export const useFipePrice = (brandId: string | null, modelId: string | null, yearId: string | null) => {
  return useQuery<FipePrice>({
    queryKey: ['fipe', 'price', brandId, modelId, yearId],
    queryFn: () => 
      axios.get(`${FIPE_API_URL}/carros/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`).then(res => res.data),
    enabled: !!brandId && !!modelId && !!yearId,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}; 