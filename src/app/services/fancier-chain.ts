import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

// --- Interfaces ---

export interface LandRecord {
  id: string;
  owner: string;
  location: string;
  area: number;
  price: number;
}

export interface RegisterLandResponse {
  status: 'SUCCESS' | 'FAILURE';
  txId: string;
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

@Injectable({
  providedIn: 'root'
})
export class FancierChain {
  private http = inject(HttpClient);
  
  // Base URL for the API
  // In a real environment, this could be an environment variable
  private baseUrl = 'http://localhost:8000/api/v1';

  // --- Land Registry ---

  /**
   * Creates a new property record on the blockchain.
   */
  registerLand(data: LandRecord): Observable<RegisterLandResponse> {
    return this.http.post<RegisterLandResponse>(`${this.baseUrl}/land/register/`, data);
  }

  /**
   * Retrieves the full chain of custody for a specific plot.
   */
  getLandHistory(landId: string): Observable<LandHistoryResponse> {
    return this.http.get<LandHistoryResponse>(`${this.baseUrl}/land/${landId}/history/`);
  }

  // --- Sovereign Identity (SSI) ---

  /**
   * Initiates an X.509 certificate validation against the Fabric CA.
   */
  verifyIdentity(data: IdentityVerifyPayload): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${this.baseUrl}/identity/verify/`, data);
  }

  /**
   * Returns the current verification tier of the logged-in user.
   */
  getIdentityStatus(): Observable<IdentityStatusResponse> {
    return this.http.get<IdentityStatusResponse>(`${this.baseUrl}/identity/status/`);
  }

  // --- Real-time Auctions ---

  /**
   * Places a competitive bid on a land auction.
   */
  placeBid(data: BidPayload): Observable<BidResponse> {
    return this.http.post<BidResponse>(`${this.baseUrl}/auctions/bid/`, data);
  }

  /**
   * Closes the auction and transfers ownership to the highest bidder on the blockchain.
   */
  finalizeAuction(auctionId: string): Observable<FinalizeAuctionResponse> {
    return this.http.patch<FinalizeAuctionResponse>(`${this.baseUrl}/auctions/finalize/`, { auction_id: auctionId });
  }
}
