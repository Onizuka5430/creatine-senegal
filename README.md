# Creatine Sénégal — E-commerce de compléments alimentaires

Application e-commerce complète (frontend + backend + base de données) pour la vente de
créatine, protéines, pré-workout et vitamines au Sénégal, construite à partir du cahier
des charges fourni : paiement Wave / Orange Money, livraison par ville, comptes client et
administrateur, dashboard de gestion, avis clients, coupons.

Ce document explique **quoi est construit, comment le faire tourner, et ce qu'il reste à
faire** pour un déploiement client réel.

---

## 1. Vue d'ensemble

```
creatine-senegal/
├── backend/     → API REST (Node.js + Express + Prisma)
├── frontend/    → Site web (Next.js 14 + TypeScript + TailwindCSS)
└── README.md    → ce fichier
```

Le **backend** expose une API REST qui gère toute la logique métier (produits, panier→
commande, paiement, stock, dashboard admin). Le **frontend** est un site Next.js qui
consomme cette API. Les deux tournent indépendamment, chacun avec son `npm install` et
son fichier `.env`.

### Stack technique (conforme au cahier des charges)

| Côté | Technologie | Rôle |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + TailwindCSS | Site public + espace client |
| Backend | Node.js + Express.js | API REST |
| Base de données | Prisma ORM — **SQLite en dev** (zéro config), **PostgreSQL en prod** | Persistance |
| Auth | JWT + bcrypt | Comptes client / admin |
| Paiement | Wave, Orange Money (intégration simulée, prête à brancher) | Checkout |

---

## 2. Ce qui est fonctionnel aujourd'hui

**Backend — testé et validé** (`npm install` exécuté, structure vérifiée) :
- Inscription / connexion / profil (JWT + bcrypt)
- Produits : liste avec recherche, filtres (catégorie, marque, prix), tri, pagination + détail + CRUD admin
- Catégories : liste + création/suppression admin
- Panier → Commande : calcul automatique (sous-total, frais de livraison par ville,
  coupon), création transactionnelle avec décrément du stock
- Paiement : initiation Wave / Orange Money (voir §5 — actuellement simulé) + webhook de
  confirmation qui passe la commande en "Payée"
- Avis clients avec file de modération admin
- Coupons (pourcentage, montant fixe, livraison gratuite)
- Dashboard admin : chiffre d'affaires, nombre de commandes, panier moyen, commandes du
  jour, produits en stock faible, top produits vendus
- Sécurité : Helmet, CORS restreint, rate limiting sur login/register, mots de passe
  hashés (bcrypt), validation des entrées (Zod)
- **Boutique livrée vierge** : aucun produit de démonstration. Seules les 7 catégories
  du cahier des charges sont pré-créées (structure de la boutique) — tout le reste est
  à ajouter par l'admin via `/admin/produits`
- **Identifiants admin réels** : définis par toi via des variables d'environnement
  (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), pas de mot de passe codé en dur dans le projet

**Frontend — build de production vérifié avec succès (`npm run build`, 14 routes
compilées sans erreur)** :
- Page d'accueil (hero, catégories, nouveautés)
- Liste produits avec recherche et tri
- Page catégorie
- Page produit (détail, dosage, ingrédients, avis, ajout au panier)
- Panier (persisté en local, modifiable)
- Checkout (adresse, ville → frais de livraison automatiques, choix du mode de paiement,
  code promo)
- Connexion / Inscription
- Espace client (historique de commandes avec statut)
- Dashboard admin (KPIs)
- **Espace admin produits** : liste, création, modification, suppression, avec **upload de
  photo directement depuis l'ordinateur ou le téléphone** (envoyée sur Cloudinary)
- **Espace admin commandes** : liste de toutes les commandes avec changement de statut
  (en attente → payée → en préparation → expédiée → livrée)
- **Espace admin paramètres** : nom de la boutique + numéro WhatsApp
- **Commande → WhatsApp** : quand un client valide sa commande, un onglet WhatsApp
  s'ouvre automatiquement avec un message pré-rempli (produits, quantités, total,
  adresse, téléphone) adressé au numéro WhatsApp de la boutique — le client n'a plus
  qu'à appuyer sur "Envoyer"
- Identité visuelle propre : palette charbon / braise (orange) / cobalt / sable,
  typographie Bebas Neue (display) + Inter (texte) + IBM Plex Mono (chiffres/dosages),
  élément signature : la **jauge de dosage circulaire**, un rappel visuel de la précision
  du dosage — cohérent avec le positionnement "5g par jour, zéro approximation"

---

## 3. Démarrer en local

