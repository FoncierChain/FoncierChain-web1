import express from 'express';
import cors from 'cors';
import { Blockchain, SmartContract } from './blockchain.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize Blockchain and Smart Contract
const foncierChain = new Blockchain();
const smartContract = new SmartContract(foncierChain);
smartContract.populateDummyData();

// --- API Endpoints matching Angular Frontend ---

// Authentication Endpoint
app.post('/api/v1/auth/', (req, res) => {
  const { username, password } = req.body;
  // Simple mock authentication for hackathon
  if (username && username.startsWith('AGT') && password) {
    res.json({ token: `mock-jwt-token-${username}` });
  } else {
    res.status(401).json({ error: "Identifiants invalides." });
  }
});

// Get Dashboard Statistics
app.get('/api/v1/stats/', (req, res) => {
  res.json(smartContract.getStats());
});

// Get Map Data
app.get('/api/v1/map/', (req, res) => {
  const parcels = smartContract.getAllParcels();
  const mapData = parcels.map(p => ({
    parcelId: p.cadastralId || 'N/A',
    address: `${p.neighborhood || ''}, ${p.city || 'Brazzaville'}`,
    currentOwner: p.owner,
    surface: p.area,
    usage: p.usage_type || 'Résidentiel',
    hash: foncierChain.getLatestBlock().hash.substring(0, 24),
    coordinates: p.coords || [],
    status: p.status
  }));
  res.json(mapData);
});

// Verify / Find Parcel
app.get('/api/v1/citizen/verify/', (req, res) => {
  const landId = req.query.land_id;
  const parcel = smartContract.getParcel(landId);
  if (parcel) {
    res.json(parcel);
  } else {
    res.status(404).json({ error: "Titre foncier introuvable dans le registre immuable." });
  }
});

// Register Parcel (Initiate Draft / Finalize)
app.post('/api/v1/land/draft/', (req, res) => {
  try {
    const { id, owner, city, neighborhood, cadastralId, area, price, coordinates, usage_type } = req.body;
    
    // Call Smart Contract (now with coords for overlap validation)
    const result = smartContract.registerParcel(id, owner, { 
      city, neighborhood, cadastralId, area, price, 
      coords: coordinates || [],
      usage_type: usage_type || 'Résidentiel'
    });
    
    res.json(result);
  } catch (error) {
    // If double attribution or overlap, return 400 with the Smart Contract Error
    res.status(400).json({ error: error.message });
  }
});

