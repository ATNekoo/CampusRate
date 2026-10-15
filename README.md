# CampusRate

API REST permettant de consulter des endroits du campus et d'y publier des appréciations avec une note de 1 à 5.

Les données sont persistées dans **MongoDB** (via Mongoose). Projet du cours 420-514, TP2.

## Démarrage

### 1. Prérequis

* Node.js (version LTS) et npm
* Une instance MongoDB accessible (voir l'étape 3)

### 2. Installer les dépendances

```bash
npm ci
```

### 3. Configurer MongoDB

Trois possibilités :

* **Docker** (le plus simple en local) :

  ```bash
  docker run -d --name campusrate-mongo -p 27017:27017 mongo:7
  ```

* **MongoDB installé localement** : le serveur écoute par défaut sur `mongodb://localhost:27017`.

* **MongoDB Atlas** : créer un utilisateur dédié à l'application, avec seulement les droits de lecture et d'écriture sur sa base, et n'autoriser que les adresses IP nécessaires (jamais `0.0.0.0/0`).

La base et les collections (`places`, `reviews`) sont créées automatiquement au premier enregistrement.

### 4. Créer le fichier `.env`

Copier `.env.example` vers `.env` :

```powershell
# Windows (PowerShell)
Copy-Item .env.example .env
```

```bash
# Linux / macOS
cp .env.example .env
```

Puis renseigner les variables :

| Variable | Obligatoire | Description |
| --- | --- | --- |
| `MONGO_URI` | Oui | URI de connexion MongoDB. L'application refuse de démarrer si elle est absente. |
| `PORT` | Non | Port HTTP (3000 par défaut). |
| `CORS_ORIGINS` | Non | Origines autorisées pour les navigateurs, séparées par des virgules. Si la variable est vide, aucune origine de navigateur n'est autorisée. |
| `NODE_ENV` | Non | En `production`, les index MongoDB ne sont pas créés automatiquement au démarrage. |

Exemple :

```env
MONGO_URI=mongodb://localhost:27017/campusrate
PORT=3000
CORS_ORIGINS=http://localhost:5173
```

### 5. Démarrer l'application

```bash
npm run start:dev
```

Pour un démarrage de type production :

```bash
npm run build
npm run start:prod
```

L'API est ensuite accessible sur :

```text
http://localhost:3000/api/v1/places
```

### 6. Accéder à Swagger

```text
http://localhost:3000/docs
```

Swagger UI permet de consulter le contrat de l'API (propriétés obligatoires, contraintes, réponses d'erreur) et de tester les routes.

### 7. Vérifications avant remise

```bash
npm ci
npm run lint
npm run build
```

---

## Fonctionnalités

