import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
  Box
} from '@mui/material';

// Contexto para gerenciar o estado do diálogo
type AlertDialogContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
} | null;

const AlertDialogContext = React.createContext<AlertDialogContextType>(null);

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  AlertDialogTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, asChild, ...props }, ref) => {
  const context = React.useContext(AlertDialogContext);
  
  if (!context) {
    throw new Error('AlertDialogTrigger deve ser usado dentro de AlertDialog');
  }
  
  if (asChild && children) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      ...props,
      ref,
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        context.setOpen(true);
      },
    });
  }
  
  return (
    <MuiButton
      ref={ref}
      onClick={() => context.setOpen(true)}
      {...props}
    >
      {children}
    </MuiButton>
  );
});

AlertDialogTrigger.displayName = 'AlertDialogTrigger';

const AlertDialogContent = ({ children, ...props }: { children: React.ReactNode }) => {
  const context = React.useContext(AlertDialogContext);
  
  if (!context) {
    throw new Error('AlertDialogContent deve ser usado dentro de AlertDialog');
  }
  
  return (
    <MuiDialog
      open={context.open}
      onClose={() => context.setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...props}
    >
      {children}
    </MuiDialog>
  );
};

AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => {
  return <Box sx={{ p: 2, pb: 0 }}>{children}</Box>;
};

AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <DialogActions sx={{ p: 2, pt: 1 }}>
      {children}
    </DialogActions>
  );
};

AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <DialogTitle id="alert-dialog-title">{children}</DialogTitle>;
};

AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => {
  return <DialogContentText id="alert-dialog-description">{children}</DialogContentText>;
};

AlertDialogDescription.displayName = 'AlertDialogDescription';

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <MuiButton 
      ref={ref} 
      color="primary" 
      variant="contained" 
      autoFocus 
      {...props}
    >
      {children}
    </MuiButton>
  );
});

AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <MuiButton 
      ref={ref} 
      color="inherit" 
      variant="text" 
      {...props}
    >
      {children}
    </MuiButton>
  );
});

AlertDialogCancel.displayName = 'AlertDialogCancel';

// Componente principal que envolve todos os outros
const AlertDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

AlertDialog.displayName = 'AlertDialog';

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}; 