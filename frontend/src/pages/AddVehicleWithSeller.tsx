import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateVehicle } from '../hooks/useVehicles';
import { useCreateSeller } from '../hooks/useSellers';
import { useToast } from "@/components/material/feedback/ToastProvider";
import { Button } from '@/components/material/base/Button';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ChevronRight from '@mui/icons-material/ChevronRight';
import VehicleForm from '../components/VehicleForm';
import SellerForm from '../components/SellerForm';
import { VehicleFormData } from '../types/vehicle';
import { SellerFormData } from '../types/seller';
import { Box, Typography, Paper, Stack, CircularProgress } from '@mui/material';
import { TabContext, TabList, TabPanel as MuiTabPanel } from '@mui/lab';
import Tab from '@mui/material/Tab';

const AddVehicleWithSeller = () => {
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const createSeller = useCreateSeller();
  const { showToast } = useToast();
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [isSubmittingSeller, setIsSubmittingSeller] = useState(false);
  const [step, setStep] = useState<'seller' | 'vehicle'>('seller');
  const [newSellerId, setNewSellerId] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("0");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleSubmitSeller = async (data: SellerFormData): Promise<void> => {
    setIsSubmittingSeller(true);
    return new Promise((resolve, reject) => {
      createSeller.mutate(data, {
        onSuccess: (response) => {
          const sellerId = response.data.id;
          setNewSellerId(sellerId);
          showToast('Vendedor criado com sucesso. Continue para o veículo.', "success");
          setStep('vehicle');
          setIsSubmittingSeller(false);
          resolve();
        },
        onError: (error) => {
          showToast(error.message || 'Erro ao criar vendedor.', "error");
          setIsSubmittingSeller(false);
          reject(error);
        }
      });
    });
  };

  const handleSubmitVehicle = async (data: VehicleFormData) => {
    setIsSubmittingVehicle(true);
    if (newSellerId && !data.sellerId) {
      data.sellerId = newSellerId;
    }
    try {
      await createVehicle.mutateAsync(data);
      showToast('Veículo cadastrado com sucesso.', "success");
      navigate('/vehicles');
    } catch (error: any) {
      showToast(error.message || 'Erro ao cadastrar veículo.', "error");
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button variant="text" onClick={() => navigate('/vehicles')} startIcon={<ArrowBack />} sx={{ mb: 2 }}>
          Voltar para Veículos
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">Cadastrar Veículo com Vendedor</Typography>
        <Typography color="text.secondary">
          Cadastre um novo veículo com informações do vendedor.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 0 }}>
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <TabList onChange={handleTabChange} aria-label="Opções de cadastro">
              <Tab label="Fluxo Completo" value="0" />
              <Tab label="Apenas Veículo" value="1" />
            </TabList>
          </Box>
          
          <MuiTabPanel value="0">
            {step === 'seller' ? (
              <Stack spacing={2}>
                <Typography variant="h6" component="h2" sx={{ mt: 1 }}>1. Informações do Vendedor</Typography>
                <SellerForm 
                  onSubmit={handleSubmitSeller} 
                  isSubmitting={isSubmittingSeller}
                  submitLabel="Salvar Vendedor e Avançar"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    type="button" 
                    onClick={() => setStep('vehicle')} 
                    endIcon={<ChevronRight />}
                    variant="text"
                  >
                    Pular esta etapa
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography variant="h6" component="h2" sx={{ mt: 1 }}>2. Informações do Veículo</Typography>
                <VehicleForm 
                  onSubmit={handleSubmitVehicle} 
                  initialData={{
                    brand: "",
                    model: "",
                    year: new Date().getFullYear(),
                    color: "",
                    price: 0,
                    sellerId: newSellerId
                  }}
                  submitLabel="Cadastrar Veículo"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={() => setStep('seller')}
                    startIcon={<ArrowBack />}
                  >
                    Voltar para Vendedor
                  </Button>
                </Box>
              </Stack>
            )}
          </MuiTabPanel>
          
          <MuiTabPanel value="1">
             <Stack spacing={2}>
                <Typography variant="h6" component="h2" sx={{ mt: 1 }}>Informações do Veículo</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Você pode selecionar um vendedor existente ou criar um novo diretamente do formulário.
                </Typography>
                <VehicleForm 
                  onSubmit={handleSubmitVehicle} 
                  submitLabel="Cadastrar Veículo"
                />
              </Stack>
          </MuiTabPanel>
        </TabContext>
      </Paper>
    </Box>
  );
};

export default AddVehicleWithSeller; 