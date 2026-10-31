/**
 * Base URL del backend:
 * - Si VITE_API_URL está definida (ej. en Render), usa esa URL.
 * - Si no, detecta si estamos en localhost para usar '' (con proxy) o la URL de Render.
 */
const BASE_HOST = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '' : 'https://bibliometria-back.onrender.com');

export default BASE_HOST;
