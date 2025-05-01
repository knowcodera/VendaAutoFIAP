import { useState, useEffect, ChangeEvent } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  Stack,
  Alert,
  InputAdornment,
  CircularProgress,
  Grid
} from "@mui/material";
import { Button } from "@/components/material/base/Button";
import { VehicleFormData } from "@/types/vehicle";
import { useSellers } from "@/hooks/useSellers";
import { Seller } from "../types/seller";
import { formatCurrency } from "@/utils/format";
import SellerFormDialog from "./SellerFormDialog";
import { useToast } from "@/components/material/feedback/ToastProvider";

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => Promise<void>;
  initialData?: VehicleFormData;
  submitLabel?: string;
}

const formSchema = z.object({
  brand: z.string().min(1, 'A marca é obrigatória'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  year: z.coerce
    .number()
    .int()
    .min(1886, 'O ano deve ser pelo menos 1886')
    .max(new Date().getFullYear() + 1, 'O ano não pode ser futuro'),
  color: z.string().min(1, 'A cor é obrigatória'),
  price: z.coerce.number().positive('O preço deve ser positivo'),
  mileage: z.coerce.number().nonnegative('A quilometragem não pode ser negativa').optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  numberOfDoors: z.coerce.number().int().positive('Número de portas inválido').optional(),
  sellerId: z.coerce.number().int().positive().optional(),
  description: z.string().optional(),
});

const VehicleForm = ({
  onSubmit,
  initialData,
  submitLabel = "Salvar"
}: VehicleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  // Buscar vendedores
  const { data: sellersData, isLoading: isLoadingSellers, refetch: refetchSellers } = useSellers();
  const sellers = sellersData?.data || [];
  const { showToast } = useToast();

  const defaultValues: VehicleFormData = {
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    year: initialData?.year || new Date().getFullYear(),
    color: initialData?.color || "",
    price: initialData?.price || 0,
    mileage: initialData?.mileage || 0,
    fuelType: initialData?.fuelType || "unspecified",
    transmission: initialData?.transmission || "unspecified",
    condition: initialData?.condition || "unspecified",
    numberOfDoors: initialData?.numberOfDoors || 4, // Valor padrão razoável
    sellerId: initialData?.sellerId || 0, // Remover newSellerId e usar 0 como padrão
    description: initialData?.description || "",
  };

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // Atualizar campos com dados iniciais
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        mileage: initialData.mileage ?? undefined,
        numberOfDoors: initialData.numberOfDoors ?? undefined,
        sellerId: initialData.sellerId ?? undefined,
        fuelType: initialData.fuelType || "",
        transmission: initialData.transmission || "",
        condition: initialData.condition || "",
        description: initialData.description || "",
      });
      setPriceInput(initialData.price ? formatCurrency(initialData.price).replace("R$", "").trim() : "");
    }
  }, [initialData, reset]);

  // Listas para selects manuais (iguais ao FipeVehicleForm)
  const FUEL_TYPES = [
    { value: "gasolina", label: "Gasolina" }, { value: "etanol", label: "Etanol" },
    { value: "flex", label: "Flex" }, { value: "diesel", label: "Diesel" },
    { value: "eletrico", label: "Elétrico" }, { value: "hibrido", label: "Híbrido" }
  ];
  const TRANSMISSION_TYPES = [
    { value: "manual", label: "Manual" }, { value: "automatico", label: "Automático" },
    { value: "cvt", label: "CVT" }, { value: "semi-automatico", label: "Semi-automático" }
  ];
  const VEHICLE_CONDITIONS = [
    { value: "novo", label: "Novo" }, { value: "usado", label: "Usado" }
  ];

  // Submissão do formulário
  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const formattedData: VehicleFormData = {
        ...data,
        // Campos opcionais numéricos tratados
        mileage: data.mileage,
        numberOfDoors: data.numberOfDoors,
        sellerId: data.sellerId,
        // Campos opcionais de string tratados (enviar undefined se vazio)
        fuelType: data.fuelType || undefined,
        transmission: data.transmission || undefined,
        condition: data.condition || undefined,
        description: data.description || undefined,
      };

      await onSubmit(formattedData);
      setIsSuccess(true);

      // Resetar apenas se for um novo veículo (sem initialData)
      if (!initialData) {
        reset({
          brand: "", model: "", year: new Date().getFullYear(), color: "", price: 0,
          mileage: undefined, fuelType: "", transmission: "", condition: "",
          numberOfDoors: undefined, sellerId: undefined, description: ""
        });
        setPriceInput("");
      }

      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError("Erro ao processar o formulário. Verifique os dados e tente novamente.");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador para o campo de preço formatado
  const handlePriceInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = value ? parseFloat(value) / 100 : 0;
    setValue('price', numericValue, { shouldValidate: true });
    setPriceInput(value ? formatCurrency(numericValue).replace("R$", "").trim() : "");
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ width: '100%' }}>
      {isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Veículo processado com sucesso!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Linha 1: Marca, Modelo */}
        <Grid item xs={12} md={6}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Marca"
                fullWidth
                required
                error={!!errors.brand}
                helperText={errors.brand?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Modelo"
                fullWidth
                required
                error={!!errors.model}
                helperText={errors.model?.message}
              />
            )}
          />
        </Grid>

        {/* Linha 2: Ano, Cor, Portas */}
        <Grid item xs={12} md={4}>
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Ano"
                type="number"
                fullWidth
                required
                error={!!errors.year}
                helperText={errors.year?.message}
                InputProps={{
                  inputProps: { min: 1886, max: new Date().getFullYear() + 1 } 
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cor"
                fullWidth
                required
                error={!!errors.color}
                helperText={errors.color?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
           <Controller
            name="numberOfDoors"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nº de Portas (Opcional)"
                type="number"
                fullWidth
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                error={!!errors.numberOfDoors}
                helperText={errors.numberOfDoors?.message}
                InputProps={{ inputProps: { min: 1 } }}
              />
            )}
          />
        </Grid>

        {/* Linha 3: Preço, Quilometragem */}
        <Grid item xs={12} md={6}>
          <Controller
            name="price"
            control={control}
            render={({ field: { onBlur, ref } }) => (
              <TextField
                label="Preço"
                fullWidth
                required
                value={priceInput}
                onChange={handlePriceInputChange}
                onBlur={onBlur}
                inputRef={ref}
                error={!!errors.price}
                helperText={errors.price?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="mileage"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quilometragem (Opcional)"
                type="number"
                fullWidth
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                error={!!errors.mileage}
                helperText={errors.mileage?.message}
                InputProps={{
                  endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  inputProps: { min: 0 }
                }}
              />
            )}
          />
        </Grid>

        {/* Linha 4: Combustível, Câmbio, Condição */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.fuelType}>
            <InputLabel>Combustível (Opcional)</InputLabel>
            <Controller
              name="fuelType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Combustível (Opcional)"
                >
                  <MenuItem value="unspecified">*Não especificado*</MenuItem>
                  {FUEL_TYPES.map((fuel) => (
                    <MenuItem key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.fuelType && <FormHelperText>{errors.fuelType.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.transmission}>
            <InputLabel>Câmbio (Opcional)</InputLabel>
            <Controller
              name="transmission"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Câmbio (Opcional)"
                >
                  <MenuItem value="unspecified">*Não especificado*</MenuItem>
                  {TRANSMISSION_TYPES.map((transmission) => (
                    <MenuItem key={transmission.value} value={transmission.value}>
                      {transmission.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.transmission && <FormHelperText>{errors.transmission.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.condition}>
            <InputLabel>Condição (Opcional)</InputLabel>
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Condição (Opcional)"
                >
                  <MenuItem value="unspecified">*Não especificado*</MenuItem>
                  {VEHICLE_CONDITIONS.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.condition && <FormHelperText>{errors.condition.message}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Linha 5: Vendedor */}
        <Grid item xs={12}>
           <FormControl fullWidth error={!!errors.sellerId} disabled={isLoadingSellers}>
            <InputLabel>Vendedor (Opcional)</InputLabel>
            <Controller
              name="sellerId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? 0}
                  label="Vendedor (Opcional)"
                >
                  <MenuItem value={0}>*Nenhum Vendedor Associado*</MenuItem>
                  {sellers.map((seller) => (
                    <MenuItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
             {errors.sellerId && <FormHelperText>{errors.sellerId.message}</FormHelperText>}
          </FormControl>
        </Grid>

         {/* Linha 6: Descrição */}
         <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descrição (Opcional)"
                multiline
                rows={3}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>
        
        {/* Botão de Submissão */}
        <Grid item xs={12}>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            variant="contained"
            sx={{ mt: 2 }} // Adicionar margem superior
          >
            {submitLabel}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleForm;
