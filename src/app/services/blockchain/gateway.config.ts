import { HttpHeaders } from '@angular/common/http';

export const API_CONFIG = {
  // baseUrl: 'http://localhost:3001/api/v1', // Environnement Local
  baseUrl: 'https://foncierchain-web1.onrender.com/api/v1', // Environnement Production
};

export function getGatewayHeaders(): HttpHeaders {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('fancier_token');
  }
  
  let headers = new HttpHeaders().set('Content-Type', 'application/json');
  if (token) {
    headers = headers.set('Authorization', `Token ${token}`);
  }
  return headers;
}
