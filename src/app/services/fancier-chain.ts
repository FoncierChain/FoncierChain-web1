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

  /**
   * Universal search simulation (Firestore)
   */
  async findParcel(queryStr: string): Promise<any | null> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const qId = queryStr.trim();
    if (!qId) return [];
    // 1. Direct ID
    try {
      const snap = await getDoc(doc(db, 'parcels', qId));
      if (snap.exists()) return [snap.data()];
    } catch (e) {
      return [];
    }

    // 2. Cadastral ID
    const qCad = query(collection(db, 'parcels'), where('cadastralId', '==', qId));
    const resCad = await getDocs(qCad);
    if (!resCad.empty) return resCad.docs[0].data();

    // 3. Address / Neighborhood
    const qAddr = query(collection(db, 'parcels'), where('address', '==', qId));
    const resAddr = await getDocs(qAddr);
    if (!resAddr.empty) return resAddr.docs[0].data();

    return null;
  }

  /**
   * Dashboard Statistics Simulation
   */
  async getDashboardStats(): Promise<any> {
    const q = query(collection(db, 'parcels'));
    const snap = await getDocs(q);
    const parcels = snap.docs.map(d => d.data());
    
    const finalized = parcels.filter(p => p['status'] === 'FINALIZED').length;
    const validated = parcels.filter(p => p['status'] === 'COMMUNITY_VALIDATED').length;
    const draft = parcels.filter(p => p['status'] === 'DRAFT').length;
    const totalArea = parcels.reduce((acc, p) => acc + (Number(p['area']) || 0), 0);

    return {
      total_parcels: parcels.length,
      finalized_parcels: finalized,
      validated_parcels: validated,
      draft_parcels: draft,
      total_area: totalArea,
      land_usage: [
        { usage_type: 'Résidentiel', count: parcels.filter(p => p['usage_type'] === 'Résidentiel').length },
        { usage_type: 'Commercial', count: parcels.filter(p => p['usage_type'] === 'Commercial').length }
      ]
    };
  }

  /**
   * Map Data Simulation
   */
  async getMapData(): Promise<any[]> {
    const q = query(collection(db, 'parcels'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }

  /**
   * Compliance Reports Simulation
   */
  async getReports(): Promise<any> {
    return {
      districts: [
        { name: 'Moungali', total: 450, finalized: 320 },
        { name: 'Ouenzé', total: 380, finalized: 290 },
        { name: 'Talangaï', total: 600, finalized: 410 }
      ],
      audit_logs: [
        { action: 'FINALIZATION', actor: 'AGENT_01', timestamp: new Date(), target: 'bz-456' },
        { action: 'VALIDATION', actor: 'COMM_04', timestamp: new Date(), target: 'bz-101' }
      ]
    };
  }

  // --- Simulation Layer (Real-time Logic via Firestore) ---

  /**
   * Simulates on-chain collision detection.
   */
  async simulateRegistration(landId: string): Promise<{allowed: boolean, reason?: string}> {
    const docRef = doc(db, 'parcels', landId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { allowed: false, reason: 'REJET AUTOMATIQUE : Cette parcelle est déjà enregistrée dans le ledger (Double Attribution détectée).' };
    }
    return { allowed: true };
  }

  /**
   * Step 1 simulation (Draft)
   */
  async simulateInitiateDraft(data: any): Promise<RegisterLandResponse> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const parcelId = data.id || data.parcelId;
    const txId = 'tx_draft_' + Math.random().toString(36).substring(2, 10);
    
    // Save to Firestore as simulation
    await setDoc(doc(db, 'parcels', parcelId), {
      ...data,
      parcelId,
      status: 'DRAFT',
      workflowStep: 1,
      lastTxId: txId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    await addDoc(collection(db, `parcels/${parcelId}/history`), {
      type: 'INITIATE_DRAFT',
      actor: 'GEOMETRE',
      date: serverTimestamp(),
      txId,
      signature: data.signatureV2
    });

    return { status: 'SUCCESS', txId, assetId: parcelId };
  }

  /**
   * Step 2 simulation (Community Validation)
   */
  async simulateValidateCommunity(landId: string, signatureV3: string): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const txId = 'tx_val_' + Math.random().toString(36).substring(2, 10);
    const docRef = doc(db, 'parcels', landId);
    
    await setDoc(docRef, {
      status: 'COMMUNITY_VALIDATED',
      workflowStep: 2,
      lastTxId: txId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await addDoc(collection(db, `parcels/${landId}/history`), {
      type: 'COMMUNITY_VALIDATION',
      actor: 'COMMUNITY',
      date: serverTimestamp(),
      txId,
      signature: signatureV3
    });

    return { status: 'SUCCESS', txId };
  }

  /**
   * Step 3 simulation (Finalization)
   */
  async simulateFinalize(landId: string, signatureV1: string): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const txId = 'tx_final_' + Math.random().toString(36).substring(2, 10);
    const docRef = doc(db, 'parcels', landId);
    
    await setDoc(docRef, {
      status: 'FINALIZED',
      workflowStep: 3,
      lastTxId: txId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await addDoc(collection(db, `parcels/${landId}/history`), {
      type: 'MINT_FINALIZED',
      actor: 'AGENT',
      date: serverTimestamp(),
      txId,
      signature: signatureV1
    });

    return { status: 'SUCCESS', txId };
  }

  /**
   * Property Transfer (Simulation)
   */
  transferLand(landId: string, newOwner: string, signatureV1: string): Observable<RegisterLandResponse> {
    return new Observable(observer => {
      setTimeout(async () => {
        try {
          const parcelRef = doc(db, 'parcels', landId);
          const parcelSnap = await getDoc(parcelRef);
          
          if (!parcelSnap.exists()) {
            observer.error({ message: "Parcelle introuvable." });
            return;
          }

          const txId = 'tx_' + Math.random().toString(36).substring(2, 15);
          
          // Update Firebase Mirror
          await setDoc(parcelRef, { 
            currentOwner: newOwner,
            status: 'TRANSFERRED',
            lastTxId: txId,
            updatedAt: serverTimestamp()
          }, { merge: true });

          // Add to History
          await addDoc(collection(db, `parcels/${landId}/history`), {
            parcelId: landId,
            newOwner: newOwner,
            date: serverTimestamp(),
            type: 'TRANSFER',
            txId: txId,
            signatureV1
          });

          observer.next({
            status: 'SUCCESS',
            txId: txId,
            assetId: landId
          });
          observer.complete();
        } catch (e) {
          observer.error(e);
        }
      }, 1500);
    });
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
