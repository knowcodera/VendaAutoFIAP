import { useState } from 'react';
import { useCreateSeller } from '../hooks/useSellers';
import SellerForm from './SellerForm';
import { SellerFormData } from '../types/seller';
import { useToast } from "@/components/material/feedback/ToastProvider";
import { Button } from '@/components/material/base/Button';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import {
  Dialog as MuiDialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
} from '@mui/material';

interface SellerFormDialogProps {
  onSellerCreated: (sellerId: number) => void;
}

const SellerFormDialog = ({ onSellerCreated }: SellerFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createSeller = useCreateSeller();
  const { showToast } = useToast();

  const handleSubmit = async (data: SellerFormData): Promise<void> => {
    setIsSubmitting(true);
    return new Promise((resolve, reject) => {
      createSeller.mutate(data, {
        onSuccess: (response) => {
          const newSellerId = response.data.id;
          showToast('Vendedor criado com sucesso.', "success");
          onSellerCreated(newSellerId);
          setOpen(false);
          setIsSubmitting(false);
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="outlined" 
        type="button" 
        onClick={handleOpen} 
        startIcon={<AddCircleOutline />}
        size="small"
        sx={{ mt: 2 }}
      >
        Novo Vendedor
      </Button>

      <MuiDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Novo Vendedor</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Preencha os dados do vendedor para cadastrá-lo no sistema.
          </DialogContentText>
          
          <SellerForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            submitLabel="Adicionar Vendedor"
          />
        </DialogContent>
      </MuiDialog>
    </>
  );
};

export default SellerFormDialog; 