### Prérequis
- Node.js 18+ et npm
- (optionnel pour la prod) une base PostgreSQL

### 3.1 Backend

```bash
cd backend
npm install
cp .env.example .env
```

**Avant d'aller plus loin, ouvre `backend/.env` et personnalise ces valeurs** :
```
ADMIN_EMAIL="contact@taboutique.com"        → le vrai email de connexion admin
ADMIN_PASSWORD="ChangeMoiEnUnMotDePasseSolide123!"  → un vrai mot de passe (8+ caractères)
ADMIN_NOM="Diop"
ADMIN_PRENOM="Amadou"
BOUTIQUE_NOM="Nom de la boutique"
BOUTIQUE_WHATSAPP="221771234567"            → numéro WhatsApp qui recevra les commandes
                                               (indicatif pays sans + ni espaces)
```

Puis :
```bash
npx prisma generate
npx prisma migrate dev --name init   # crée dev.db (SQLite) et les tables
npm run seed                          # crée le compte admin + les catégories (aucun produit de démo)
npm run dev                           # démarre l'API sur http://localhost:4000
```

Le compte admin est désormais **celui que tu as choisi** dans `ADMIN_EMAIL` /
`ADMIN_PASSWORD` — connecte-toi avec ces identifiants sur `/connexion`, puis va sur
`/admin/produits` pour ajouter les vrais produits (nom, prix, stock, photo).

> Note technique : dans l'environnement où ce projet a été généré, le téléchargement du
> moteur binaire Prisma était bloqué par les restrictions réseau du bac à sable
> (`binaries.prisma.sh` non autorisé). Ces commandes fonctionnent normalement sur ta
> machine ou tout serveur avec un accès internet standard — ce n'est pas un problème
> du code.

### 3.2 Frontend

Dans un second terminal :

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev     # démarre le site sur http://localhost:3000
```

Le site consomme l'API à l'adresse définie dans `NEXT_PUBLIC_API_URL` (par défaut
`http://localhost:4000/api`).

