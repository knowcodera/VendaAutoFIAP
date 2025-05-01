import axios from 'axios';

// Cria uma instância do Axios com a URL base da API
export const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // Aumentando o timeout para 30 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro na resposta da API:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Erro na requisição (sem resposta):', error.request);
    } else {
      // Erro na configuração da requisição
      console.error('Erro na configuração da requisição:', error.message);
    }
    return Promise.reject(error);
  }
); 