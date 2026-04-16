import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const angularAppEngine = new AngularAppEngine();

/**
 * Gestionnaire pour Netlify
 */
export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  let context = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { getContext } = await import('@netlify/angular-runtime/context.mjs' as any);
    context = getContext();
  } catch {
    // On ignore si on n'est pas sur Netlify
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * Le gestionnaire de requête utilisé par l'Angular CLI (dev-server et pendant le build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);

/**
 * Point d'entrée pour les environnements Node.js standards (Cloud Run, local prod)
 */
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  const server = express();
  const port = process.env['PORT'] || 3000;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const browserDist = resolve(__dirname, '../browser');

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