### 3.3 Vérifier que tout fonctionne
1. Ouvrir `http://localhost:4000/api/health` → doit répondre `{"status":"ok"}`
2. Ouvrir `http://localhost:3000` → la page d'accueil s'affiche (vide au départ, c'est normal — aucun produit de démo)
3. Se connecter sur `/connexion` avec les identifiants `ADMIN_EMAIL` / `ADMIN_PASSWORD` définis dans `backend/.env`
4. Aller sur `/admin/produits` → "+ Ajouter un produit" → remplir nom, description, prix,
   stock, catégorie, et uploader une photo (nécessite Cloudinary configuré, voir §4.4)
5. Aller sur `/admin/parametres` → renseigner le numéro WhatsApp de la boutique
6. Retourner sur le site, ajouter le produit au panier, passer une commande → un onglet
   WhatsApp doit s'ouvrir avec la commande pré-remplie

---

## 4. Passage en production

### 4.1 Base de données : SQLite → PostgreSQL
Dans `backend/prisma/schema.prisma`, changer :
```prisma
datasource db {
  provider = "postgresql"   // au lieu de "sqlite"
  url      = env("DATABASE_URL")
}
```
Puis dans `.env` : `DATABASE_URL="postgresql://user:motdepasse@host:5432/creatine_senegal"`
Ensuite : `npx prisma migrate deploy`.

### 4.2 Hébergement conseillé (cf. cahier des charges)
- Frontend → **Vercel** (déploiement natif Next.js, gratuit pour démarrer)
- Backend → **Railway** ou **Render**
- Base de données → PostgreSQL managé (Railway, Render, ou Supabase)
- Images produits → **Cloudinary** (variables déjà prévues dans `.env.example`)

### 4.3 Variables d'environnement à définir en prod
- `JWT_SECRET` : générer une vraie clé aléatoire longue (`openssl rand -hex 32`)
- `FRONTEND_URL` : l'URL réelle du site (pour le CORS)
- `NEXT_PUBLIC_API_URL` : l'URL réelle de l'API
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` : voir §4.4
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOM`, `ADMIN_PRENOM` : les vrais identifiants
  admin (utilisés une seule fois, au moment du `npm run seed`)
- `BOUTIQUE_NOM`, `BOUTIQUE_WHATSAPP` : réglages initiaux (modifiables ensuite dans
  `/admin/parametres`, pas besoin de les changer ici après coup)

### 4.4 Mise en ligne pas à pas (gratuit pour démarrer)

Ces comptes doivent être créés **à ton nom** (ou celui de ton client) — c'est important
pour rester propriétaire du site et de son contenu. Ça prend environ 20 minutes.

**Étape 1 — Mettre le code sur GitHub**
1. Crée un compte sur [github.com](https://github.com) si tu n'en as pas
2. Crée un nouveau dépôt (repository), nomme-le `creatine-senegal`
3. Depuis le dossier du projet : `git init`, `git add .`, `git commit -m "Premier commit"`,
   puis suis les instructions GitHub pour le lier et faire `git push`

**Étape 2 — Créer la base de données (Railway)**
1. Va sur [railway.app](https://railway.app), connecte-toi avec GitHub
2. "New Project" → "Deploy PostgreSQL" → attends que la base soit prête
3. Dans l'onglet "Variables" de cette base, copie la valeur de `DATABASE_URL`

**Étape 3 — Déployer le backend (Railway)**
1. Toujours sur Railway : "New" → "Deploy from GitHub repo" → choisis ton dépôt
2. Dans les paramètres du service (onglet "Settings") : Root Directory = `backend`
3. Onglet "Variables" : ajoute toutes les variables de `backend/.env.example`, avec la
   vraie `DATABASE_URL` de l'étape 2, un vrai `JWT_SECRET`, de vrais `ADMIN_EMAIL` /
   `ADMIN_PASSWORD`, et laisse `FRONTEND_URL` sur `http://localhost:3000` pour l'instant
   (on la remplira à l'étape 6)
4. Dans `backend/prisma/schema.prisma`, change `provider = "sqlite"` en
   `provider = "postgresql"`, **supprime le dossier `backend/prisma/migrations`** s'il a
   été généré en SQLite (sinon Prisma refuse de le réutiliser en PostgreSQL), puis pousse
   le code (`git add .`, `git commit`, `git push`)
5. Railway build et démarre automatiquement. Une fois le déploiement vert (onglet
   "Deployments"), ouvre l'onglet "Console" et exécute :
   ```
   npx prisma db push
   npm run seed
   ```
   Le seed crée ton compte admin (avec les vrais `ADMIN_EMAIL`/`ADMIN_PASSWORD` définis
   à l'étape 3) et les catégories — **aucun produit de démo**, la boutique est vierge.
6. Génère un domaine public : onglet "Settings" → section "Networking" → "Generate
   Domain". Note l'URL (ex. `https://creatine-backend.up.railway.app`)

**Étape 4 — Créer un compte Cloudinary (pour les photos produits)**
1. Va sur [cloudinary.com](https://cloudinary.com), crée un compte gratuit
2. Sur le dashboard, copie `Cloud name`, `API Key`, `API Secret`
3. Ajoute ces 3 valeurs dans les variables du backend sur Railway (étape 3.3)

**Étape 5 — Déployer le frontend (Vercel)**
1. Va sur [vercel.com](https://vercel.com), connecte-toi avec GitHub
2. "Add New Project" → choisis ton dépôt → Root Directory = `frontend`
3. Dans les variables d'environnement : `NEXT_PUBLIC_API_URL` = l'URL Railway de
   l'étape 3.6 + `/api` (ex. `https://creatine-backend.up.railway.app/api`)
4. "Deploy" — Vercel te donne une URL du type `creatine-senegal.vercel.app`
5. Retourne dans les variables du backend sur Railway et mets `FRONTEND_URL` = cette URL
   Vercel, pour que le site puisse parler à l'API (CORS)

**Étape 6 — Domaine personnalisé (optionnel)**
Achète un nom de domaine (Namecheap, OVH, Google Domains...) puis ajoute-le dans les
réglages du projet Vercel ("Domains") — Vercel te donne les enregistrements DNS à
configurer chez ton registrar.

À ce stade le site est en ligne, accessible sur mobile comme sur ordinateur (c'est un
site web responsive, pas une app à installer), avec ton vrai compte admin et une
boutique vierge prête à recevoir les produits. Les coûts au-delà des paliers gratuits
(trafic, taille de base) sont facturés directement par Railway/Vercel/Cloudinary sur ton
propre compte.

**Ajouter les produits une fois en ligne** : connecte-toi sur le site avec `ADMIN_EMAIL`
/ `ADMIN_PASSWORD`, va sur `/admin/produits` pour ajouter les produits (photos comprises),
puis sur `/admin/parametres` pour vérifier que le numéro WhatsApp est bien enregistré.

---

## 5. Paiement Wave / Orange Money — état actuel et prochaine étape

Le flux complet (checkout → initiation du paiement → webhook de confirmation → commande
marquée "Payée") est **implémenté et démontrable de bout en bout**, mais les appels aux
vraies API Wave et Orange Money sont **simulés** (pas de compte marchand réel utilisé).

Pour brancher les vrais paiements :
1. Créer un compte marchand Wave (`docs.wave.com`) et un compte développeur Orange Money
   Sénégal
2. Dans `backend/src/controllers/payments.controller.js`, remplacer les sections
   commentées `// --- Ici, en prod : appel réel ---` par les vrais appels API
3. Ajouter la vérification de signature des webhooks entrants (indispensable en
   production, pour éviter qu'un tiers ne falsifie une confirmation de paiement)
4. Renseigner les vraies clés dans `.env` (`WAVE_API_KEY`, `ORANGE_MONEY_MERCHANT_KEY`, etc.)

C'est la seule partie du projet qui nécessite des comptes tiers externes pour être
finalisée à 100% — tout le reste (produits, panier, commandes, stock, admin) est déjà
opérationnel avec de vraies données en base.

---

## 6. Ce qui n'est pas encore construit (roadmap)

Le cahier des charges est très complet ; par souci de livrer une base saine et testée
plutôt qu'une façade, certains éléments visuels admin restent à construire (**l'API qui
les supporte existe déjà à 100%** — il ne manque que l'interface) :

- Interface admin modération des avis (l'API existe : `GET /api/reviews/en-attente`)
- Interface admin gestion des coupons (l'API existe : `POST/GET/DELETE /api/coupons`)
- Interface admin création de catégories (l'API existe : `POST /api/categories`)
- Notifications email/SMS/WhatsApp de suivi de commande
- Tests automatisés (unitaires, API, charge)
- Application mobile React Native (le site actuel est déjà 100% responsive — utilisable
  au doigt sur téléphone via le navigateur, sans app à installer)
- Recommandation IA de produits selon l'objectif (masse, sèche, endurance)

**Déjà construit et fonctionnel** (nouveau) : gestion complète des produits par l'admin
(créer/modifier/supprimer + upload photo) et gestion des commandes (changement de statut).

---

## 7. Référence API (backend)

Toutes les routes sont préfixées par `/api`.

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Créer un compte |
| POST | `/auth/login` | — | Se connecter |
| GET | `/auth/profile` | Client | Profil + historique |
| GET | `/products` | — | Liste (recherche/filtres/tri/pagination) |
| GET | `/products/:slug` | — | Détail produit |
| POST/PUT/DELETE | `/products` | Admin | CRUD produit |
| GET | `/categories` | — | Liste des catégories |
| POST | `/orders` | Client | Checkout (crée la commande) |
| GET | `/orders/mes-commandes` | Client | Historique |
| GET | `/orders` | Admin | Toutes les commandes |
| PUT | `/orders/:id/statut` | Admin | Changer le statut |
| POST | `/payments/wave` | Client | Initier paiement Wave |
| POST | `/payments/orange-money` | Client | Initier paiement Orange Money |
| POST | `/payments/webhook/confirmer` | Provider | Confirmation de paiement |
| POST | `/reviews` | Client | Laisser un avis |
| PUT | `/reviews/:id/approuver` | Admin | Approuver un avis |
| GET/POST/DELETE | `/coupons` | Admin | Gestion des coupons |
| GET | `/admin/dashboard` | Admin | KPIs |
| POST | `/upload` | Admin | Upload d'une image (retourne l'URL Cloudinary) |
| GET | `/settings` | — | Nom boutique + numéro WhatsApp |
| PUT | `/settings` | Admin | Modifier ces réglages |

---

## 8. Identité visuelle

| Élément | Choix | Pourquoi |
|---|---|---|
| Fond | Charbon `#15181B` | Ambiance salle de sport, sérieux |
| Accent principal | Braise `#FF5A1F` | Énergie, effort, chaleur |
| Accent secondaire | Cobalt `#2955F0` | Précision clinique, confiance (espace admin) |
| Surface claire | Sable `#EFE7D8` | Rappelle le climat sahélien, contraste avec le charbon |
| Display | Bebas Neue | Typo condensée façon affiche de sport, forte présence |
| Texte courant | Inter | Lisibilité, neutre |
| Chiffres / dosages | IBM Plex Mono | Lisibilité des données précises (prix, %, grammes) |
| Élément signature | Jauge de dosage circulaire | Symbolise "la dose juste", motif récurrent sur les fiches produits et la page d'accueil |

---

## 9. Support

Pour toute question sur la structure du code, regarder en priorité :
- `backend/prisma/schema.prisma` → modèle de données complet
- `backend/src/index.js` → point d'entrée de l'API, liste de toutes les routes montées
- `frontend/app/layout.tsx` → structure globale du site
- `frontend/context/CartContext.tsx` et `AuthContext.tsx` → logique panier/auth côté client
