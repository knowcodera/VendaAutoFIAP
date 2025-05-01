import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSeller, useUpdateSeller } from '../hooks/useSellers';
import SellerForm from '../components/SellerForm';
import { SellerFormData } from '../types/seller';
import { useToast } from "@/components/material/feedback/ToastProvider";
import { Button } from '@/components/material/base/Button';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Loop from '@mui/icons-material/Loop';

const EditSeller = () => {
  const { id } = useParams<{ id: string }>();
  const sellerId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const { data, isLoading, error } = useSeller(sellerId);
  const updateSeller = useUpdateSeller();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast(error.message || 'Erro ao carregar vendedor.', "error");
      navigate('/sellers');
    }
  }, [error, navigate, showToast]);

  const handleSubmit = async (formData: SellerFormData): Promise<void> => {
    setIsSubmitting(true);
    return new Promise((resolve, reject) => {
      updateSeller.mutate(
        { id: sellerId, ...formData },
        {
          onSuccess: () => {
            showToast('Vendedor atualizado com sucesso.', "success");
            navigate('/sellers');
            setIsSubmitting(false);
            resolve();
          },
          onError: (error) => {
            showToast(error.message || 'Erro ao atualizar vendedor.', "error");
            setIsSubmitting(false);
            reject(error);
          }
        }
      );
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  const seller = data?.data;
  if (!seller) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
         <Typography color="error" sx={{ mb: 2 }}>Vendedor não encontrado.</Typography>
         <Button variant="outlined" onClick={() => navigate('/sellers')}>
           Voltar para lista de vendedores
         </Button>
       </Box>
    );
  }

  const initialData = {
    ...seller,
    birthDate: seller.birthDate ? new Date(seller.birthDate).toISOString().split('T')[0] : '',
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button variant="text" onClick={() => navigate('/sellers')} startIcon={<ArrowBack />} sx={{ mb: 2 }}>
          Voltar
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">Editar Vendedor</Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <SellerForm 
          onSubmit={handleSubmit} 
          initialData={initialData}
          isSubmitting={isSubmitting}
          submitLabel="Salvar Alterações"
        />
      </Paper>
    </Box>
  );
};

export default EditSeller; 