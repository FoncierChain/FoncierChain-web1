import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getGatewayHeaders } from './gateway.config';
import { LandParcel } from './land.service';

export interface LandHistoryEntry {
  txId: string;
  value: {
    owner: string;
    status: string;
  };
  timestamp: string;
}

export interface ParcelHistoryResponse {
  land_id: string;
  history: LandHistoryEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  verifyParcel(parcelId: string): Observable<LandParcel> {
    return this.http.get<LandParcel>(
      `${API_CONFIG.baseUrl}/citizen/verify/`,
      { 
        params: { land_id: parcelId },
        headers: getGatewayHeaders() 
      }
    );
  }

  getParcelHistory(parcelId: string): Observable<ParcelHistoryResponse> {
    return this.http.get<ParcelHistoryResponse>(
      `${API_CONFIG.baseUrl}/land/${parcelId}/history/`,
      { headers: getGatewayHeaders() }
    );
  }
  
  getMapData(): Observable<LandParcel[]> {
    return this.http.get<LandParcel[]>(
      `${API_CONFIG.baseUrl}/map/`,
      { headers: getGatewayHeaders() }
    );
  }
}
