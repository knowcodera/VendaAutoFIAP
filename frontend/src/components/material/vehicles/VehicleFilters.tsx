import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Collapse,
  InputAdornment,
  Stack,
  Divider
} from "@mui/material";
import { formatCurrency } from "@/utils/format";

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Estado de filtros
export interface VehicleFiltersState {
  brand: string;
  model: string;
  minYear: string | number;
  maxYear: string | number;
  minPrice: string | number;
  maxPrice: string | number;
  minKm: string | number;
  maxKm: string | number;
  color: string;
  fuelType: string;
  transmission: string;
  condition: string;
  sortBy: string;
  filtersApplied: boolean;
}

// Props para o componente
export interface VehicleFiltersProps {
  onChange: (filters: VehicleFiltersState) => void;
  onReset: () => void;
  activeFilters: VehicleFiltersState;
  filtersCount: number;
}

// Opções para selects
const FUEL_TYPES = [
  { value: "", label: "Todos" },
  { value: "gasolina", label: "Gasolina" },
  { value: "etanol", label: "Etanol" },
  { value: "flex", label: "Flex" },
  { value: "diesel", label: "Diesel" },
  { value: "eletrico", label: "Elétrico" },
  { value: "hibrido", label: "Híbrido" },
];

const TRANSMISSION_TYPES = [
  { value: "", label: "Todos" },
  { value: "manual", label: "Manual" },
  { value: "automatico", label: "Automático" },
  { value: "cvt", label: "CVT" },
  { value: "semi-automatico", label: "Semi-automático" },
];

const VEHICLE_CONDITIONS = [
  { value: "", label: "Todos" },
  { value: "novo", label: "Novo" },
  { value: "usado", label: "Usado" },
];

const SORT_OPTIONS = [
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "year-desc", label: "Mais novos" },
  { value: "year-asc", label: "Mais antigos" },
  { value: "created-desc", label: "Recém adicionados" },
  { value: "created-asc", label: "Adicionados primeiro" },
];

export const VehicleFilters = ({
  onChange,
  onReset,
  activeFilters,
  filtersCount,
}: VehicleFiltersProps) => {
  // Estado de filtros local
  const [localFilters, setLocalFilters] = useState<VehicleFiltersState>(activeFilters);
  
  // Estado para abrir/fechar o painel de filtros
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Atualizar estado local quando activeFilters mudar
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // Aplicar filtros quando o botão for clicado
  const applyFilters = () => {
    // Marcar que os filtros foram aplicados
    onChange({
      ...localFilters,
      filtersApplied: true
    });
  };

  // Resetar filtros
  const resetFilters = () => {
    onReset();
  };

  // Atualizar estado local quando qualquer filtro mudar
  const handleFilterChange = (filterName: keyof VehicleFiltersState, value: any) => {
    setLocalFilters({
      ...localFilters,
      [filterName]: value,
    });
  };

  // Validar entrada numérica
  const validateNumericInput = (value: string): boolean => {
    return value === '' || /^\d*$/.test(value);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 3, 
        overflow: 'hidden', 
        borderRadius: 2 
      }}
    >
      {/* Cabeçalho do filtro */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
            Filtros
            {filtersCount > 0 && (
              <Chip 
                label={filtersCount} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={resetFilters}
            startIcon={<RestartAltIcon />}
            disabled={filtersCount === 0}
          >
            Limpar
          </Button>
          <IconButton 
            size="small" 
            onClick={() => setFiltersOpen(!filtersOpen)}
            color="primary"
          >
            {filtersOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* Área de ordenação visível sempre */}
      <Divider />
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SortIcon sx={{ mr: 1 }} />
          <Typography variant="body1" fontWeight="medium">Ordenar por:</Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
          <Select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            displayEmpty
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Pesquisa rápida */}
        <TextField
          placeholder="Buscar marca ou modelo..."
          size="small"
          value={localFilters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          sx={{ flexGrow: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Área de filtros detalhados (colapsável) */}
      <Collapse in={filtersOpen}>
        <Divider />
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Linha 1: Marca, Modelo, Cor */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Marca"
                fullWidth
                value={localFilters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                size="small"
              />
              
              <TextField
                label="Modelo"
                fullWidth
                value={localFilters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                size="small"
              />
              
              <TextField
                label="Cor"
                fullWidth
                value={localFilters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                size="small"
              />
            </Stack>
            
            {/* Linha 2: Ano Min-Max */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Ano Mínimo"
                fullWidth
                placeholder="Ex: 2010"
                value={localFilters.minYear}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value)) {
                    handleFilterChange('minYear', e.target.value);
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: localFilters.minYear ? (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => handleFilterChange('minYear', '')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              
              <TextField
                label="Ano Máximo"
                fullWidth
                placeholder={`Ex: ${new Date().getFullYear()}`}
                value={localFilters.maxYear}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value)) {
                    handleFilterChange('maxYear', e.target.value);
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: localFilters.maxYear ? (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => handleFilterChange('maxYear', '')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Stack>
            
            {/* Linha 3: Preço Min-Max */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Preço Mínimo"
                fullWidth
                placeholder="Ex: 50000"
                value={localFilters.minPrice}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value)) {
                    handleFilterChange('minPrice', e.target.value);
                  }
                }}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  endAdornment: localFilters.minPrice ? (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => handleFilterChange('minPrice', '')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              
              <TextField
                label="Preço Máximo"
                fullWidth
                placeholder="Ex: 150000"
                value={localFilters.maxPrice}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value)) {
                    handleFilterChange('maxPrice', e.target.value);
                  }
                }}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  endAdornment: localFilters.maxPrice ? (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => handleFilterChange('maxPrice', '')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Stack>
            
            {/* Linha 4: Quilometragem Min-Max */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Km Mínimo"
                fullWidth
                placeholder="Ex: 0"
                value={localFilters.minKm}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value)) {
                    handleFilterChange('minKm', e.target.value);
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {localFilters.minKm ? (
                        <IconButton 
                          size="small" 
                          onClick={() => handleFilterChange('minKm', '')}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                      km
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                label="Km Máximo"
                fullWidth
                placeholder="Ex: 50000"
                value={localFilters.maxKm}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value)) {
                    handleFilterChange('maxKm', e.target.value);
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {localFilters.maxKm ? (
                        <IconButton 
                          size="small" 
                          onClick={() => handleFilterChange('maxKm', '')}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                      km
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
            
            {/* Linha 5: Tipo de combustível, Câmbio, Condição */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Combustível</InputLabel>
                <Select
                  value={localFilters.fuelType}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                  label="Combustível"
                >
                  {FUEL_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Câmbio</InputLabel>
                <Select
                  value={localFilters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  label="Câmbio"
                >
                  {TRANSMISSION_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Condição</InputLabel>
                <Select
                  value={localFilters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  label="Condição"
                >
                  {VEHICLE_CONDITIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            
            {/* Botões de ação */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={resetFilters}
                sx={{ mr: 2 }}
              >
                Limpar Filtros
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={applyFilters}
              >
                Aplicar Filtros
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default VehicleFilters;