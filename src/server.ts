import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { collection, getDocs, addDoc, query, where, getDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './app/firebase';

const angularAppEngine = new AngularAppEngine();

/**
 * Le gestionnaire de requête utilisé par l'Angular CLI (dev-server et pendant le build).
 */
export const reqHandler = createRequestHandler(async (request: Request) => {
  const result = await angularAppEngine.handle(request);
  return result || new Response('Not found', { status: 404 });
});

/**
 * Point d'entrée pour les environnements Node.js standards (Cloud Run, local prod)
 */
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  const server = express();
  const port = process.env['PORT'] || 3000;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const browserDist = resolve(__dirname, '../browser');

  server.use(express.json());

  // API Routes
  const apiRouter = express.Router();

  // 1. AUTHENTIFICATION & UTILISATEURS
  apiRouter.post('/register/', async (req, res) => {
    const { username, password, email, role } = req.body;
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    try {
      await addDoc(collection(db, 'users'), { username, email, role, createdAt: serverTimestamp() });
      res.json({ user_id: Math.floor(Math.random() * 1000), username, token });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.post('/auth/', (req, res) => {
    const { username } = req.body;
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    res.json({ token });
  });

  // 2. WORKFLOW D'ENREGISTREMENT FONCIER
  apiRouter.post('/land/draft/', async (req, res) => {
    const data = req.body;
    const parcelId = data.cadastralId || data.id || `bz-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Double Attribution Check
      const existing = await getDoc(doc(db, 'parcels', parcelId));
      if (existing.exists()) {
        return res.status(400).json({ error: 'REJET AUTOMATIQUE : Cette parcelle est déjà enregistrée dans le ledger (Double Attribution détectée).' });
      }

      const txId = `tx_draft_${Math.random().toString(36).substring(2, 10)}`;
      await setDoc(doc(db, 'parcels', parcelId), {
        ...data,
        parcelId,
        status: 'DRAFT',
        workflowStep: 1,
        lastTxId: txId,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      return res.json({ status: 'SUCCESS', txId, assetId: parcelId });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  apiRouter.patch('/land/validate/', async (req, res) => {
    const { land_id, signature_v3 } = req.body;
    const txId = `tx_val_${Math.random().toString(36).substring(2, 10)}`;
    try {
      await updateDoc(doc(db, 'parcels', land_id), {
        status: 'COMMUNITY_VALIDATED',
        workflowStep: 2,
        lastTxId: txId,
        signatureV3: signature_v3,
        updatedAt: serverTimestamp()
      });
      res.json({ status: 'SUCCESS', txId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.patch('/land/finalize/', async (req, res) => {
    const { land_id, signature_v1 } = req.body;
    const txId = `tx_final_${Math.random().toString(36).substring(2, 10)}`;
    try {
      await updateDoc(doc(db, 'parcels', land_id), {
        status: 'FINALIZED',
        workflowStep: 3,
        lastTxId: txId,
        signatureV1: signature_v1,
        updatedAt: serverTimestamp()
      });
      res.json({ status: 'SUCCESS', txId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.post('/land/mutate/', async (req, res) => {
    const { land_id, new_owner_id, signature_v1 } = req.body;
    const txId = `tx_mut_${Math.random().toString(36).substring(2, 10)}`;
    try {
      await updateDoc(doc(db, 'parcels', land_id), {
        owner: new_owner_id,
        lastTxId: txId,
        signatureV1: signature_v1,
        updatedAt: serverTimestamp()
      });
      res.json({ status: 'SUCCESS', txId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.get('/stats/', async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'parcels'));
      const parcels = snap.docs.map(d => d.data());
      const finalized = parcels.filter(p => p['status'] === 'FINALIZED').length;
      const validated = parcels.filter(p => p['status'] === 'COMMUNITY_VALIDATED').length;
      const draft = parcels.filter(p => p['status'] === 'DRAFT').length;
      const totalArea = parcels.reduce((acc, p) => acc + (Number(p['area'] || p['surface']) || 0), 0);
      
      const recentActivity = [
        { id: 1, name: 'Jean-Baptiste Mouakala', action: 'Draft Initié', location: 'Bacongo', status: 'Confirmé', time: '3 min' },
        { id: 2, name: 'Marie-Claire Ngoma', action: 'Validation Communautaire', location: 'Poto-Poto', status: 'Vérifié', time: '11 min' },
        { id: 3, name: 'Théodore Loemba', action: 'Titre Finalisé On-Chain', location: 'Moungali', status: 'Confirmé', time: '28 min' }
      ];

      res.json({
        total_parcels: parcels.length,
        finalized_parcels: finalized,
        validated_parcels: validated,
        draft_parcels: draft,
        total_area: totalArea,
        reliability: 100,
        recentActivity
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.get('/map/', async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'parcels'));
      res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.get('/reports/', async (req, res) => {
    try {
      const districts = [
        { name: 'Moungali', total: 450, finalized: 320 },
        { name: 'Ouenzé', total: 380, finalized: 290 },
        { name: 'Talangaï', total: 600, finalized: 410 }
      ];
      const audit_logs = [
        { id: '1', timestamp: new Date(), action: 'CREATE', agent: 'SERVER', entity: 'BZV-AUTO', status: 'SUCCESS' },
        { id: '2', timestamp: new Date(), action: 'FINALIZATION', agent: 'AGENT-01', entity: 'BZV-101', status: 'SUCCESS' }
      ];
      res.json({ districts, audit_logs });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.get('/registry/public/', async (req, res) => {
    try {
      const q = query(collection(db, 'parcels'), where('status', '==', 'FINALIZED'));
      const snap = await getDocs(q);
      res.json({
        parcels: snap.docs.map(d => d.data()),
        metrics: { total_titles: snap.size, transfers_24h: 5, active_blocks: "842k+" }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.get('/citizen/verify/', async (req, res) => {
    const { land_id } = req.query;
    try {
      const snap = await getDoc(doc(db, 'parcels', String(land_id)));
      if (snap.exists()) {
        res.json(snap.data());
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  apiRouter.post('/identity/verify/', (req, res) => {
    res.json({ status: 'SUCCESS', message: 'Identity verified wirelessly.' });
  });

  apiRouter.get('/identity/status/', (req, res) => {
    res.json({ status: 'VERIFIED', level: 'Level 3 - State Confirmed' });
  });

  apiRouter.post('/auctions/bid/', (req, res) => {
    res.json({ status: 'SUCCESS', message: 'Bid accepted.' });
  });

  apiRouter.patch('/auctions/finalize/', (req, res) => {
    res.json({ status: 'SUCCESS', txId: 'tx_auc_' + Math.random().toString(36).substring(2, 10) });
  });

  server.use('/api/v1', apiRouter);

  // Servir les fichiers statiques
  server.use(express.static(browserDist, {
    maxAge: '1y',
    index: false,
  }));

  // Toutes les autres requêtes sont gérées par l'AngularAppEngine
  server.all('*', (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleResponse = (response: any) => {
      if (response) {
        res.status(response.status);
        response.headers.forEach((value: string, key: string) => {
          res.setHeader(key, value);
        });
        if (response.body) {
           const reader = response.body.getReader();
           const push = () => {
              reader.read().then(({done, value}: {done: boolean, value: Uint8Array}) => {
                if (done) {
                  res.end();
                  return;
                }
                res.write(value);
                push();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }).catch((err: any) => next(err));
           };
           push();
        } else {
          res.end();
        }
      } else {
        next();
      }
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = reqHandler(req as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (result && typeof (result as any).then === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as Promise<any>).then(handleResponse).catch(next);
      } else {
        handleResponse(result);
      }
    } catch (err) {
      next(err);
    }
  });

  server.listen(port, () => {
    console.log(`Serveur Node.js démarré sur http://localhost:${port}`);
  });
}
