import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getGatewayHeaders } from './gateway.config';

export type ParcelStatus = 'DRAFT' | 'COMMUNITY_VALIDATED' | 'FINALIZED' | 'DISPUTED';

export interface GPSCoordinate {
  lat: number;
  lng: number;
}

export interface LandParcel {
  parcelId: string;
  currentOwner: string;
  surface: number;
  neighborhood: string;
  city: string;
  cadastralId: string;
  boundaryPoints: GPSCoordinate[];
  status: ParcelStatus;
  hash?: string;
  blockchainTxId?: string;
  workflowStep?: number;
  createdAt?: string | Date;
}

export interface GatewayResponse<T = any> {
  status: 'SUCCESS' | 'FAILURE';
  data?: T;
  message?: string;
  txId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LandRegistryService {
  private http = inject(HttpClient);

  initiateDraft(parcelData: Partial<LandParcel>): Observable<GatewayResponse> {
    return this.http.post<GatewayResponse>(
      `${API_CONFIG.baseUrl}/land/draft/`,
      parcelData,
      { headers: getGatewayHeaders() }
    );
  }

  validateCommunity(parcelId: string, signatureV3: string): Observable<GatewayResponse> {
    return this.http.patch<GatewayResponse>(
      `${API_CONFIG.baseUrl}/land/validate/`,
      { land_id: parcelId, signature_v3: signatureV3 },
      { headers: getGatewayHeaders() }
    );
  }

  finalizeLand(parcelId: string, signatureV1: string): Observable<GatewayResponse> {
    return this.http.patch<GatewayResponse>(
      `${API_CONFIG.baseUrl}/land/finalize/`,
      { land_id: parcelId, signature_v1: signatureV1 },
      { headers: getGatewayHeaders() }
    );
  }

  transferLand(parcelId: string, newOwnerId: string, signatureV1: string): Observable<GatewayResponse> {
    return this.http.post<GatewayResponse>(
      `${API_CONFIG.baseUrl}/land/mutate/`,
      { land_id: parcelId, new_owner_id: newOwnerId, signature_v1: signatureV1 },
      { headers: getGatewayHeaders() }
    );
  }

  declareOpposition(parcelId: string, motive: string, evidenceHash: string): Observable<GatewayResponse> {
    return this.http.post<GatewayResponse>(
      `${API_CONFIG.baseUrl}/land/dispute/`,
      { land_id: parcelId, motive, evidence_hash: evidenceHash },
      { headers: getGatewayHeaders() }
    );
  }
}
