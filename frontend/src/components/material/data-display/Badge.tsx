import React from 'react';
import { Chip, ChipProps } from '@mui/material';

export interface BadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const getVariantProps = (
  variant: BadgeProps['variant'] = 'default'
): Pick<ChipProps, 'color' | 'variant'> => {
  switch (variant) {
    case 'destructive':
      return { color: 'error', variant: 'filled' };
    case 'secondary':
      return { color: 'secondary', variant: 'filled' };
    case 'outline':
      return { color: 'primary', variant: 'outlined' };
    case 'default':
    default:
      return { color: 'primary', variant: 'filled' };
  }
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const variantProps = getVariantProps(variant);

    return (
      <Chip
        ref={ref}
        size="small"
        {...variantProps}
        sx={{
          borderRadius: '4px',
          fontWeight: 500,
          textTransform: 'none',
          ...props.sx
        }}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge; 