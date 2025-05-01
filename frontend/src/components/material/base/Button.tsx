import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'ref' | 'startIcon'> {
  asChild?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    asChild = false, 
    variant = 'contained', 
    color = 'primary', 
    size = 'medium', 
    isLoading = false,
    startIcon,
    children,
    ...props 
  }, ref) => {
    // Se for asChild, passamos as props para o componente filho
    if (asChild && children) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        ...props,
        ref,
      });
    }
    
    return (
      <MuiButton
        ref={ref}
        variant={variant}
        color={color}
        size={size}
        startIcon={isLoading ? undefined : startIcon}
        disabled={isLoading || props.disabled}
        sx={{
          borderRadius: '4px',
          fontWeight: 500,
          textTransform: 'none',
          ...(props.sx || {})
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Carregando...
          </>
        ) : (
          children
        )}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button; 