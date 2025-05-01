import { useState } from 'react';
import { Seller } from '../types/seller';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  Box,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Button } from '@/components/material/base/Button';
import { useNavigate } from 'react-router-dom';
import { useDeleteSeller } from '../hooks/useSellers';
import { useToast } from "@/components/material/feedback/ToastProvider";

interface SellerCardProps {
  seller: Seller;
}

const SellerCard = ({ seller }: SellerCardProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const deleteSeller = useDeleteSeller();

  const handleEdit = () => {
    navigate(`/sellers/edit/${seller.id}`);
  };

  const handleDeleteClick = () => {
    if (seller.vehicles && seller.vehicles.length > 0) {
      showToast('Não é possível excluir um vendedor com veículos cadastrados.', 'warning');
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDeleteOpen(false);
  };

  const confirmDelete = () => {
    deleteSeller.mutate(seller.id, {
      onSuccess: () => {
        showToast('Vendedor excluído com sucesso.', 'success');
        handleCloseConfirm();
      },
      onError: (error) => {
        showToast(error.message || 'Erro ao excluir vendedor.', 'error');
        console.error('Erro ao excluir vendedor:', error);
        handleCloseConfirm();
      }
    });
  };

  const canDelete = !seller.vehicles || seller.vehicles.length === 0;

  return (
    <>
      <MuiCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={<Typography variant="h6">{seller.name}</Typography>}
          subheader={seller.email}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2"><strong>Telefone:</strong> {seller.phone}</Typography>
            <Typography variant="body2"><strong>CPF:</strong> {seller.cpf}</Typography>
            {seller.gender && <Typography variant="body2"><strong>Gênero:</strong> {seller.gender}</Typography>}
            {seller.zipCode && <Typography variant="body2"><strong>CEP:</strong> {seller.zipCode}</Typography>}
            <Typography variant="body2">
              <strong>Veículos:</strong> {' '}
              {seller.vehicles && seller.vehicles.length > 0
                ? `${seller.vehicles.length} veículo(s)`
                : 'Nenhum veículo'
              }
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button variant="outlined" size="small" onClick={handleEdit}>
            Editar
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={handleDeleteClick} 
            disabled={!canDelete}
            title={!canDelete ? "Exclua os veículos antes de remover o vendedor" : undefined}
          >
            Excluir
          </Button>
        </CardActions>
      </MuiCard>

      <MuiDialog
        open={confirmDeleteOpen}
        onClose={handleCloseConfirm}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <DialogTitle id="confirm-delete-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-description">
            Tem certeza que deseja excluir o vendedor "{seller.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="inherit">Cancelar</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            isLoading={deleteSeller.isPending}
            disabled={deleteSeller.isPending}
          >
            {deleteSeller.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </MuiDialog>
    </>
  );
};

export default SellerCard; 