* Créer, consulter, lister, modifier et supprimer des `places`.
* Créer et lister les `reviews` d'une `place`; consulter, modifier et supprimer une `review`.
* Filtrer les places par catégorie et paginer les résultats.
* Calculer automatiquement la note moyenne et le nombre d'avis de chaque place.
* Persister les données dans MongoDB (elles sont conservées après le redémarrage de l'API).
* Retourner les erreurs dans un format uniforme `Problem Details`.

### Règles métier

* Une `review` doit référencer une `place` existante (sinon `404`).
* Une `place` qui a encore des reviews ne peut pas être supprimée (`409`).
* `averageRating` et `reviewCount` sont recalculés après chaque création, modification ou suppression de review. `averageRating` vaut `null` tant qu'une place n'a aucune review; sinon c'est la moyenne arrondie à deux décimales.
* Les identifiants sont générés par le serveur : `plc_` (places) ou `rev_` (reviews) suivi de 10 caractères hexadécimaux.

---

## Ressources

### Place

`id`, `name`, `description`, `category`, `address`, `services`, `status`, `averageRating`, `reviewCount`, `createdAt`, `updatedAt`.

Les valeurs possibles de `category` et `status` sont documentées dans Swagger.

### Review

`id`, `placeId`, `authorName`, `rating`, `comment`, `createdAt`, `updatedAt`.

---

## API

Toutes les routes sont préfixées par `/api/v1`.

| Méthode | Ressource | Description | Succès |
| --- | --- | --- | --- |
| `POST` | `/places` | Créer une place | `201` + en-tête `Location` |
| `GET` | `/places` | Lister les places (filtre, pagination) | `200` |
| `GET` | `/places/:id` | Consulter une place | `200` |
| `PATCH` | `/places/:id` | Modifier une place | `200` |
| `DELETE` | `/places/:id` | Supprimer une place (refusé si elle a des reviews) | `204` |
| `POST` | `/places/:placeId/reviews` | Créer une review | `201` + en-tête `Location` |
| `GET` | `/places/:placeId/reviews` | Lister les reviews d'une place | `200` |
| `GET` | `/reviews/:id` | Consulter une review | `200` |
| `PATCH` | `/reviews/:id` | Modifier une review (`rating` et `comment` seulement) | `200` |
| `DELETE` | `/reviews/:id` | Supprimer une review | `204` |

La collection des places accepte :

```text
?category=STUDY_SPACE
?page=1
?limit=10
```

Le filtre et la pagination peuvent être combinés. `page` vaut 1 par défaut, `limit` vaut 10 par défaut (maximum 30).

---

## Validations principales

Toutes les données reçues d'un client sont considérées comme non fiables. Un `ValidationPipe` global est configuré avec `whitelist`, `forbidNonWhitelisted` et `transform`.

| Ressource | Champ | Règle |
| --- | --- | --- |
| Place | `name` | Texte obligatoire, 3 à 120 caractères |
| Place | `description` | Texte obligatoire, 10 à 500 caractères |
| Place | `category` | Obligatoire, valeur de l'énumération |
| Place | `address` | Texte obligatoire, 3 à 200 caractères |
| Place | `services` | Optionnel, tableau de textes sans doublons |
| Place | `status` | Optionnel, valeur de l'énumération (`ACTIVE` par défaut) |
| Review | `authorName` | Texte obligatoire, 2 à 80 caractères |
| Review | `rating` | Entier obligatoire, de 1 à 5 |
| Review | `comment` | Texte obligatoire, 5 à 300 caractères |
| Liste des places | `category`, `page`, `limit` | `category` de l'énumération, `page` entier >= 1, `limit` entier de 1 à 30 |

Règles générales :

* Les textes sont nettoyés (espaces au début et à la fin retirés) avant la validation.
* Toute propriété inconnue ou interdite est **refusée** avec une erreur `400` (elle n'est pas ignorée silencieusement).
* Le client ne peut pas imposer `id`, `createdAt`, `updatedAt`, `averageRating`, `reviewCount` ni `placeId` dans le corps d'une requête : ces propriétés sont gérées par le serveur.
* Une valeur `null` est refusée lors d'une modification (`PATCH`).
* Aucun objet fourni par le client n'est transmis directement à MongoDB : les champs sont copiés explicitement du DTO vers l'opération de persistance.
* Les mises à jour exécutent aussi les validateurs Mongoose (`runValidators`), et le schéma Mongoose limite lui aussi les valeurs (`required`, énumérations, `min` et `max`).

---

## Format des erreurs

Les erreurs suivent le format `Problem Details` (type de contenu `application/problem+json`) :

```json
{
  "type": "https://campusrate.example/errors/validation-failed",
  "title": "Validation failed",
  "status": 400,
  "detail": "The request contains invalid data.",
  "instance": "/api/v1/places",
  "errors": ["name must be longer than or equal to 3 characters"]
}
```

| Situation | Statut |
| --- | --- |
| Donnée invalide, propriété manquante, inconnue ou interdite | `400` |
| Ressource introuvable | `404` |
| Place supprimée alors qu'elle a des reviews | `409` |
| Base de données indisponible | `503` |
| Erreur interne inattendue | `500` (message générique) |

Le client ne reçoit jamais la pile d'appel ni le détail d'une erreur Mongoose ou MongoDB. Les erreurs `5xx` sont journalisées côté serveur.

---

## Sécurité HTTP

* **Helmet** ajoute des en-têtes HTTP de sécurité (par exemple `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`) et retire `X-Powered-By`. Il réduit certains risques côté navigateur, mais ne remplace ni la validation, ni l'authentification.
* **CORS** est configuré explicitement : seules les origines listées dans `CORS_ORIGINS` sont autorisées, avec les méthodes `GET`, `POST`, `PATCH` et `DELETE` et l'en-tête `Content-Type`. CORS limite ce que les navigateurs peuvent lire d'une autre origine, mais **n'est pas une authentification** : un client qui n'est pas un navigateur (curl, Postman, un script) n'est pas bloqué.
* **Secrets** : `.env` n'est pas versionné et la configuration est validée au démarrage.

### Rôle de HTTPS

HTTPS est HTTP transporté dans une connexion chiffrée TLS. Il garantit la confidentialité des échanges (un tiers sur le réseau ne peut pas lire les requêtes ni les réponses), leur intégrité (elles ne peuvent pas être modifiées en transit) et l'identité du serveur grâce à son certificat. L'application ne gère pas TLS elle-même : en production, elle doit être placée derrière un serveur ou un proxy qui assure HTTPS. L'en-tête `Strict-Transport-Security` ajouté par Helmet indique aux navigateurs de n'utiliser que HTTPS pour ce site.

---

## Options réalisées

| Code | Option | Où la retrouver |
| --- | --- | --- |
| P1 | Allowlist explicite de filtres : seul le filtre `category` est transmis à MongoDB, construit champ par champ; `page` et `limit` sont bornés | `PlacesService.findAll`, `QueryPlacesDto` |
| P2 | Sélection explicite des propriétés modifiables : liste `EDITABLE_FIELDS` pour les places, `rating` et `comment` seulement pour les reviews | `PlacesService.update`, `ReviewsService.update` |
| M2 | Agrégation MongoDB (`$match` puis `$group` avec `$avg` et `$sum`) pour calculer la note moyenne et le nombre d'avis d'une place | `ReviewsRepository.aggregateStats` |
| M3 | Choix référence plutôt qu'imbrication, justifié ci-dessous | Schémas `Place` et `Review` |
| T1 | Rôle de HTTPS expliqué (section « Rôle de HTTPS ») | Ce README |

### M3 : référence plutôt qu'imbrication

Les `reviews` sont stockées dans une collection séparée et référencent leur `place` par `placeId`, plutôt que d'être imbriquées dans le document `place`. Le nombre d'avis n'est pas borné : l'imbrication ferait grossir le document `place` (limite de 16 Mo) et alourdirait chaque lecture de la liste des places. Les reviews ont aussi leur propre cycle de vie (`GET`, `PATCH` et `DELETE /reviews/:id`), plus simple à gérer comme documents indépendants, et un index sur `placeId` rend la recherche des reviews d'une place efficace. Le compromis est qu'il faut une seconde requête pour lire les avis et qu'il faut recalculer `averageRating` et `reviewCount` (par agrégation) après chaque changement.

Toute option qui n'est pas listée ci-dessus n'est pas implantée.

---

## Structure

```text
src/
├── common/
│   ├── dtos/            # ProblemDetails
│   └── filters/         # ProblemDetailsFilter
├── config/
│   └── database.config.ts
├── places/
│   ├── dtos/
│   ├── enum/
│   ├── schemas/
│   ├── places.controller.ts
│   ├── places.service.ts
│   ├── places.repository.ts
│   └── places.module.ts
├── reviews/
│   ├── dtos/
│   ├── schemas/
│   ├── places-reviews.controller.ts
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   ├── reviews.repository.ts
│   └── reviews.module.ts
├── app.module.ts
└── main.ts
```

Les contrôleurs (HTTP), les services (règles métier), les repositories (accès à MongoDB) et les schémas Mongoose sont séparés.

---

## Vérification

Les scénarios de vérification (création valide, consultation, persistance après redémarrage, propriété obligatoire absente, valeur invalide, propriété inconnue ou interdite, modification valide, modification d'un champ contrôlé par le serveur) sont disponibles dans la collection Postman `postman/campusrate.postman_collection.json` et peuvent aussi être exécutés avec Swagger UI.

---

## Limites connues

* Aucune authentification ni autorisation : n'importe quel client peut créer, modifier ou supprimer des données.
* L'application sert uniquement du HTTP; HTTPS doit être assuré devant l'application en production.
* Pas de limitation de débit, pas de limite de taille de corps configurée explicitement (seule la limite par défaut du parseur JSON s'applique) et pas de vérification explicite du `Content-Type`.
* Swagger UI est exposé sans protection : en production, il devrait être désactivé ou protégé.
* En production (`NODE_ENV=production`), les index MongoDB ne sont pas créés automatiquement au démarrage.
* Dans Swagger, les réponses de succès ne sont pas décrites par un schéma détaillé et les erreurs sont présentées en `application/json` alors qu'elles sont retournées en `application/problem+json`. L'exemple d'erreur affiché est le même pour tous les statuts.
* La journalisation se limite à l'affichage des erreurs `5xx` dans la console du serveur.