// Validate Geometry (pre-check before submission)
app.post('/api/v1/land/validate-geometry/', (req, res) => {
  try {
    const { coordinates } = req.body;
    if (!coordinates || coordinates.length < 3) {
      return res.status(400).json({ error: "Au moins 3 sommets sont requis pour former un polygone valide." });
    }

    // Compute geodesic area
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    let area = 0;
    const n = coordinates.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lat1 = toRad(coordinates[i][0]);
      const lat2 = toRad(coordinates[j][0]);
      const lng1 = toRad(coordinates[i][1]);
      const lng2 = toRad(coordinates[j][1]);
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs((area * R * R) / 2);
    const computed_area = Math.round(area * 100) / 100;

    // Check overlaps with existing parcels
    const overlaps = [];
    for (const parcel of smartContract.getAllParcels()) {
      if (parcel.coords && parcel.coords.length >= 3) {
        // Simple point-in-polygon check
        let hasOverlap = false;
        for (const pt of coordinates) {
          let inside = false;
          const poly = parcel.coords;
          for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const [xi, yi] = poly[i];
            const [xj, yj] = poly[j];
            const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          if (inside) { hasOverlap = true; break; }
        }
        if (hasOverlap) {
          overlaps.push({ parcelId: parcel.cadastralId, owner: parcel.owner });
        }
      }
    }

    res.json({
      valid: overlaps.length === 0,
      computed_area_m2: computed_area,
      vertices: coordinates.length,
      overlaps: overlaps,
      geojson: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates.map(c => [c[1], c[0]])] // GeoJSON is [lng, lat]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate Community (V3)
app.patch('/api/v1/land/validate/', (req, res) => {
  try {
    const { land_id, signature_v3 } = req.body;
    const result = smartContract.validateCommunity(land_id, signature_v3);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Finalize Parcel (V1)
app.patch('/api/v1/land/finalize/', (req, res) => {
  try {
    const { land_id, signature_v1 } = req.body;
    const result = smartContract.finalizeParcel(land_id, signature_v1);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Transfer Ownership (Mutation)
app.post('/api/v1/land/mutate/', (req, res) => {
  try {
    const { land_id, new_owner_id, current_owner_id } = req.body;
    // Note: Angular sends 'currentOwner' implicitly or via token. For this demo we assume currentOwner is passed or known.
    // Let's extract it from the token or just use a mock logic for now since it's a demo.
    // The smart contract expects: assetID, currentOwnerAddress, newOwnerAddress
    
    // In a real app, current_owner_id comes from the authenticated session (msg.sender)
    const currentOwner = current_owner_id || smartContract.getParcel(land_id)?.owner; 

    const result = smartContract.transferOwnership(land_id, currentOwner, new_owner_id);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get History
app.get('/api/v1/land/:id/history/', (req, res) => {
  const landId = req.params.id;
  // Read through the blockchain to find history for this landId
  const history = [];
  for (const block of foncierChain.chain) {
    if (block.data && block.data.assetID === landId) {
       history.push({
         txId: block.hash,
         timestamp: new Date(block.timestamp).toISOString(),
         value: block.data
       });
    }
  }
  res.json({ land_id: landId, history });
});

// Get all lands
app.get('/api/v1/land/', (req, res) => {
  res.json(smartContract.getAllParcels());
});

// Get Global Ledger
app.get('/api/v1/ledger/', (req, res) => {
  const ledger = foncierChain.chain.map((block, index) => {
    let type = 'GENESIS';
    let details = 'Bloc initial de la blockchain';
    
    if (block.data) {
      if (block.data.action === 'CREATE') {
        type = 'CREATE';
        details = `Enregistrement initial de la parcelle ${block.data.assetID || ''}`;
      } else if (block.data.action === 'TRANSFER') {
        type = 'TRANSFER';
        details = `Transfert de propriété de ${block.data.assetID || ''} vers ${block.data.newOwner || ''}`;
      } else {
        type = block.data.action || 'TRANSACTION';
        details = `Opération sur ${block.data.assetID || ''}`;
      }
    }

    return {
      number: index,
      type: type,
      details: details,
      timestamp: block.timestamp,
      hash: block.hash,
      proof: block.nonce ? block.nonce.toString() : 'auto-generated'
    };
  });
  
  // Return ledger in reverse chronological order
  res.json(ledger.reverse());
});

// Get Reports (Distribution by District + Audit Logs)
app.get('/api/v1/reports/', (req, res) => {
  const parcels = smartContract.getAllParcels();
  
  // Group by district
  const districtMap = {};
  for (const p of parcels) {
    const name = p.neighborhood || 'Inconnu';
    if (!districtMap[name]) {
      districtMap[name] = { name, total: 0, finalized: 0, area: 0 };
    }
    districtMap[name].total++;
    districtMap[name].area += Number(p.area) || 0;
    if (p.status === 'FINALIZED') districtMap[name].finalized++;
  }
  const districts = Object.values(districtMap);

  // Build audit logs from blockchain
  const audit_logs = foncierChain.chain
    .filter(b => b.data && b.data.assetID)
    .map((b, i) => ({
      id: `LOG-${String(i + 1).padStart(4, '0')}`,
      timestamp: new Date(b.timestamp),
      agent: b.data.owner || b.data.to || 'SYSTEM',
      action: b.data.action || 'TRANSACTION',
      entity: b.data.assetID,
      status: 'SUCCESS'
    }))
    .reverse();

  res.json({ districts, audit_logs });
});

// Start the Node.js Blockchain Node
app.listen(port, () => {
  console.log(`🚀 [Blockchain Node] FoncierChain Node.js server running on http://localhost:${port}`);
  console.log(`🔗 Smart Contract deployed. Ledger integrity valid: ${foncierChain.isChainValid()}`);
});
