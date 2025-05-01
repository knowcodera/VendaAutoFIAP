import { useState, useEffect, useMemo } from "react";
import { useVehicles } from "@/contexts/VehicleContext";
import { Link } from "react-router-dom";
import SellVehicleDialog from "@/components/SellVehicleDialog";
import EditVehicleDialog from "@/components/EditVehicleDialog";

// Importações dos novos componentes Material
import { VehicleGrid } from "@/components/material/vehicles/VehicleGrid";
import { VehicleFilters, VehicleFiltersState } from "@/components/material/vehicles/VehicleFilters";
import { Dialog } from "@/components/material/feedback/Dialog";

// Material UI imports
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Paper,
  Chip
} from "@mui/material";

// Icons
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const AvailableVehicles = () => {
  const { availableVehicles, deleteVehicle } = useVehicles();
  const currentYear = new Date().getFullYear();
  
  // Estado para gerenciar diálogos
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [isSellDialogOpen, setSellDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Estado inicial dos filtros - agora começa vazio
  const initialFilters: VehicleFiltersState = {
    brand: "",
    model: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    minKm: "",
    maxKm: "",
    color: "",
    fuelType: "",
    transmission: "",
    condition: "",
    sortBy: "price-asc",
    filtersApplied: false
  };
  
  // Estado para os filtros ativos
  const [filters, setFilters] = useState<VehicleFiltersState>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Aplicar filtros aos veículos disponíveis
  const filteredVehicles = useMemo(() => {
    // Se os filtros não foram aplicados, retornar todos os veículos
    if (!filters.filtersApplied) {
      return availableVehicles;
    }
    
    return availableVehicles.filter(vehicle => {
      // Filtro de marca
      if (filters.brand && !vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }
      
      // Filtro de modelo
      if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
        return false;
      }
      
      // Filtro de ano
      const minYear = typeof filters.minYear === 'string' ? 
                    (filters.minYear === '' ? 0 : parseInt(filters.minYear)) : 
                    filters.minYear;
      const maxYear = typeof filters.maxYear === 'string' ? 
                    (filters.maxYear === '' ? 9999 : parseInt(filters.maxYear)) : 
                    filters.maxYear;
      
      if (minYear > 0 && vehicle.year < minYear) {
        return false;
      }
      
      if (maxYear < 9999 && vehicle.year > maxYear) {
        return false;
      }
      
      // Filtro de preço
      const minPrice = typeof filters.minPrice === 'string' ? 
                     (filters.minPrice === '' ? 0 : parseInt(filters.minPrice)) : 
                     filters.minPrice;
      const maxPrice = typeof filters.maxPrice === 'string' ? 
                     (filters.maxPrice === '' ? Number.MAX_SAFE_INTEGER : parseInt(filters.maxPrice)) : 
                     filters.maxPrice;
      
      if (minPrice > 0 && vehicle.price < minPrice) {
        return false;
      }
      
      if (maxPrice < Number.MAX_SAFE_INTEGER && vehicle.price > maxPrice) {
        return false;
      }
      
      // Filtro de cor
      if (filters.color && !vehicle.color.toLowerCase().includes(filters.color.toLowerCase())) {
        return false;
      }
      
      // Filtro de quilometragem
      const minKm = typeof filters.minKm === 'string' ? 
                  (filters.minKm === '' ? 0 : parseInt(filters.minKm)) : 
                  filters.minKm;
      const maxKm = typeof filters.maxKm === 'string' ? 
                  (filters.maxKm === '' ? Number.MAX_SAFE_INTEGER : parseInt(filters.maxKm)) : 
                  filters.maxKm;
      
      if (minKm > 0 && vehicle.mileage && vehicle.mileage < minKm) {
        return false;
      }
      
      if (maxKm < Number.MAX_SAFE_INTEGER && vehicle.mileage && vehicle.mileage > maxKm) {
        return false;
      }
      
      // Filtro de combustível
      if (filters.fuelType && vehicle.fuelType !== filters.fuelType) {
        return false;
      }
      
      // Filtro de câmbio
      if (filters.transmission && vehicle.transmission !== filters.transmission) {
        return false;
      }
      
      // Filtro de condição
      if (filters.condition && vehicle.condition !== filters.condition) {
        return false;
      }
      
      return true;
    });
  }, [availableVehicles, filters]);
  
  // Ordenar veículos com base na opção selecionada
  const sortedVehicles = useMemo(() => {
    const sorted = [...filteredVehicles];
    
    switch (filters.sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "year-asc":
        return sorted.sort((a, b) => a.year - b.year);
      case "year-desc":
        return sorted.sort((a, b) => b.year - a.year);
      case "created-desc":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "created-asc":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return sorted;
    }
  }, [filteredVehicles, filters.sortBy]);
  
  // Calcular quantidade de filtros ativos
  const filtersCount = useMemo(() => {
    if (!filters.filtersApplied) return 0;
    
    let count = 0;
    
    if (filters.brand) count++;
    if (filters.model) count++;
    if (filters.minYear) count++;
    if (filters.maxYear) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minKm) count++;
    if (filters.maxKm) count++;
    if (filters.color) count++;
    if (filters.fuelType) count++;
    if (filters.transmission) count++;
    if (filters.condition) count++;
    
    return count;
  }, [filters]);
  
  // Atualizar lista de filtros ativos para exibição
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filters.filtersApplied) {
      if (filters.brand) newActiveFilters.push(`Marca: ${filters.brand}`);
      if (filters.model) newActiveFilters.push(`Modelo: ${filters.model}`);
      if (filters.color) newActiveFilters.push(`Cor: ${filters.color}`);
      if (filters.fuelType) newActiveFilters.push(`Combustível: ${filters.fuelType}`);
      if (filters.transmission) newActiveFilters.push(`Câmbio: ${filters.transmission}`);
      if (filters.condition) newActiveFilters.push(`Condição: ${filters.condition}`);
      
      if (filters.minYear || filters.maxYear) {
        newActiveFilters.push(`Ano: ${filters.minYear || 'Min'} - ${filters.maxYear || 'Max'}`);
      }
      
      if (filters.minPrice || filters.maxPrice) {
        newActiveFilters.push(`Preço: ${filters.minPrice ? `R$${filters.minPrice}` : 'Min'} - ${filters.maxPrice ? `R$${filters.maxPrice}` : 'Max'}`);
      }
      
      if (filters.minKm || filters.maxKm) {
        newActiveFilters.push(`Km: ${filters.minKm || 'Min'} - ${filters.maxKm || 'Max'}`);
      }
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters]);
  
  // Manipulador para atualizar filtros
  const handleFilterChange = (newFilters: VehicleFiltersState) => {
    setFilters(newFilters);
  };
  
  // Manipulador para resetar filtros
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Manipuladores para ações nos veículos
  const handleSellClick = (vehicleId: number) => {
    setSelectedVehicle(vehicleId);
    setSellDialogOpen(true);
  };

  const handleEditClick = (vehicleId: number) => {
    setSelectedVehicle(vehicleId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (vehicleId: number) => {
    setSelectedVehicle(vehicleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedVehicle !== null) {
      await deleteVehicle(selectedVehicle);
    }
    setDeleteDialogOpen(false);
  };

  // Log para verificar os dados dos veículos antes de passar pro Grid
  console.log("[Debug Vehicles] Sorted Vehicles Data:", sortedVehicles);
  console.log("[Debug Filters] Active Filters:", filters);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Veículos Disponíveis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {sortedVehicles.length} veículos disponíveis para venda
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Componente de Filtros */}
      <VehicleFilters 
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        activeFilters={filters}
        filtersCount={filtersCount}
      />
      
      {/* Exibir tags de filtros ativos (opcional - caso não implemente no componente de filtros) */}
      {activeFilters.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <FilterAltIcon color="primary" />
          <Typography variant="body2" sx={{ mr: 1 }}>Filtros aplicados:</Typography>
          {activeFilters.map((filter, index) => (
            <Chip key={index} label={filter} size="small" color="primary" />
          ))}
          <Button 
            variant="text" 
            size="small"
            onClick={handleResetFilters}
          >
            Limpar todos
          </Button>
        </Box>
      )}

      {/* Grid de Veículos */}
      <VehicleGrid 
        vehicles={sortedVehicles} 
        onSellClick={(vehicle) => handleSellClick(vehicle.id)}
        onEditClick={(vehicle) => handleEditClick(vehicle.id)}
        onDeleteClick={(vehicle) => handleDeleteClick(vehicle.id)}
        emptyMessage={filters.filtersApplied 
          ? "Não há veículos disponíveis com os filtros selecionados" 
          : "Não há veículos disponíveis"
        } 
      />

      {/* Diálogos */}
      {selectedVehicle !== null && (
        <>
          <SellVehicleDialog
            vehicleId={selectedVehicle}
            open={isSellDialogOpen}
            onOpenChange={setSellDialogOpen}
          />
          
          <EditVehicleDialog
            vehicleId={selectedVehicle}
            open={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Tem certeza que deseja excluir?"
        description="Esta ação não pode ser desfeita. Este veículo será removido permanentemente do sistema."
        cancelText="Cancelar"
        confirmText="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );
};

export default AvailableVehicles; 