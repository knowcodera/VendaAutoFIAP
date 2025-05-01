import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Stack, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { api } from '@/lib/api';
import { useToast } from '@/components/material/feedback/ToastProvider';

const SimulatePayment = () => {
  const { externalId } = useParams<{ externalId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulation = async (status: 'approved' | 'rejected') => {
    if (!externalId) {
      setError('ID Externo do pagamento não encontrado na URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.info(`Simulando webhook para externalId: ${externalId} com status: ${status}`);
      // Chamar o endpoint de webhook no backend
      // Enviando o ID e o status simulado no corpo
      await api.post('/webhooks/mercadopago', { 
        type: 'payment', // Tipo de notificação (pode variar)
        data: { 
          id: externalId // O ID que o webhook do MP normalmente enviaria
        },
        action: 'payment.updated', // Ação simulada
        // Adicionando o status simulado diretamente para o backend processar
        simulatedStatus: status 
      });

      showToast(`Pagamento simulado como ${status === 'approved' ? 'Aprovado' : 'Rejeitado'} com sucesso!`, 'success');
      
      // Navegar de volta para a lista de veículos após a simulação
      // Idealmente para a lista de veículos vendidos se aprovado
      if (status === 'approved') {
        navigate('/sold'); // TODO: Criar/Verificar rota /sold
      } else {
        navigate('/'); // Volta para a home/disponíveis se rejeitado
      }

    } catch (err: any) {
      console.error(`Erro ao simular webhook para ${externalId}:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro ao processar a simulação.';
      setError(errorMessage);
      showToast(`Erro na simulação: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 'sm', mx: 'auto', py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Simular Pagamento
        </Typography>
        <Typography textAlign="center" sx={{ mb: 3 }}>
          Pagamento referente ao ID Externo: 
          <Typography component="span" sx={{ fontWeight: 'bold', wordBreak: 'break-all' }}> {externalId || 'N/A'}</Typography>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} direction="row" justifyContent="center">
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            onClick={() => handleSimulation('approved')}
            disabled={isLoading || !externalId}
          >
            Simular Aprovado
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
            onClick={() => handleSimulation('rejected')}
            disabled={isLoading || !externalId}
          >
            Simular Rejeitado
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SimulatePayment; 