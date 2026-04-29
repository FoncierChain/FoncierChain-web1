import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

// --- Interfaces ---

export interface LandRecord {
  id: string;
  owner: string;
  city: string;
  neighborhood: string;
  cadastralId: string;
  area: number;
  price: number;
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
  
  // Base URL for the API
  private baseUrl = 'http://localhost:8000/api/v1';

  private get headers() {
    const token = localStorage.getItem('fancier_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
  }

  // --- Authentication ---

  /**
   * Creates a new account and returns a permanent API token.
   */
  registerUser(data: RegisterUserPayload): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>(`${this.baseUrl}/register/`, data);
  }

  /**
   * Retrieves a token for an existing user.
   */
  loginUser(data: AuthPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/`, data);
  }

// --- Land Registry (Sequential Workflow) ---

  /**
   * Step 1: Initiate Draft. Status becomes DRAFT.
   * Actor: Géomètre Agréé (GEOMETRE)
   */
  initiateDraft(data: Partial<LandRecord>): Observable<RegisterLandResponse> {
    return this.http.post<RegisterLandResponse>(`${this.baseUrl}/land/draft/`, data, { headers: this.headers });
  }

  /**
   * Step 2: Community Validation. Status becomes COMMUNITY_VALIDATED.
   * Actor: Représentant Communautaire (COMMUNITY)
   */
  validateCommunity(landId: string, signatureV3: string): Observable<{status: string, txId?: string}> {
    return this.http.patch<{status: string, txId?: string}>(`${this.baseUrl}/land/validate/`, { 
      land_id: landId, 
      signature_v3: signatureV3 
    }, { headers: this.headers });
  }

  /**
   * Step 3: Finalization (On-Chain Minting). Status becomes FINALIZED.
   * Actor: Agent Foncier de l'Etat (AGENT)
   */
  finalizeLand(landId: string, signatureV1: string): Observable<RegisterLandResponse> {
    return this.http.patch<RegisterLandResponse>(`${this.baseUrl}/land/finalize/`, { 
      land_id: landId, 
      signature_v1: signatureV1 
    }, { headers: this.headers });
  }

  /**
   * Legacy/Direct registration (if still supported by your specific backend setup)
   */
  registerLand(data: LandRecord): Observable<RegisterLandResponse> {
    return this.http.post<RegisterLandResponse>(`${this.baseUrl}/land/register/`, data, { headers: this.headers });
  }

  /**
   * Retrieves the full chain of custody for a specific plot.
   */
  getLandHistory(landId: string): Observable<LandHistoryResponse> {
    return this.http.get<LandHistoryResponse>(`${this.baseUrl}/land/${landId}/history/`, { headers: this.headers });
  }

  // --- Sovereign Identity (SSI) ---

  /**
   * Initiates an X.509 certificate validation against the Fabric CA.
   */
  verifyIdentity(data: IdentityVerifyPayload): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${this.baseUrl}/identity/verify/`, data, { headers: this.headers });
  }

  /**
   * Returns the current verification tier of the logged-in user.
   */
  getIdentityStatus(): Observable<IdentityStatusResponse> {
    return this.http.get<IdentityStatusResponse>(`${this.baseUrl}/identity/status/`, { headers: this.headers });
  }

  // --- Real-time Auctions ---

  /**
   * Places a competitive bid on a land auction.
   */
  placeBid(data: BidPayload): Observable<BidResponse> {
    return this.http.post<BidResponse>(`${this.baseUrl}/auctions/bid/`, data, { headers: this.headers });
  }

  /**
   * Closes the auction and transfers ownership to the highest bidder on the blockchain.
   */
  finalizeAuction(auctionId: string): Observable<FinalizeAuctionResponse> {
    return this.http.patch<FinalizeAuctionResponse>(`${this.baseUrl}/auctions/finalize/`, { auction_id: auctionId }, { headers: this.headers });
  }
}
