import { useVehicles } from "@/contexts/VehicleContext";
import VehicleGrid from "@/components/material/vehicles/VehicleGrid.tsx";
import { useVehiclesSold } from "@/hooks/useVehicles";
import { useEffect } from "react";

const SoldVehicles = () => {
  // Usar o contexto apenas como fallback
  const { soldVehicles: contextSoldVehicles, refetchVehicles } = useVehicles();
  
  // Usar a query direta para veículos vendidos
  const { data: soldVehiclesQueryResult, refetch: refetchSoldVehicles } = useVehiclesSold();
  
  // Array de veículos vendidos com prioridade para dados da query direta
  const soldVehicles = soldVehiclesQueryResult?.data || contextSoldVehicles;
  
  // Refetch explícito ao montar o componente
  useEffect(() => {
    console.log("[SoldVehicles Page] Componente montado, executando refetch...");
    refetchSoldVehicles();
    refetchVehicles();
  }, [refetchSoldVehicles, refetchVehicles]);

  // Log para verificar o estado recebido do contexto
  console.log("[SoldVehicles Page] Rendering with soldVehicles:", soldVehicles);
  console.log("[SoldVehicles Page] Data from direct query:", soldVehiclesQueryResult?.data);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Veículos Vendidos</h2>
        <p className="text-muted-foreground">
          {soldVehicles?.length || 0} veículos já foram vendidos
        </p>
      </div>

      <VehicleGrid 
        vehicles={soldVehicles || []} 
        emptyMessage="Nenhum veículo foi vendido ainda" 
      />
    </div>
  );
};

export default SoldVehicles;
