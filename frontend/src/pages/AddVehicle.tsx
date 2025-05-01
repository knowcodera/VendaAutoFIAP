import { useNavigate } from "react-router-dom";
// import { useVehicles } from "@/contexts/VehicleContext"; // Not used directly anymore
import { useCreateVehicle } from "@/hooks/useVehicles"; // Import the mutation hook
// import VehicleForm from "@/components/VehicleForm"; // Remove manual form
import { VehicleFormData } from "@/types/vehicle";
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Button } from "@/components/material/base/Button";
import { useState } from "react";
import FipeVehicleForm from "@/components/FipeVehicleForm";
import { Box, Typography, Paper, Alert, Tab, Tabs } from "@mui/material";
import VehicleImageUpload from "@/components/VehicleImageUpload";
import { TabPanel } from "@/components/material/utils/TabPanel"; // Importar o TabPanel

const AddVehicle = () => {
  // const { addVehicle } = useVehicles(); // Use mutation hook instead
  const createVehicle = useCreateVehicle();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newVehicleId, setNewVehicleId] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (data: VehicleFormData) => {
    console.log('[AddVehicle] handleSubmit triggered');
    setError(null);
    try {
      const response = await createVehicle.mutateAsync(data);
      setNewVehicleId(response.data.id);
      setActiveTab(1); // Mudar para a aba de imagens após cadastrar com sucesso
    } catch (err: any) {
      setError(err.message || "Falha ao cadastrar veículo. Por favor, tente novamente.");
      console.error("Failed to add vehicle:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto', py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="text" 
          size="small" 
          onClick={() => navigate(-1)} // Navigate back
          startIcon={<ArrowBack />}
          sx={{ mr: 1 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h2" fontWeight="bold">Cadastrar Novo Veículo</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="Abas de cadastro de veículo"
            sx={{ px: 2 }}
          >
            <Tab label="Dados do Veículo" id="tab-0" aria-controls="tabpanel-0" />
            <Tab 
              label="Imagens" 
              id="tab-1" 
              aria-controls="tabpanel-1" 
              disabled={!newVehicleId}
            />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <FipeVehicleForm 
              onSubmit={handleSubmit} 
              submitLabel="Adicionar Veículo" 
            />
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}> {/* Adjust margin/padding */}
              <Typography variant="body2" color="text.secondary" gutterBottom>Notas:</Typography>
              <Typography component="ul" variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <li>Este formulário utiliza a Tabela FIPE para preencher as informações.</li>
                <li>Selecione marca, modelo e ano.</li>
                <li>O preço FIPE será preenchido (você pode editá-lo).</li>
                <li>Após cadastrar o veículo, você poderá adicionar imagens na próxima aba.</li>
              </Typography>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            {newVehicleId ? (
              <VehicleImageUpload vehicleId={newVehicleId} />
            ) : (
              <Alert severity="info">
                Cadastre o veículo primeiro para poder adicionar imagens.
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AddVehicle;
