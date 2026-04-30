# FoncierChain Citoyen 🇨🇬

**Système Décentralisé de Gestion du Cadastre et Sécurisation Foncière (Brazzaville)**

FoncierChain Citoyen est une plateforme innovante conçue pour moderniser et sécuriser l'enregistrement des terres en République du Congo. En utilisant une architecture hybride combinant **Angular**, **Firebase** et une simulation de **Blockchain (Hyperledger Fabric)**, l'application garantit l'immuabilité, la transparence et la traçabilité de chaque titre foncier.

---

## 🌟 Points Forts

- **Triple Validation Immuable** : Workflow rigoureux passant du Géomètre à la Communauté locale, puis à l'Agent National.
- **Registre SIG Dynamique** : Visualisation cartographique (Leaflet) des parcelles sécurisées avec Merkle Proofs.
- **Architecture Zero-Trust** : Sécurité Firebase durcie pour protéger les données sensibles et les identités.
- **Transparence Totale** : Historique complet on-chain disponible pour chaque mutation de propriété.

---

## 🛠️ Architecture Technique

- **Frontend** : [Angular 21+](https://angular.dev/) (Zoneless, Signals)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend & Simulation** : [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Blockchain Simulation** : Service `FancierChain` simulant le consensus et l'ancrage Merkle Root.
- **Cartographie** : [Leaflet](https://leafletjs.com/) pour la visualisation géospatiale.

---

## 👥 Rôles & Permissions

L'application repose sur quatre rôles clés, chacun avec des responsabilités spécifiques en mode "Chain of Trust" :

1. **Géomètre (GEOMETRE)** : Initialise les dossiers, définit les coordonnées GPS et génère le Hash de base.
2. **Chef de Communauté (COMMUNITY)** : Valide l'existence physique et l'absence de litige au niveau local.
3. **Agent Foncier (AGENT)** : Finalise l'ancrage blockchain après vérification administrative.
4. **Administrateur (ADMIN)** : Supervise le système, gère les accès et les rapports de conformité.

---

## 🚀 Installation & Développement

### Prérequis

- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/)

### Configuration

1. Clonez le projet.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Assurez-vous d'avoir le fichier `firebase-applet-config.json` à la racine (généré automatiquement dans l'environnement AI Studio).

### Lancer l'application

```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000`.

---

## 📝 Workflow de Validation (Triple Trust)

1. **Étape 1 (Draft)** : Le géomètre enregistre une parcelle. Elle apparaît en bleu (DRAFT) sur la carte.
2. **Étape 2 (Community)** : La communauté locale valide. Le statut passe en orange (COMMUNITY_VALIDATED).
3. **Étape 3 (Finalization)** : L'agent foncier ancre le titre. Le statut passe en vert (FINALIZED) et devient immuable.

---

## 📊 Structure des Données (Firestore)

Le projet utilise les collections suivantes :
- `parcels` : Stockage des informations parcellaires et preuves Merkle.
- `audit_logs` : Trace indélébile des actions effectuées par les agents.
- `users` : Profils et permissions RBAC.

---

## 🗺️ Visualisation SIG

Accédez à l'onglet **Carte SIG** pour voir en temps réel l'état du cadastre de Brazzaville. Chaque polygone est cliquable pour afficher ses métadonnées on-chain.

---

## 📄 Licence

Propriété de **FoncierChain Team**. Développé dans le cadre de la modernisation des services fonciers en Afrique Centrale.
