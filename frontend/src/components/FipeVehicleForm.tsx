import { useEffect, useState, ChangeEvent, useRef } from "react";
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
  SelectChangeEvent
} from "@mui/material";
import { Button } from "@/components/material/base/Button";
import { VehicleFormData } from "@/types/vehicle";
import { useFipeBrands, useFipeModels, useFipeYears, useFipePrice } from "@/hooks/useFipeData";
import { useSellers } from "@/hooks/useSellers";
import { formatCurrency } from "@/utils/format";

interface FipeVehicleFormProps {
  onSubmit: (data: VehicleFormData) => Promise<void>;
  initialData?: VehicleFormData;
  submitLabel?: string;
}

const formSchema = z.object({
  brand: z.string().min(1, 'A marca é obrigatória'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  year: z.string().min(4, 'O ano é obrigatório'),
  color: z.string().min(1, 'A cor é obrigatória'),
  price: z.number().positive('O preço deve ser positivo'),
  mileage: z.number().nonnegative('A quilometragem não pode ser negativa').optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  numberOfDoors: z.number().int().positive().optional(),
  description: z.string().optional(),
  sellerId: z.number().int().positive().optional(),
});

const FipeVehicleForm = ({
  onSubmit,
  initialData = { 
    brand: "", 
    model: "", 
    year: new Date().getFullYear(), 
    color: "", 
    price: 0,
    mileage: 0,
    fuelType: "",
    transmission: "",
    condition: "" 
  },
  submitLabel = "Salvar"
}: FipeVehicleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  
  // Refs para controlar atualizações
  const initialLoadedRef = useRef(false);
  const fipeDataProcessedRef = useRef(false);
  const lastProcessedPrice = useRef<number | null>(null);
  
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  
  const { data: brands, isLoading: isLoadingBrands } = useFipeBrands();
  const { data: modelsData, isLoading: isLoadingModels } = useFipeModels(selectedBrandId);
  const { data: years, isLoading: isLoadingYears } = useFipeYears(selectedBrandId, selectedModelId);
  const { data: priceData, isLoading: isLoadingPrice } = useFipePrice(selectedBrandId, selectedModelId, selectedYearId);
  
  // Fetch sellers for dropdown
  const { data: sellersData, isLoading: isLoadingSellers } = useSellers();
  const sellers = sellersData?.data || [];
  
  const { control, handleSubmit, setValue, reset, formState: { errors }, getValues } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: initialData.brand,
      model: initialData.model,
      year: initialData.year.toString(),
      color: initialData.color,
      price: initialData.price,
      mileage: initialData.mileage,
      fuelType: initialData.fuelType || "unspecified",
      transmission: initialData.transmission || "unspecified",
      condition: initialData.condition || "unspecified",
      numberOfDoors: initialData.numberOfDoors,
      description: initialData.description,
      sellerId: initialData.sellerId,
    },
  });

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      reset({
        ...initialData,
        year: initialData.year.toString(),
        fuelType: initialData.fuelType || "unspecified",
        transmission: initialData.transmission || "unspecified",
        condition: initialData.condition || "unspecified"
      });
      setPriceInput(formatCurrency(initialData.price).replace("R$", "").trim());
    }
  }, [initialData]);

  // Atualizar preço da FIPE quando os dados chegarem
  useEffect(() => {
    // Apenas processa os dados da FIPE se:
    // 1. Temos dados de preço
    // 2. Não estamos carregando
    // 3. Os dados são diferentes dos processados anteriormente
    if (priceData?.Valor && !isLoadingPrice && !fipeDataProcessedRef.current) {
      try {
        const numericValue = parseFloat(priceData.Valor.replace(/[^\d,]/g, '').replace(',', '.'));
        if (lastProcessedPrice.current !== numericValue) {
          lastProcessedPrice.current = numericValue;
          setValue('price', numericValue);
          setPriceInput(formatCurrency(numericValue).replace("R$", "").trim());
          fipeDataProcessedRef.current = true;
        }
      } catch (e) {
        console.error("Erro ao processar preço FIPE:", e);
      }
    }
  }, [priceData, isLoadingPrice]);

  // Resetar flag de processamento quando muda o ano
  useEffect(() => {
    fipeDataProcessedRef.current = false;
  }, [selectedYearId]);

  const FUEL_TYPES = [
    { value: "gasolina", label: "Gasolina" },
    { value: "etanol", label: "Etanol" },
    { value: "flex", label: "Flex" },
    { value: "diesel", label: "Diesel" },
    { value: "eletrico", label: "Elétrico" },
    { value: "hibrido", label: "Híbrido" }
  ];

  const TRANSMISSION_TYPES = [
    { value: "manual", label: "Manual" },
    { value: "automatico", label: "Automático" },
    { value: "cvt", label: "CVT" },
    { value: "semi-automatico", label: "Semi-automático" }
  ];

  const VEHICLE_CONDITIONS = [
    { value: "novo", label: "Novo" },
    { value: "usado", label: "Usado" }
  ];

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('[FipeVehicleForm] handleFormSubmit triggered', data);
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      const formattedData: VehicleFormData = {
        brand: data.brand || "", 
        model: data.model || "", 
        year: parseInt(data.year, 10) || new Date().getFullYear(), 
        color: data.color || "", 
        price: data.price || 0, 
        mileage: data.mileage ? Number(data.mileage) : undefined,
        fuelType: data.fuelType === "unspecified" ? undefined : data.fuelType, 
        transmission: data.transmission === "unspecified" ? undefined : data.transmission, 
        condition: data.condition === "unspecified" ? undefined : data.condition, 
        numberOfDoors: data.numberOfDoors ? Number(data.numberOfDoors) : undefined,
        sellerId: data.sellerId ? Number(data.sellerId) : undefined,
        description: data.description || undefined,
      };
      
      await onSubmit(formattedData);
      setIsSuccess(true);
      
      if (!initialData?.brand) {
        reset({ 
          brand: "", model: "", year: new Date().getFullYear().toString(), 
          color: "", price: 0, mileage: 0, fuelType: "", 
          transmission: "", condition: "", numberOfDoors: undefined,
          description: "", sellerId: undefined 
        });
        setPriceInput("");
        setSelectedBrandId("");
        setSelectedModelId("");
        setSelectedYearId("");
      }
      
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError("Erro ao processar o formulário. Verifique os dados e tente novamente.");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value.replace(/\D/g, '');
      const numericValue = value ? parseFloat(value) / 100 : 0;
      setValue('price', numericValue, { shouldValidate: true });
      setPriceInput(value ? formatCurrency(numericValue).replace("R$", "").trim() : "");
      lastProcessedPrice.current = numericValue; // Atualiza ref para evitar sobrescrever com dados da FIPE
    } catch (e) {
      console.error("Erro ao processar input de preço:", e);
    }
  };

  const handleBrandChange = (event: SelectChangeEvent<string>) => {
    const brandId = event.target.value;
    setSelectedBrandId(brandId || "");
    setSelectedModelId("");
    setSelectedYearId("");
    const selectedBrand = brands?.find(brand => brand.codigo === brandId);
    setValue('brand', selectedBrand?.nome || '');
    setValue('model', '');
    setValue('year', '');
    setValue('price', 0);
    setPriceInput("");
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    const modelId = event.target.value;
    setSelectedModelId(modelId || "");
    setSelectedYearId("");
    const selectedModel = modelsData?.modelos.find(model => model.codigo === modelId);
    setValue('model', selectedModel?.nome || '');
    setValue('year', '');
    setValue('price', 0);
    setPriceInput("");
  };

  // --- Função para extrair detalhes e limpar campos ---
  const extractAndSetVehicleDetails = (modelName: string, yearName: string) => {
    console.log("[Debug FIPE] Inputs:", { modelName, yearName }); // <-- LOG 1
    let cleanModel = modelName;
    let extractedDoors: number | undefined = undefined;
    let extractedFuel: string | undefined = undefined;

    // 1. Extrair Número de Portas (ex: " 4p", " 2p")
    const doorMatch = modelName.match(/\s(\d)p($|\s)/i);
    console.log("[Debug FIPE] Door Match:", doorMatch); // <-- LOG 2
    if (doorMatch && doorMatch[1]) {
      extractedDoors = parseInt(doorMatch[1], 10);
      // Remover a parte das portas do modelo
      cleanModel = cleanModel.replace(doorMatch[0], doorMatch[2] || ''); // Substitui pelo char final ou vazio
    }

    // 2. Extrair Tipo de Combustível (prioriza yearName)
    const fuelKeywords = {
      gasolina: "gasolina",
      diesel: "diesel",
      flex: "flex",
      etanol: "etanol",
      alcool: "etanol", // Mapear Alcool para etanol
      elétrico: "eletrico", // Com acento
      eletrico: "eletrico", // Sem acento
      hibrido: "hibrido",
      híbrido: "hibrido" // Com acento
    };
    
    const searchString = `${yearName} ${modelName}`.toLowerCase();
    console.log("[Debug FIPE] Search String for Fuel:", searchString); // <-- LOG 3

    for (const keyword in fuelKeywords) {
      if (searchString.includes(keyword)) {
        extractedFuel = fuelKeywords[keyword as keyof typeof fuelKeywords];
        console.log("[Debug FIPE] Fuel Keyword Found:", keyword, "->", extractedFuel); // <-- LOG 4
        // Remover keyword encontrada do modelo (apenas se veio do modelo)
        if (modelName.toLowerCase().includes(keyword)) {
          // Usar regex para remover a palavra exata, case-insensitive
          const regex = new RegExp(`\\s?${keyword}\\s?`, 'i');
          cleanModel = cleanModel.replace(regex, ' ').trim();
        }
        break; // Encontrou, pode parar
      }
    }

    // 3. Atualizar formulário
    console.log("[Debug FIPE] Final Values:", { cleanModel, extractedDoors, extractedFuel }); // <-- LOG 5
    setValue('model', cleanModel.trim(), { shouldValidate: true });
    if (extractedDoors) {
      setValue('numberOfDoors', extractedDoors, { shouldValidate: true });
    }
    if (extractedFuel) {
      setValue('fuelType', extractedFuel, { shouldValidate: true });
    } else {
       // Se nenhum combustível foi extraído, definir como não especificado ou manter o atual?
       // Vamos manter o valor atual ou o default 'unspecified' por enquanto.
       // Poderia ser setado para 'unspecified' se estivesse vazio antes:
       // if (!getValues('fuelType') || getValues('fuelType') === 'unspecified') {
       //   setValue('fuelType', 'unspecified'); 
       // }
    }
  };
  // --- Fim da função --- 

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    console.log('[FipeVehicleForm] handleYearChange triggered');
    const yearId = event.target.value;
    setSelectedYearId(yearId || "");
    const selectedYear = years?.find(year => year.codigo === yearId);
    
    if (selectedYear) {
      // Definir o ano numérico corretamente
      const numericYear = parseInt(selectedYear.codigo.split('-')[0], 10);
      setValue('year', numericYear.toString(), { shouldValidate: true });

      // Chamar a função de extração
      const currentModelName = getValues('model'); // Pegar nome atual do modelo
      if (currentModelName) {
         extractAndSetVehicleDetails(currentModelName, selectedYear.nome);
      }

      // Resetar o preço para buscar da FIPE
      setValue('price', 0);
      setPriceInput("");
      fipeDataProcessedRef.current = false; // Permitir que o useEffect do preço atualize
    } else {
      setValue('year', '');
      setValue('price', 0);
      setPriceInput("");
    }
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
      
      <Stack spacing={2}>
        <FormControl fullWidth error={!!errors.brand} disabled={isLoadingBrands}>
          <InputLabel>Marca (FIPE)</InputLabel>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="brand-label"
                value={selectedBrandId || ''}
                label="Marca (FIPE)"
                onChange={(e) => {
                  const event = e as SelectChangeEvent<string>;
                  handleBrandChange(event);
                }}
                disabled={field.disabled || isLoadingBrands}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true
                }}
              >
                <MenuItem value="" disabled>Selecione uma marca</MenuItem>
                {brands?.map((brand) => (
                  <MenuItem key={brand.codigo} value={brand.codigo}>
                    {brand.nome}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.brand && <FormHelperText>{errors.brand.message}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth error={!!errors.model} disabled={!selectedBrandId || isLoadingModels}>
          <InputLabel>Modelo (FIPE)</InputLabel>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="model-label"
                value={selectedModelId || ''}
                label="Modelo (FIPE)"
                onChange={(e) => {
                  const event = e as SelectChangeEvent<string>;
                  handleModelChange(event);
                }}
                disabled={field.disabled || !selectedBrandId}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true
                }}
              >
                <MenuItem value="" disabled>{selectedBrandId ? "Selecione um modelo" : "Selecione a marca"}</MenuItem>
                {modelsData?.modelos.map((model) => (
                  <MenuItem key={model.codigo} value={model.codigo}>
                    {model.nome}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.model && <FormHelperText>{errors.model.message}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth error={!!errors.year} disabled={!selectedModelId || isLoadingYears}>
          <InputLabel>Ano (FIPE)</InputLabel>
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="year-label"
                value={selectedYearId || ''}
                label="Ano (FIPE)"
                onChange={(e) => {
                  const event = e as SelectChangeEvent<string>;
                  handleYearChange(event);
                }}
                disabled={field.disabled || !selectedModelId}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true
                }}
              >
                <MenuItem value="" disabled>{selectedModelId ? "Selecione um ano" : "Selecione o modelo"}</MenuItem>
                {years?.map((year) => (
                  <MenuItem key={year.codigo} value={year.codigo}>
                    {year.nome}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
           {errors.year && <FormHelperText>{errors.year.message}</FormHelperText>}
        </FormControl>
        
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cor"
              fullWidth
              error={!!errors.color}
              helperText={errors.color?.message}
            />
          )}
        />
        
        <Controller
          name="price"
          control={control}
          render={({ field: { onBlur, ref } }) => (
            <TextField
              label="Preço"
              fullWidth
              value={priceInput}
              onChange={handlePriceInputChange}
              onBlur={onBlur}
              inputRef={ref}
              error={!!errors.price}
              helperText={errors.price ? errors.price.message : (isLoadingPrice ? 'Buscando preço FIPE...' : '')}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              disabled={isLoadingPrice}
            />
          )}
        />
        
        <Controller
          name="mileage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Quilometragem (Opcional)"
              type="number"
              fullWidth
              value={field.value === 0 ? '' : field.value} 
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || value === '0') {
                  field.onChange(0);
                } else {
                  field.onChange(Number(value));
                }
              }}
              error={!!errors.mileage}
              helperText={errors.mileage?.message}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
                inputProps: { min: 0 } 
              }}
            />
          )}
        />

        <FormControl fullWidth error={!!errors.fuelType}>
          <InputLabel>Combustível (Opcional)</InputLabel>
          <Controller
            name="fuelType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="fuel-type-label"
                label="Combustível (Opcional)"
                value={field.value || "unspecified"}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true
                }}
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

        <FormControl fullWidth error={!!errors.transmission}>
          <InputLabel>Câmbio (Opcional)</InputLabel>
          <Controller
            name="transmission"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="transmission-label"
                label="Câmbio (Opcional)"
                value={field.value || "unspecified"}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true
                }}
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

        <FormControl fullWidth error={!!errors.condition}>
          <InputLabel>Condição (Opcional)</InputLabel>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="condition-label"
                label="Condição (Opcional)"
                value={field.value || "unspecified"}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true
                }}
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

        <FormControl fullWidth error={!!errors.sellerId}>
          <InputLabel>Vendedor (Opcional)</InputLabel>
          <Controller
            name="sellerId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="seller-label"
                label="Vendedor (Opcional)"
                value={field.value || ""}
                MenuProps={{
                  disablePortal: true,
                  keepMounted: true,
                  autoFocus: false
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? undefined : Number(value));
                }}
              >
                <MenuItem value="">Nenhum vendedor</MenuItem>
                {sellers.map((seller) => (
                  <MenuItem key={seller.id} value={seller.id}>
                    {seller.name} ({seller.cpf})
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.sellerId && <FormHelperText>{errors.sellerId.message}</FormHelperText>}
        </FormControl>

        <Controller
          name="numberOfDoors"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Número de Portas"
              type="number"
              fullWidth
              error={!!errors.numberOfDoors}
              helperText={errors.numberOfDoors?.message}
              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
              value={field.value ?? ''}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
        />

        <Button 
          type="submit" 
          isLoading={isSubmitting} 
          disabled={isSubmitting}
          fullWidth
          variant="contained"
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};

export default FipeVehicleForm; 