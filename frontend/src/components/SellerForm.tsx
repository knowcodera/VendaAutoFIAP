import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button as MuiButton
} from '@mui/material';
import { Button } from '@/components/material/base/Button';
import { SellerFormData } from '../types/seller';
import { formatCPF, formatPhone, formatZipCode, validateCPF } from '../utils/format';

// Schema de validação usando Zod
const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string()
    .min(10, 'Telefone inválido') // Min 10 para fixo/celular sem 9
    .refine(val => val.replace(/\D/g,'').length >= 10, 'Telefone inválido'),
  cpf: z.string()
    .min(11, 'CPF inválido')
    .refine(val => validateCPF(val.replace(/\D/g,'')), 'CPF inválido'),
  gender: z.string().optional(),
  birthDate: z.string().optional(), // Manter como string para <Input type="date">
  zipCode: z.string()
    .optional()
    .refine(val => !val || val.replace(/\D/g,'').length === 8, {
        message: 'CEP inválido'
    }),
});

interface SellerFormProps {
  onSubmit: (data: SellerFormData) => Promise<void>; // Tornar async
  initialData?: Partial<SellerFormData>;
  submitLabel?: string;
  isSubmitting?: boolean; // Receber isSubmitting como prop
}

const SellerForm = ({
  onSubmit,
  initialData = {},
  submitLabel = 'Salvar',
  isSubmitting = false, // Valor padrão
}: SellerFormProps) => {
  const [formattedCPF, setFormattedCPF] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [formattedZipCode, setFormattedZipCode] = useState("");
  const initialDataProcessedRef = useRef(false);

  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      cpf: initialData.cpf || '',
      gender: initialData.gender || '',
      birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : '', // Formatar para YYYY-MM-DD
      zipCode: initialData.zipCode || '',
    },
  });

  // Initialize formatted values and reset form if initial data changes
  useEffect(() => {
    if (!initialDataProcessedRef.current) {
      initialDataProcessedRef.current = true;
      
      const defaultValues = {
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          cpf: initialData.cpf || '',
          gender: initialData.gender || '',
          birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : '',
          zipCode: initialData.zipCode || '',
      };
      reset(defaultValues);

      setFormattedCPF(initialData.cpf ? formatCPF(initialData.cpf) : "");
      setFormattedPhone(initialData.phone ? formatPhone(initialData.phone) : "");
      setFormattedZipCode(initialData.zipCode ? formatZipCode(initialData.zipCode) : "");
    }
  }, [initialData, reset]);


  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    // Clean up formatting before submitting
    const cleanedData = {
      ...data,
      cpf: data.cpf.replace(/\D/g, ''),
      phone: data.phone.replace(/\D/g, ''),
      zipCode: data.zipCode ? data.zipCode.replace(/\D/g, '') : undefined,
      gender: data.gender || undefined, // Enviar undefined se vazio
      birthDate: data.birthDate || undefined, // Enviar undefined se vazio
    };
    await onSubmit(cleanedData as SellerFormData); // Chamar onSubmit passado como prop
  };

  // CPF handler
  const handleCPFChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cpfValue = e.target.value.replace(/\D/g, '').substring(0, 11);
    setValue('cpf', cpfValue, { shouldValidate: true });
    setFormattedCPF(cpfValue ? formatCPF(cpfValue) : "");
  };

  // Phone handler
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value.replace(/\D/g, '').substring(0, 11);
    setValue('phone', phoneValue, { shouldValidate: true });
    setFormattedPhone(phoneValue ? formatPhone(phoneValue) : "");
  };

  // ZipCode handler
  const handleZipCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const zipValue = e.target.value.replace(/\D/g, '').substring(0, 8);
    setValue('zipCode', zipValue, { shouldValidate: true });
    setFormattedZipCode(zipValue ? formatZipCode(zipValue) : "");
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid sx={{ gridColumn: '1 / -1' }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        <Grid sx={{ gridColumn: '1 / -1' }}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
          <Controller
            name="phone"
            control={control}
            render={({ field: { onBlur, ref } }) => (
              <TextField
                label="Telefone"
                fullWidth
                required
                value={formattedPhone}
                onChange={handlePhoneChange}
                onBlur={onBlur}
                inputRef={ref}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                placeholder="(00) 00000-0000"
              />
            )}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
           <Controller
            name="cpf"
            control={control}
            render={({ field: { onBlur, ref } }) => (
              <TextField
                label="CPF"
                fullWidth
                required
                value={formattedCPF}
                onChange={handleCPFChange}
                onBlur={onBlur}
                inputRef={ref}
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
                placeholder="000.000.000-00"
              />
            )}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel>Gênero (Opcional)</InputLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Gênero (Opcional)"
                >
                  <MenuItem value="unspecified">*Não especificado*</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="feminino">Feminino</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                </Select>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
               <TextField
                {...field}
                label="Data de Nascimento (Opcional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
              />
            )}
          />
        </Grid>

        <Grid sx={{ gridColumn: '1 / -1' }}>
            <Controller
                name="zipCode"
                control={control}
                render={({ field: { onBlur, ref } }) => (
                <TextField
                    label="CEP (Opcional)"
                    fullWidth
                    value={formattedZipCode}
                    onChange={handleZipCodeChange}
                    onBlur={onBlur}
                    inputRef={ref}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode?.message}
                    placeholder="00000-000"
                />
                )}
            />
        </Grid>

        <Grid sx={{ gridColumn: '1 / -1' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isSubmitting ? "Enviando..." : submitLabel}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerForm; 