import { Box, Typography, CircularProgress } from '@mui/material';
import VehicleCard from './VehicleCard';
import { Vehicle } from '@/types/vehicle';

export interface VehicleGridProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
  onSellClick?: (vehicle: Vehicle) => void;
  onEditClick?: (vehicle: Vehicle) => void;
  onDeleteClick?: (vehicle: Vehicle) => void;
  emptyMessage?: string;
}

export const VehicleGrid = ({
  vehicles,
  isLoading = false,
  onSellClick,
  onEditClick,
  onDeleteClick,
  emptyMessage = "Nenhum veículo encontrado"
}: VehicleGridProps) => {
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 4,
          minHeight: '300px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          minHeight: '300px'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1.5 }}>
      {vehicles.map((vehicle) => (
        <Box 
          key={vehicle.id} 
          sx={{ 
            width: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' },
            padding: 1.5
          }}
        >
          <VehicleCard
            vehicle={vehicle}
            onSellClick={onSellClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        </Box>
      ))}
    </Box>
  );
};

export default VehicleGrid; 