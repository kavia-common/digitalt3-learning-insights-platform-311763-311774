/**
 * Axios API client for the LMS backend.
 * Fixed for Lead: Supports Vercel + Kavia cross-domain communication.
 */

import axios from 'axios';

/**
 * PUBLIC_INTERFACE
 * Detects the correct Backend URL from various possible Environment Variables.
 */
export function getApiBaseUrl() {
  const url = process.env.REACT_APP_API_BASE_URL || 
              process.env.REACT_APP_API_URL || 
              process.env.REACT_APP_API_BASE || 
              'http://localhost:3001'; // Default fallback
  
  return url.replace(/\/+$/, '');
}

/**
 * Normalize backend errors into a stable shape.
 */
function normalizeApiError(err) {
  if (err?.response) {
    const status = err.response.status;
    const data = err.response.data;
    const message = data?.message || data?.error || `Error ${status}`;
    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = data;
    return normalized;
  }
  return new Error(err?.message || 'Network error: backend unreachable.');
}

/**
 * Shared axios instance.
 * withCredentials set to FALSE to allow cross-origin requests from Vercel to Kavia.
 */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: false, 
});

/**
 * PUBLIC_INTERFACE - Sets Auth Header
 */
export function setApiAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/**
 * PUBLIC_INTERFACE - Standard Request Helper
 */
export async function apiRequest(config) {
  try {
    const res = await api.request(config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}