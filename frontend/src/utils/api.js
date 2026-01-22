import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Función para manejar errores
const handleError = (error) => {
  console.error('API Error:', error);
  throw error.response?.data || error.message;
};

// ============ PRODUCTOS ============

export const getProductos = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/productos`, { params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getProducto = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/productos/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createProducto = async (producto) => {
  try {
    const response = await axios.post(`${API_URL}/productos`, producto);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateProducto = async (id, updates) => {
  try {
    const response = await axios.put(`${API_URL}/productos/${id}`, updates);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteProducto = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/productos/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getStockBajo = async (minimo = 10) => {
  try {
    const response = await axios.get(`${API_URL}/reportes/stock-bajo`, {
      params: { minimo }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
// ============ PRODUCTOS POR ESTADO ============

export const getProductosPorEstado = async (estado, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/productos/estado/${estado}`, { params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createProductoRapido = async (producto) => {
  try {
    const response = await axios.post(`${API_URL}/productos/rapido`, producto);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const completarProducto = async (id, updates) => {
  try {
    const response = await axios.put(`${API_URL}/productos/${id}/completar`, updates);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const moverCompletadosAExistentes = async () => {
  try {
    const response = await axios.post(`${API_URL}/productos/mover-completados`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ============ FALTANTES ============

export const reportarFaltante = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/productos/${id}/reportar-faltante`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getProductosFaltantes = async () => {
  try {
    const response = await axios.get(`${API_URL}/productos/faltantes/lista`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};