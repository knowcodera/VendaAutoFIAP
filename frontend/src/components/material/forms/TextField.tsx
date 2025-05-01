import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps, InputAdornment } from '@mui/material';
import { ReactNode } from 'react';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant'> {
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  type?: string;
}

const TextField = ({
  label,
  placeholder,
  error = false,
  helperText,
  fullWidth = true,
  startAdornment,
  endAdornment,
  type = 'text',
  InputProps,
  ...props
}: TextFieldProps) => {
  // Prepara os InputProps com os adornments
  const customInputProps = {
    ...InputProps,
    ...(startAdornment && {
      startAdornment: <InputAdornment position="start">{startAdornment}</InputAdornment>,
    }),
    ...(endAdornment && {
      endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment>,
    }),
  };

  return (
    <MuiTextField
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      type={type}
      variant="outlined"
      InputProps={
        startAdornment || endAdornment ? customInputProps : InputProps
      }
      {...props}
    />
  );
};

export { TextField };
export default TextField; 