import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
  };

  const cerrarToast = () => {
    setToast(null);
  };

  return {
    toast,
    mostrarToast,
    cerrarToast,
    success: (mensaje) => mostrarToast(mensaje, 'success'),
    error: (mensaje) => mostrarToast(mensaje, 'error'),
    info: (mensaje) => mostrarToast(mensaje, 'info'),
    warning: (mensaje) => mostrarToast(mensaje, 'warning')
  };
};
