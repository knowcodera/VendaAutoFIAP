import { Seller } from '../types/seller';
import SellerCard from './SellerCard';
import { Grid, Box, Typography } from '@mui/material';

interface SellerGridProps {
  sellers: Seller[];
}

const SellerGrid = ({ sellers }: SellerGridProps) => {
  if (sellers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography color="text.secondary">Nenhum vendedor encontrado.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {sellers.map((seller) => (
        <Grid sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6', md: 'span 4' } }} key={seller.id}>
          <SellerCard seller={seller} />
        </Grid>
      ))}
    </Grid>
  );
};

export default SellerGrid; 