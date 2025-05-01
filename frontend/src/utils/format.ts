export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatCPF = (cpf: string): string => {
  const cpfClean = cpf.replace(/\D/g, '');
  return cpfClean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const phoneClean = phone.replace(/\D/g, '');
  
  if (phoneClean.length <= 8) {
    // Telefone fixo sem DDD
    return phoneClean.replace(/(\d{4})(\d{4})/, '$1-$2');
  } else if (phoneClean.length === 9) {
    // Celular sem DDD
    return phoneClean.replace(/(\d{5})(\d{4})/, '$1-$2');
  } else if (phoneClean.length === 10) {
    // Telefone fixo com DDD
    return phoneClean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Celular com DDD
    return phoneClean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const formatZipCode = (zipCode: string): string => {
  const zipClean = zipCode.replace(/\D/g, '');
  return zipClean.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

export const validateCPF = (cpf: string): boolean => {
  const cpfClean = cpf.replace(/\D/g, '');
  
  if (cpfClean.length !== 11) return false;
  
  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1+$/.test(cpfClean)) return false;
  
  // Validation algorithm for CPF
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfClean.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfClean.substring(10, 11))) return false;
  
  return true;
};

export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
};
