import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography
} from '@mui/material';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SellIcon from '@mui/icons-material/Sell';
import SpeedIcon from '@mui/icons-material/Speed';
import { useState, useEffect } from 'react';

import { useVehicles } from '@/contexts/VehicleContext';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

// Atualizar a interface localmente para esperar a URL (o tipo global será atualizado depois)
interface VehicleWithImage extends Vehicle {
  primaryImageUrl?: string | null; 
}

export interface VehicleCardProps {
  vehicle: VehicleWithImage; // Usar a interface estendida
  onSellClick?: (vehicle: Vehicle) => void;
  onEditClick?: (vehicle: Vehicle) => void;
  onDeleteClick?: (vehicle: Vehicle) => void;
}

export const VehicleCard = ({ 
  vehicle, 
  onSellClick, 
  onEditClick,
  onDeleteClick
}: VehicleCardProps) => {
  // Log para verificar os dados recebidos pelo card
  console.log("[Debug Card] Vehicle Data:", vehicle);
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  useEffect(() => {
    if (vehicle.primaryImageUrl) {
      // Se a URL já for completa (começa com http), use-a diretamente
      if (vehicle.primaryImageUrl.startsWith('http')) {
        setImageUrl(vehicle.primaryImageUrl);
      } 
      // Se for um caminho relativo, adicione o prefixo da API
      else {
        setImageUrl(vehicle.primaryImageUrl.startsWith('/') 
          ? `${apiUrl}${vehicle.primaryImageUrl}`
          : `${apiUrl}/${vehicle.primaryImageUrl}`);
      }
    } else {
      setImageUrl(null);
    }
  }, [vehicle.primaryImageUrl, apiUrl]);

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { deleteVehicle } = useVehicles();
  
  // Função para mapear tipo de combustível para texto amigável
  const getFuelTypeText = (fuelType: string | undefined) => {
    const fuelTypes: Record<string, string> = {
      'gasolina': 'Gasolina',
      'etanol': 'Etanol',
      'flex': 'Flex',
      'diesel': 'Diesel',
      'eletrico': 'Elétrico',
      'hibrido': 'Híbrido'
    };
    
    return fuelType ? fuelTypes[fuelType] || fuelType : 'Não informado';
  };

  // Função para lidar com a exclusão do veículo
  const handleDelete = async () => {
    if (onDeleteClick) {
      onDeleteClick(vehicle);
    } else {
      await deleteVehicle(vehicle.id);
    }
    setDeleteDialogOpen(false);
  };
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      borderRadius: 2,
      boxShadow: 2,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        {/* Renderizar CardMedia apenas se houver imageUrl */}
        {imageUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          /* Fallback visual se não houver imageUrl */
          <Box sx={{ 
            height: 200, 
            bgcolor: 'grey.100', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'grey.500'
          }}>
            <DirectionsCarIcon sx={{ fontSize: 48, mr: 1 }} />
            <Typography variant="body1">Sem imagem</Typography>
          </Box>
        )}
        
        <Chip 
          label={vehicle.sold ? "Vendido" : "Disponível"} 
          color={vehicle.sold ? "error" : "primary"}
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            fontWeight: 'bold'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography gutterBottom variant="h6" component="div" noWrap fontWeight="bold">
            {vehicle.brand} {vehicle.model}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={<DirectionsCarIcon fontSize="small" />} 
              label={`${vehicle.year}`} 
              size="small" 
              variant="outlined"
            />
            
            {vehicle.fuelType && (
              <Chip 
                icon={<LocalGasStationIcon fontSize="small" />} 
                label={getFuelTypeText(vehicle.fuelType)} 
                size="small"
                variant="outlined"
              />
            )}
            
            {vehicle.mileage !== undefined && vehicle.mileage !== null && (
              <Chip 
                icon={<SpeedIcon fontSize="small" />} 
                label={`${vehicle.mileage.toLocaleString()} km`} 
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Cor: {vehicle.color}
            </Typography>
            
            {vehicle.transmission && (
              <Typography variant="body2" color="text.secondary">
                Câmbio: {vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1)}
              </Typography>
            )}
            
            {vehicle.condition && (
              <Typography variant="body2" color="text.secondary">
                Condição: {vehicle.condition === 'novo' ? 'Novo' : 'Usado'}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatCurrency(vehicle.price)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ 
        bgcolor: 'grey.50', 
        py: 1,
        px: 2,
        justifyContent: 'space-between'
      }}>
        {!vehicle.sold && (
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              startIcon={<SellIcon />}
              onClick={() => onSellClick && onSellClick(vehicle)}
              color="primary"
              variant="outlined"
            >
              Vender
            </Button>
            
            <IconButton 
              size="small" 
              color="info"
              onClick={() => onEditClick && onEditClick(vehicle)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
        
        <IconButton 
          size="small" 
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o veículo {vehicle.brand} {vehicle.model}?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default VehicleCard; 