import { useToast } from "@/components/material/feedback/ToastProvider";
import { api } from "@/lib/api";
import Close from '@mui/icons-material/Close';
import Image from '@mui/icons-material/Image';
import Star from '@mui/icons-material/Star';
import Upload from '@mui/icons-material/Upload';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface VehicleImage {
  id: number;
  url: string;
  description: string | null; // Permitir nulo
  isPrimary: boolean;
}

interface VehicleImageUploadProps {
  vehicleId: number;
}

const VehicleImageUpload = ({ vehicleId }: VehicleImageUploadProps) => {
  const { showToast } = useToast(); // Usar showToast do Material
  const queryClient = useQueryClient(); // Obter instância
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading para fetch inicial
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();

  // Carregar imagens existentes
  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Verificação direta para garantir que temos um ID válido
      if (!vehicleId) {
        throw new Error("ID do veículo não fornecido");
      }

      const response = await api.get<{status: string; data: VehicleImage[]}>(`/vehicle-images/vehicle/${vehicleId}`);
      if (response.data.status === "success") {
        setImages(response.data.data || []);
      } else {
        throw new Error(response.data.status || "Failed to fetch images");
      }
    } catch (error: any) {
      console.error("Fetch images error:", error);
      setError("Não foi possível carregar as imagens. Verifique se o backend está rodando corretamente.");
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchImages();
    } else {
      setError("ID do veículo não fornecido");
    }
  }, [vehicleId]);

  // Gerar preview da imagem selecionada
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Selecione uma imagem para fazer upload", "warning");
      return;
    }

    if (!vehicleId) {
      showToast("ID do veículo não fornecido", "error");
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("description", description);
    formData.append("isPrimary", isPrimary.toString());

    try {
      const response = await api.post<{status: string}>(`/vehicle-images/upload/${vehicleId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "success") {
        showToast("Imagem enviada com sucesso", "success");
        setSelectedFile(null);
        setDescription("");
        setIsPrimary(false);
        fetchImages(); // Recarregar imagens neste componente
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }); // Invalidar cache da lista
      } else {
        throw new Error(response.data.status || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(`Não foi possível enviar a imagem: ${error.message}`);
      showToast("Erro ao enviar imagem. Verifique o console para mais detalhes.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    // Evitar requests desnecessários
    const currentImage = images.find(img => img.id === imageId);
    if (currentImage?.isPrimary) return;

    try {
      await api.patch(`/vehicle-images/set-primary/${imageId}/vehicle/${vehicleId}`, { isPrimary: true });
      showToast("Imagem definida como principal", "success");
      fetchImages(); // Recarregar para refletir a mudança neste componente
      queryClient.invalidateQueries({ queryKey: ['vehicles'] }); // Invalidar cache da lista
    } catch (error) {
      console.error("Set primary error:", error);
      showToast("Não foi possível definir a imagem como principal.", "error");
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await api.delete(`/vehicle-images/${imageId}`);
      showToast("Imagem excluída com sucesso", "success");
      fetchImages(); // Recarregar imagens neste componente
      queryClient.invalidateQueries({ queryKey: ['vehicles'] }); // Invalidar cache da lista
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Não foi possível excluir a imagem.", "error");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Para que o upload de imagens funcione corretamente, certifique-se que a API backend esteja sendo executada na porta 3000.
      </Alert>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Formulário de Upload */}
        <Box sx={{ flexBasis: '100%', md: { flexBasis: 'calc(33.333% - 16px)' } }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Nova Imagem</Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                component="label" // Permite que o botão acione o input file
                fullWidth
                startIcon={<Upload />}
              >
                Selecionar Imagem
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                />
              </Button>

              {previewUrl && (
                <Box sx={{ position: 'relative', height: 150, border: '1px dashed grey', borderRadius: 1, overflow: 'hidden' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              )}

              <TextField
                label="Descrição (Opcional)"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                size="small"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    size="small"
                  />
                }
                label="Definir como imagem principal"
              />

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                fullWidth
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
              >
                {isUploading ? "Enviando..." : "Enviar Imagem"}
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* Lista de Imagens Existentes */}
        <Box sx={{ flexBasis: '100%', md: { flexBasis: 'calc(66.666% - 16px)' } }}>
          <Typography variant="h6" gutterBottom>Imagens Existentes</Typography>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : images.length === 0 ? (
            <Paper elevation={1} sx={{ textAlign: 'center', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.secondary' }}>
              <Image sx={{ fontSize: 48, mb: 1 }} />
              <Typography>Nenhuma imagem cadastrada</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {images.map((img) => (
                <Box key={img.id} sx={{ flexBasis: '100%', sm: { flexBasis: 'calc(50% - 8px)' }, md: { flexBasis: 'calc(33.333% - 8px)' } }}>
                  <Card sx={{ position: 'relative', height: '100%' }}>
                     <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                       <img 
                           src={img.url.startsWith('/') ? `${apiUrl}${img.url}` : img.url}
                           alt={img.description || `Imagem ${img.id}`}
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                           loading="lazy"
                       />
                     </Box>
                     <CardContent sx={{ pt: 1, pb: '48px' }}> {/* Espaço para actions */} 
                       <Typography variant="body2" color="text.secondary" noWrap>
                         {img.description || "Sem descrição"}
                       </Typography>
                     </CardContent>
                     {/* Actions na base do card */}
                     <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1, display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(255, 255, 255, 0.8)' }}>
                        <IconButton 
                           size="small" 
                           color={img.isPrimary ? "primary" : "default"}
                           onClick={() => handleSetPrimary(img.id)}
                           disabled={img.isPrimary}
                           title="Definir como principal"
                           aria-label="Definir como imagem principal"
                           tabIndex={0}
                           disableRipple={false}
                         >
                           <Star fontSize="small" />
                         </IconButton>
                        <IconButton 
                           size="small" 
                           color="error"
                           onClick={() => handleDelete(img.id)}
                           title="Excluir imagem"
                           aria-label="Excluir imagem"
                           tabIndex={0}
                           disableRipple={false}
                         >
                           <Close fontSize="small" />
                         </IconButton>
                     </Box>
                   </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Botão Finalizar Cadastro */} 
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/')}
        >
          Finalizar Cadastro e Ver Veículos
        </Button>
      </Box>

    </Box>
  );
};

export default VehicleImageUpload; 