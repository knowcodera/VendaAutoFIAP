import { Link } from 'react-router-dom';
import { useSellers } from '../hooks/useSellers';
import SellerGrid from '../components/SellerGrid';
import { Button } from '@/components/material/base/Button';
import { CircularProgress, Typography, Box } from '@mui/material';

const SellersList = () => {
  const { data, isLoading, error } = useSellers();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography color="error">Erro ao carregar vendedores: {error.message}</Typography>
      </Box>
    );
  }

  const sellers = data?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Vendedores</Typography>
        <Button asChild variant="contained">
          <Link to="/sellers/add">Adicionar Vendedor</Link>
        </Button>
      </Box>

      <SellerGrid sellers={sellers} />
    </Box>
  );
};

export default SellersList; 