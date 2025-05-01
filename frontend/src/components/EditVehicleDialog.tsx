import { useState, useEffect } from "react";
import {
  Dialog as MuiDialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Tabs as MuiTabs,
  Tab as MuiTab,
  Box,
  CircularProgress,
  Typography
} from "@mui/material";
import { VehicleFormData } from "@/types/vehicle";
import { useVehicles } from "@/contexts/VehicleContext";
import FipeVehicleForm from "./FipeVehicleForm";
import VehicleImageUpload from "./VehicleImageUpload";
import { useVehicle } from "@/hooks/useVehicles";
import { TabPanel } from "@/components/material/utils/TabPanel";

interface EditVehicleDialogProps {
  vehicleId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditVehicleDialog = ({ vehicleId, open, onOpenChange }: EditVehicleDialogProps) => {
  const { updateVehicle } = useVehicles();
  const [activeTab, setActiveTab] = useState(0);

  const { data: vehicleData, isLoading, error, refetch } = useVehicle(vehicleId ?? 0);
  const vehicle = vehicleData?.data;

  useEffect(() => {
    if (open && vehicleId) {
      refetch();
    }
  }, [open, vehicleId, refetch]);

  const handleClose = () => {
    onOpenChange(false);
    setActiveTab(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    onOpenChange(false);
  };

  if (isLoading && open) {
    return (
      <MuiDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Carregando Veículo...</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </DialogContent>
      </MuiDialog>
    );
  }

  if (error && open) {
     return (
      <MuiDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Erro ao Carregar Veículo</DialogTitle>
        <DialogContent>
          <Typography color="error">Não foi possível carregar os dados do veículo. Tente novamente.</Typography>
        </DialogContent>
      </MuiDialog>
    );
  }

  if (!open || !vehicleId || !vehicle) {
    return null;
  }

  const initialData: VehicleFormData | undefined = vehicle ? {
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    price: vehicle.price,
    mileage: vehicle.mileage,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    condition: vehicle.condition,
    numberOfDoors: vehicle.numberOfDoors,
    description: vehicle.description ?? "",
    sellerId: vehicle.sellerId
  } : undefined;

  const handleSubmit = async (data: VehicleFormData) => {
    if (!vehicleId) return;
    await updateVehicle(vehicleId, data);
    onOpenChange(false);
  };

  return (
    <MuiDialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="edit-vehicle-title"
      keepMounted={false}
      disablePortal
    >
      <DialogTitle id="edit-vehicle-title">Editar Veículo</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <MuiTabs value={activeTab} onChange={handleTabChange} aria-label="Edição de veículo tabs">
            <MuiTab label="Dados do Veículo" id="edit-tab-0" aria-controls="edit-tabpanel-0" />
            <MuiTab label="Imagens" id="edit-tab-1" aria-controls="edit-tabpanel-1" />
          </MuiTabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
           <Box sx={{ p: 3 }}>
             {initialData ? (
              <FipeVehicleForm
                onSubmit={handleSubmit}
                initialData={initialData}
                submitLabel="Atualizar Veículo"
              />
             ) : (
               <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
             )}
           </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <VehicleImageUpload vehicleId={vehicleId} />
          </Box>
        </TabPanel>
      </DialogContent>
    </MuiDialog>
  );
};

export default EditVehicleDialog;
