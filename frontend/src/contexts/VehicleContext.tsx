import React, { createContext, useContext, useState, useEffect } from "react";
import { Vehicle, VehicleFormData, StartSaleApiResponse } from "@/types/vehicle";
import { PaymentResponseDTO } from "@/types/payment";
import { toast } from "sonner";
import { 
  useVehicles as useVehiclesQuery, 
  useCreateVehicle, 
  useUpdateVehicle, 
  useSellVehicle, 
  useDeleteVehicle 
} from "../hooks/useVehicles";

interface VehicleContextType {
  vehicles: Vehicle[];
  availableVehicles: Vehicle[];
  soldVehicles: Vehicle[];
  addVehicle: (data: VehicleFormData) => Promise<any>;
  updateVehicle: (id: number, data: VehicleFormData) => Promise<void>;
  sellVehicle: (id: number, buyerCPF: string) => Promise<PaymentResponseDTO | undefined>;
  deleteVehicle: (id: number) => Promise<void>;
  isLoading: boolean;
  error: unknown;
  refetchVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error("useVehicles must be used within a VehicleProvider");
  }
  return context;
};

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Consulta de veículos com TanStack Query
  const { data: vehiclesData, isLoading, error, refetch } = useVehiclesQuery();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const sellVehicleMutation = useSellVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  
  // Estado para veículos
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Função para atualizar manualmente os veículos
  const refetchVehicles = async () => {
    console.log("[VehicleContext] Chamando refetch(). Estado atual:", vehicles); // Log antes
    const result = await refetch();
    console.log("[VehicleContext] refetch() concluído. Resultado da API:", result.data?.data); // Log dados da API
    if (result.data) {
      const newVehicles = result.data.data || [];
      setVehicles(newVehicles);
      console.log("[VehicleContext] Estado 'vehicles' atualizado após refetch:", newVehicles); // Log depois
    } else {
      console.warn("[VehicleContext] refetch() não retornou dados.");
    }
  };
  
  // Atualiza o estado local quando os dados da API são carregados
  useEffect(() => {
    if (vehiclesData && vehiclesData.data) {
      console.log("[VehicleContext useEffect] Dados recebidos da API via useVehiclesQuery:", vehiclesData.data); // Log no useEffect
      setVehicles(vehiclesData.data);
      console.log("[VehicleContext useEffect] Estado 'vehicles' definido:", vehiclesData.data); // Log no useEffect
    }
  }, [vehiclesData]);

  const availableVehicles = vehicles
    .filter(vehicle => !vehicle.sold)
    .sort((a, b) => a.price - b.price);

  const soldVehicles = vehicles
    .filter(vehicle => vehicle.sold)
    .sort((a, b) => a.price - b.price);

  // Adicionar veículo
  const addVehicle = async (data: VehicleFormData) => {
    try {
      const result = await createVehicleMutation.mutateAsync(data);
      await refetchVehicles(); // Recarregar os veículos após criar um novo
      toast.success("Veículo adicionado com sucesso!");
      return result;
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      toast.error("Erro ao adicionar veículo. Tente novamente.");
      throw error;
    }
  };

  // Atualizar veículo
  const updateVehicle = async (id: number, data: VehicleFormData) => {
    try {
      await updateVehicleMutation.mutateAsync({ id, data });
      await refetchVehicles(); // Recarregar os veículos após atualização
      toast.success("Veículo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      toast.error("Erro ao atualizar veículo. Tente novamente.");
      throw error;
    }
  };

  // Registrar venda de veículo (agora inicia o processo)
  const sellVehicle = async (id: number, buyerCPF: string): Promise<PaymentResponseDTO | undefined> => {
    try {
      console.log("[VehicleContext] Iniciando venda do veículo", id, "com CPF", buyerCPF);
      
      // Verificar se o ID é válido
      if (isNaN(id) || id <= 0) {
        console.error("[VehicleContext] ID de veículo inválido:", id);
        throw new Error("ID de veículo inválido");
      }
      
      console.log("[VehicleContext] Chamando mutation de venda com ID:", id);
      const result: StartSaleApiResponse = await sellVehicleMutation.mutateAsync({ id, buyerCPF });
      
      console.log("[VehicleContext] Mutation de início de venda retornou:", result);
      
      // Retornar o objeto de pagamento de dentro dos dados
      return result.data?.payment;
    } catch (error) {
      console.error("[VehicleContext] Erro ao registrar venda:", error);
      toast.error("Erro ao registrar venda. Tente novamente.");
      throw error;
    }
  };

  // Excluir veículo
  const deleteVehicle = async (id: number) => {
    try {
      await deleteVehicleMutation.mutateAsync(id);
      await refetchVehicles(); // Recarregar os veículos após exclusão
      toast.success("Veículo removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover veículo:", error);
      toast.error("Erro ao remover veículo. Tente novamente.");
      throw error;
    }
  };

  return (
    <VehicleContext.Provider 
      value={{ 
        vehicles, 
        availableVehicles, 
        soldVehicles, 
        addVehicle, 
        updateVehicle, 
        sellVehicle,
        deleteVehicle,
        isLoading,
        error,
        refetchVehicles
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};
