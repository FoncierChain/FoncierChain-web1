import crypto from 'crypto';

class Block {
  constructor(timestamp, data, previousHash = '') {
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.data))
      .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(Date.now(), { message: 'Genesis Block FoncierChain' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// ── Geodesic Helpers ─────────────────────────────────────────────────

/**
 * Compute the geodesic area of a polygon given coordinates [[lat, lng], ...]
 * Uses the Shoelace formula adapted for spherical coordinates (Haversine).
 * Returns area in square meters.
 */
function computeGeodesicArea(coords) {
  if (!coords || coords.length < 3) return 0;
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(coords[i][0]);
    const lat2 = toRad(coords[j][0]);
    const lng1 = toRad(coords[i][1]);
    const lng2 = toRad(coords[j][1]);
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = Math.abs((area * R * R) / 2);
  return Math.round(area * 100) / 100; // Round to cm²
}

/**
 * Check if a point is inside a polygon (Ray Casting algorithm)
 */
function pointInPolygon(point, polygon) {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if two polygons overlap.
 * Returns true if any vertex of poly1 is inside poly2 or vice versa,
 * or if any edges intersect.
 */
function polygonsOverlap(poly1, poly2) {
  // Check if any vertex of poly1 is inside poly2
  for (const pt of poly1) {
    if (pointInPolygon(pt, poly2)) return true;
  }
  // Check if any vertex of poly2 is inside poly1
  for (const pt of poly2) {
    if (pointInPolygon(pt, poly1)) return true;
  }
  // Check edge intersections
  for (let i = 0; i < poly1.length; i++) {
    const a1 = poly1[i], a2 = poly1[(i + 1) % poly1.length];
    for (let j = 0; j < poly2.length; j++) {
      const b1 = poly2[j], b2 = poly2[(j + 1) % poly2.length];
      if (edgesIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

function edgesIntersect(a, b, c, d) {
  const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const d1 = cross(c, d, a), d2 = cross(c, d, b);
  const d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return false;
}

// Smart Contract simulation for Double Attribution
class SmartContract {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.owner = new Map(); // mapping(uint256 => address) public owner;
    this.registered = new Map(); // mapping(uint256 => bool) public registered;
    this.parcelsData = new Map(); // Store metadata for easy retrieval
  }

  // function registerParcel(uint256 assetID) public
  registerParcel(assetID, ownerAddress, metadata) {
    if (this.registered.get(assetID)) {
      throw new Error("ERREUR DU SMART CONTRACT : require(!registered[assetID]) - Double attribution bloquée. La parcelle est déjà verrouillée sur la blockchain.");
    }

    // Overlap validation: check if new parcel's coordinates overlap any existing parcel
    if (metadata.coords && metadata.coords.length >= 3) {
      for (const [existingId, existingData] of this.parcelsData) {
        if (existingData.coords && existingData.coords.length >= 3) {
          if (polygonsOverlap(metadata.coords, existingData.coords)) {
            throw new Error(`ERREUR DU SMART CONTRACT : CHEVAUCHEMENT DÉTECTÉ — La parcelle soumise empiète sur la parcelle "${existingId}" (${existingData.cadastralId}). Enregistrement rejeté pour préserver l'intégrité cadastrale.`);
          }
        }
      }
    }
    
    // Verrouillage de la propriété
    this.owner.set(assetID, ownerAddress);
    this.registered.set(assetID, true);
    
    // Enregistrement des métadonnées (off-chain ou on-chain selon la conception)
    const initialStatus = metadata.status || 'DRAFT';
    this.parcelsData.set(assetID, { ...metadata, owner: ownerAddress, status: initialStatus });

    // Ancrage sur la blockchain
    this.blockchain.addBlock(new Block(Date.now(), {
      action: 'CREATE',
      type: 'REGISTER_PARCEL',
      assetID: assetID,
      owner: ownerAddress,
      status: initialStatus,
      metadata: metadata
    }));

    return {
      status: 'SUCCESS',
      txId: this.blockchain.getLatestBlock().hash,
      assetId: assetID
    };
  }

  validateCommunity(assetID, signatureV3) {
    const parcel = this.parcelsData.get(assetID);
    if (!parcel) throw new Error("Parcelle non enregistrée.");
    if (parcel.status !== 'DRAFT') throw new Error("La parcelle doit être à l'état DRAFT.");
    
    parcel.status = 'COMMUNITY_VALIDATED';
    parcel.signatureV3 = signatureV3;
    this.parcelsData.set(assetID, parcel);

    this.blockchain.addBlock(new Block(Date.now(), {
      action: 'UPDATE',
      type: 'COMMUNITY_VALIDATION',
      assetID: assetID,
      status: 'COMMUNITY_VALIDATED',
      signatureV3: signatureV3
    }));

    return { status: 'SUCCESS', txId: this.blockchain.getLatestBlock().hash };
  }

  finalizeParcel(assetID, signatureV1) {
    const parcel = this.parcelsData.get(assetID);
    if (!parcel) throw new Error("Parcelle non enregistrée.");
    if (parcel.status !== 'COMMUNITY_VALIDATED') throw new Error("La parcelle doit être validée par la communauté d'abord.");
    
    parcel.status = 'FINALIZED';
    parcel.signatureV1 = signatureV1;
    this.parcelsData.set(assetID, parcel);

    this.blockchain.addBlock(new Block(Date.now(), {
      action: 'UPDATE',
      type: 'FINALIZE_PARCEL',
      assetID: assetID,
      status: 'FINALIZED',
      signatureV1: signatureV1
    }));

    return { status: 'SUCCESS', txId: this.blockchain.getLatestBlock().hash };
  }

  // function transferOwnership(uint256 assetID, address newOwner) public
  transferOwnership(assetID, currentOwnerAddress, newOwnerAddress) {
    if (!this.registered.get(assetID)) {
      throw new Error("Parcelle non enregistrée.");
    }

    if (this.owner.get(assetID) !== currentOwnerAddress) {
       throw new Error("ERREUR DU SMART CONTRACT : require(owner[assetID] == msg.sender) - Transfert non autorisé. Seul le propriétaire légitime peut muter la parcelle.");
    }

    this.owner.set(assetID, newOwnerAddress);
    
    let metadata = this.parcelsData.get(assetID);
    metadata.owner = newOwnerAddress;
    this.parcelsData.set(assetID, metadata);

    this.blockchain.addBlock(new Block(Date.now(), {
      action: 'TRANSFER',
      type: 'TRANSFER_OWNERSHIP',
      assetID: assetID,
      from: currentOwnerAddress,
      to: newOwnerAddress,
      newOwner: newOwnerAddress
    }));

    return {
      status: 'SUCCESS',
      txId: this.blockchain.getLatestBlock().hash,
      assetId: assetID
    };
  }

  getParcel(assetID) {
    const parcel = this.parcelsData.get(assetID);
    return parcel ? { id: assetID, parcelId: assetID, ...parcel } : null;
  }

  getAllParcels() {
    return Array.from(this.parcelsData.entries()).map(([id, data]) => ({ id, parcelId: id, ...data }));
  }

  getStats() {
    const parcels = Array.from(this.parcelsData.values());
    const total = this.registered.size;
    const finalized = parcels.filter(p => p.status === 'FINALIZED').length;
    const draft = parcels.filter(p => p.status === 'DRAFT').length;
    const validated = parcels.filter(p => p.status === 'COMMUNITY_VALIDATED').length;

    // Build recent activity from the blockchain
    const recentActivity = this.blockchain.chain
      .filter(b => b.data && b.data.assetID)
      .slice(-5)
      .reverse()
      .map((b, i) => {
        const parcel = this.parcelsData.get(b.data.assetID);
        const isTransfer = b.data.action === 'TRANSFER';
        return {
          id: i + 1,
          name: b.data.assetID,
          action: isTransfer ? 'Transfert de propriété' : 'Enregistrement initial',
          location: parcel?.neighborhood || parcel?.city || 'Brazzaville',
          status: isTransfer ? 'Vérifié' : 'Confirmé',
          time: this._timeAgo(b.timestamp)
        };
      });

    return {
      total_parcels: total,
      finalized_parcels: finalized,
      draft_parcels: draft,
      validated_parcels: validated,
      total_area: parcels.reduce((sum, p) => sum + (Number(p.area) || 0), 0),
      reliability: this.blockchain.isChainValid() ? 100 : 0,
      recentActivity: recentActivity
    };
  }

  _timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}j`;
  }
  
  // Method to prepopulate the blockchain with some dummy data for the demo so the map/dashboard isn't empty
  populateDummyData() {
     this.registerParcel('bz-001', 'Jean-Baptiste Moukoko', {
       status: 'FINALIZED', area: 1500, city: 'Brazzaville', neighborhood: 'Madibou', cadastralId: 'REF-BZV-001', price: 5000000, usage_type: 'Résidentiel',
       coords: [[-4.3140, 15.2400], [-4.3140, 15.2450], [-4.3148, 15.2458], [-4.3170, 15.2455], [-4.3175, 15.2410], [-4.3160, 15.2395]]
     });
     this.registerParcel('bz-002', 'Marie-Claire Ngouabi', {
       status: 'FINALIZED', area: 450, city: 'Brazzaville', neighborhood: 'Poto-Poto', cadastralId: 'REF-BZV-002', price: 1200000, usage_type: 'Commercial',
       coords: [[-4.2600, 15.2800], [-4.2595, 15.2860], [-4.2620, 15.2870], [-4.2640, 15.2850], [-4.2635, 15.2805]]
     });
     this.registerParcel('bz-003', 'Alphonse Mabiala', {
       status: 'FINALIZED', area: 800, city: 'Brazzaville', neighborhood: 'Moungali', cadastralId: 'REF-BZV-003', price: 2500000, usage_type: 'Résidentiel',
       coords: [[-4.2480, 15.2570], [-4.2475, 15.2640], [-4.2510, 15.2650], [-4.2530, 15.2630], [-4.2525, 15.2575]]
     });
     this.registerParcel('bz-004', 'Patrick Sassou', {
       status: 'FINALIZED', area: 2200, city: 'Brazzaville', neighborhood: 'Bacongo', cadastralId: 'REF-BZV-004', price: 8000000, usage_type: 'Résidentiel',
       coords: [[-4.2830, 15.2660], [-4.2825, 15.2750], [-4.2860, 15.2770], [-4.2900, 15.2740], [-4.2905, 15.2680], [-4.2870, 15.2650]]
     });
     this.registerParcel('bz-005', 'Cécile Obambi', {
       status: 'FINALIZED', area: 350, city: 'Brazzaville', neighborhood: 'Talangaï', cadastralId: 'REF-BZV-005', price: 900000, usage_type: 'Agricole',
       coords: [[-4.2350, 15.2920], [-4.2345, 15.2990], [-4.2380, 15.3000], [-4.2400, 15.2970], [-4.2390, 15.2925]]
     });
  }
}

export { Blockchain, Block, SmartContract };
