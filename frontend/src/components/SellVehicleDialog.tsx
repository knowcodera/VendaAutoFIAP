import { useState, useEffect } from "react";
import { useToast } from "@/components/material/feedback/ToastProvider";
import { useVehicles } from "@/contexts/VehicleContext";
import {
  Dialog as MuiDialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  Alert,
  Box
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SellVehicleDialogProps {
  vehicleId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SellVehicleDialog = ({ vehicleId, open, onOpenChange }: SellVehicleDialogProps) => {
  const { sellVehicle, refetchVehicles } = useVehicles();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");

  // Log para verificar estado de isSubmitting na renderização
  console.log("[SellVehicleDialog] Rendering, isSubmitting:", isSubmitting);

  useEffect(() => {
    console.log("[SellVehicleDialog] Dialog opened for vehicleId:", vehicleId);
  }, [vehicleId, open]);

  const handleDialogClose = () => {
    console.log("[SellVehicleDialog] Closing dialog");
    setCpf("");
    setError(null);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSubmitWithContext = async (e: React.FormEvent) => {
    console.log("[SellVehicleDialog] handleSubmitWithContext INICIADA!");
    e.preventDefault();
    console.log("[SellVehicleDialog] Submetendo registro de venda (passo 1: criar pagamento pendente)");

    if (!cpf || cpf.trim().length < 11) {
      setError("Por favor, insira um CPF válido.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let pendingPaymentResult: any = null; // Variável para armazenar resultado do passo 1
    console.log("[SellVehicleDialog] Iniciando bloco TRY principal...");

    try {
      // Passo 1: Chamar a API para iniciar a venda e criar o pagamento PENDING
      console.log("[SellVehicleDialog] PREPARANDO para chamar sellVehicle...");
      pendingPaymentResult = await sellVehicle(vehicleId, cpf);
      console.log("[SellVehicleDialog] sellVehicle RETORNOU:", pendingPaymentResult);
      
      console.log("[SellVehicleDialog] Passo 1 (startSale) retornou:", pendingPaymentResult);

      if (!pendingPaymentResult?.externalId) {
        // Se não tivermos o externalId, algo deu errado no passo 1
        throw new Error(pendingPaymentResult?.message || "Falha ao iniciar processo de venda. ID externo não encontrado.");
      }

      const externalId = pendingPaymentResult.externalId;
      console.log(`[SellVehicleDialog] Passo 1 concluído. External ID: ${externalId}. Iniciando Passo 2 (simulação webhook)...`);

      // Passo 2: Chamar o endpoint de simulação de webhook imediatamente
      try {
        const webhookUrl = '/api/webhooks/mercadopago'; 
        console.log(`[SellVehicleDialog] PREPARANDO para chamar POST ${webhookUrl} com externalId: ${externalId}`);
        
        const response = await axios.post(webhookUrl, {
          data: { id: externalId },
          simulatedStatus: 'approved' 
        });

        console.log("[SellVehicleDialog] Passo 2 (simulação webhook) CHAMADA BEM-SUCEDIDA. Resposta:", response.status, response.data);

        // Se ambos os passos foram bem-sucedidos:
        showToast(`Venda registrada e pagamento simulado com sucesso!`, "success");
        // Invalidar as queries e forçar o refetch manualmente
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['vehiclesSold'] });
        await refetchVehicles(); // Adicionado para garantir a atualização dos dados no contexto
        
        // Fechar o diálogo e navegar para a página de veículos vendidos
        handleDialogClose();
        
        // Pequeno timeout para garantir que as queries foram revalidadas
        setTimeout(() => {
          window.location.href = '/sold-vehicles';
        }, 300); // Delay de 300ms antes de redirecionar

      } catch (webhookError: any) {
        console.error("[SellVehicleDialog] ERRO DETALHADO no Passo 2 (simulação webhook):", webhookError);
        if (axios.isAxiosError(webhookError)) {
          console.error("[SellVehicleDialog] Erro Axios - Status:", webhookError.response?.status);
          console.error("[SellVehicleDialog] Erro Axios - Data:", webhookError.response?.data);
        }
        // Se a simulação falhar, informamos o usuário.
        // O pagamento ainda estará PENDING no backend.
        const webhookErrorMessage = webhookError.response?.data?.message || webhookError.message || 'Falha ao simular aprovação do pagamento.';
        // Manter o erro original para o catch externo tratar e exibir
        throw new Error(`Venda iniciada, mas falha na simulação: ${webhookErrorMessage}`);
      }

    } catch (error: any) {
      // Trata erros do Passo 1 ou o erro lançado pelo catch do Passo 2
      console.error("[SellVehicleDialog] Erro durante o processo de venda/simulação:", error);
      let errorMessage = 'Erro desconhecido';
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        errorMessage = error.response.data?.message || 'Já existe um processo de venda pendente para este veículo.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Exibir o erro final para o usuário
      setError(`Falha ao registrar venda: ${errorMessage}`);
      console.error(`[SellVehicleDialog] ERRO FINAL CAPTURADO: ${errorMessage}`, error);
    } finally {
      setIsSubmitting(false);
      console.log("[SellVehicleDialog] Bloco FINALLY executado.");
    }
  };

  return (
    <MuiDialog open={open} onClose={handleDialogClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar Venda</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Digite qualquer CPF para registrar a venda (validação desabilitada para teste).
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmitWithContext} id="sell-vehicle-form">
          <TextField
            label="CPF do Comprador"
            fullWidth
            required
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite qualquer valor como CPF"
            sx={{ mb: 2 }}
            onFocus={() => console.log("[SellVehicleDialog] Campo CPF recebeu foco")}
          />
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button onClick={handleDialogClose} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button 
              // type="submit"
              onClick={handleSubmitWithContext}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processando..." : "Registrar Venda"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </MuiDialog>
  );
};

export default SellVehicleDialog;
