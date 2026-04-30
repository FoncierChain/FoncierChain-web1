import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs} from 'firebase/firestore';
import {db} from '../firebase';

// --- Interfaces ---

export interface LandRecord {
  id: string;
  owner: string;
  city: string;
  neighborhood: string;
  cadastralId: string;
  area: number;
  price: number;
  address?: string;
  signatureV1: string;
  signatureV2: string;
  signatureV3: string;
  documentHash: string;
}

export interface RegisterLandResponse {
  status: 'SUCCESS' | 'FAILURE';
  txId: string;
  assetId: string;
}

export interface LandHistoryEntry {
  txId: string;
  value: {
    owner: string;
    status: string;
  };
  timestamp: string;
}

export interface LandHistoryResponse {
  land_id: string;
  history: LandHistoryEntry[];
}

export interface IdentityVerifyPayload {
  identity_token: string;
}

export interface IdentityStatusResponse {
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  level: string;
}

export interface BidPayload {
  auction_id: string;
  bidder_id: string;
  amount: number;
}

export interface BidResponse {
  status: string;
  message?: string;
}

export interface FinalizeAuctionResponse {
  status: string;
  txId?: string;
  message?: string;
}

export interface AuthPayload {
  username: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterUserPayload {
  username: string;
  password?: string;
  email: string;
}

export interface RegisterUserResponse {
  user_id: number;
  username: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class FancierChain {
  private http = inject(HttpClient);
  
  // Base URL for the API (relative to the current host)
  private baseUrl = '/api/v1';

  private get headers() {
    let token = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('fancier_token');
    }
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
  }

  // --- Authentication ---

  registerUser(data: RegisterUserPayload): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>(`${this.baseUrl}/register/`, data);
  }

  loginUser(data: AuthPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/`, data);
  }

  /**
   * Universal search (API)
   */
  async findParcel(queryStr: string): Promise<any | null> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const qId = queryStr.trim();
    if (!qId) return null;
    try {
      // Use citizen verify endpoint for search
      const result = await this.http.get<any>(`${this.baseUrl}/citizen/verify/`, { 
        params: { land_id: qId },
        headers: this.headers 
      }).toPromise();
      return result ? [result] : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Dashboard Statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      return await this.http.get<any>(`${this.baseUrl}/stats/`, { headers: this.headers }).toPromise();
    } catch (e) {
      return { total_parcels: 0, finalized_parcels: 0, total_area: 0, reliability: 0 };
    }
  }

  /**
   * Map Data
   */
  async getMapData(): Promise<any[]> {
    try {
      return await this.http.get<any[]>(`${this.baseUrl}/map/`, { headers: this.headers }).toPromise() || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Compliance Reports
   */
  async getReports(): Promise<any> {
    try {
      return await this.http.get<any>(`${this.baseUrl}/reports/`, { headers: this.headers }).toPromise();
    } catch (e) {
      return { districts: [] };
    }
  }

  // --- Workflow actions (via API) ---

  initiateDraft(data: Partial<LandRecord>): Observable<RegisterLandResponse> {
    return this.http.post<RegisterLandResponse>(`${this.baseUrl}/land/draft/`, data, { headers: this.headers });
  }

  validateCommunity(landId: string, signatureV3: string): Observable<{status: string, txId?: string}> {
    return this.http.patch<{status: string, txId?: string}>(`${this.baseUrl}/land/validate/`, { 
      land_id: landId, 
      signature_v3: signatureV3 
    }, { headers: this.headers });
  }

  finalizeLand(landId: string, signatureV1: string): Observable<RegisterLandResponse> {
    return this.http.patch<RegisterLandResponse>(`${this.baseUrl}/land/finalize/`, { 
      land_id: landId, 
      signature_v1: signatureV1 
    }, { headers: this.headers });
  }

  getLandHistory(landId: string): Observable<LandHistoryResponse> {
    return this.http.get<LandHistoryResponse>(`${this.baseUrl}/land/${landId}/history/`, { headers: this.headers });
  }

  transferLand(landId: string, newOwner: string, signatureV1: string): Observable<RegisterLandResponse> {
    return this.http.post<RegisterLandResponse>(`${this.baseUrl}/land/mutate/`, {
      land_id: landId,
      new_owner_id: newOwner,
      signature_v1: signatureV1
    }, { headers: this.headers });
  }

  // --- Identity & Auctions ---

  verifyIdentity(data: IdentityVerifyPayload): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${this.baseUrl}/identity/verify/`, data, { headers: this.headers });
  }

  getIdentityStatus(): Observable<IdentityStatusResponse> {
    return this.http.get<IdentityStatusResponse>(`${this.baseUrl}/identity/status/`, { headers: this.headers });
  }

  placeBid(data: BidPayload): Observable<BidResponse> {
    return this.http.post<BidResponse>(`${this.baseUrl}/auctions/bid/`, data, { headers: this.headers });
  }

  finalizeAuction(auctionId: string): Observable<FinalizeAuctionResponse> {
    return this.http.patch<FinalizeAuctionResponse>(`${this.baseUrl}/auctions/finalize/`, { auction_id: auctionId }, { headers: this.headers });
  }
}
