import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSeller } from '../hooks/useSellers';
import SellerForm from '../components/SellerForm';
import { SellerFormData } from '../types/seller';
import { useToast } from "@/components/material/feedback/ToastProvider";
import { Button } from '@/components/material/base/Button';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Box, Typography, Paper } from '@mui/material';

const AddSeller = () => {
  const navigate = useNavigate();
  const createSeller = useCreateSeller();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (data: SellerFormData): Promise<void> => {
    setIsSubmitting(true);
    return new Promise((resolve, reject) => {
      createSeller.mutate(data, {
        onSuccess: () => {
          showToast('Vendedor criado com sucesso.', "success");
          navigate('/sellers');
          resolve();
        },
        onError: (error) => {
          showToast(error.message || 'Erro ao criar vendedor.', "error");
          setIsSubmitting(false);
          reject(error);
        }
      });
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button variant="text" onClick={() => navigate('/sellers')} startIcon={<ArrowBack />} sx={{ mb: 2 }}>
          Voltar
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">Adicionar Vendedor</Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <SellerForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          submitLabel="Adicionar Vendedor"
        />
      </Paper>
    </Box>
  );
};

export default AddSeller; 