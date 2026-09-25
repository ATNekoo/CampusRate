# CampusRate

API REST permettant de consulter des endroits du campus et de publier des appréciations avec une note.

## Démarrage

### 1. Installer les dépendances

```bash
npm ci
```

### 2. Configurer l'environnement

Créer un fichier `.env` à partir de `.env.example` et renseigner les variables nécessaires, notamment :

```env
PORT=3000
DATA_FILE_PATH=./data/db.json
```

Le fichier `.env` ne doit pas être versionné.

### 3. Démarrer l'application

En développement :

```bash
npm run start:dev
```

L'API est ensuite accessible sur :

```text
http://localhost:3000
```

### 4. Documentation Swagger

Swagger UI est disponible à :

```text
http://localhost:3000/docs
```

Swagger permet de consulter et tester les différentes routes de l'API.

---

## Fonctionnalités

CampusRate permet de :

* créer, consulter et lister des `places`;
* modifier et supprimer une `place`;
* créer et lister les `reviews` d'une `place`;
* consulter, modifier et supprimer une `review`;
* filtrer les places par catégorie;
* paginer les résultats;
* calculer automatiquement la note moyenne et le nombre d'avis;
* conserver les données dans un fichier JSON;
* retourner les erreurs dans un format uniforme `Problem Details`.

Les données sont conservées après le redémarrage de l'application grâce à la persistance JSON. Le TP exige également que l'accès au fichier utilise les API asynchrones de `node:fs/promises` et soit séparé de la logique métier.

---

## Technologies

* NestJS
* TypeScript
* JSON
* Swagger / OpenAPI
* Postman
* `class-validator`
* `class-transformer`

---

## Ressources principales

### Place

Une `place` représente un endroit ou un service du campus.

Champs principaux :

* `id`
* `name`
* `description`
* `category`
* `address`
* `services`
* `status`
* `averageRating`
* `reviewCount`
* `createdAt`
* `updatedAt`

Les identifiants sont générés par le serveur. La note moyenne et le nombre d'avis sont également calculés par le serveur.

### Review

Une `review` représente une appréciation associée à une `place`.

Champs principaux :

* `id`
* `placeId`
* `authorName`
* `rating`
* `comment`
* `createdAt`
* `updatedAt`

La note est comprise entre 1 et 5 et une review doit référencer une place existante.

---

## API

Les principales opérations sont :

| Méthode  | Ressource                  | Description                    |
| -------- | -------------------------- | ------------------------------ |
| `POST`   | `/places`                  | Créer une place                |
| `GET`    | `/places`                  | Lister les places              |
| `GET`    | `/places/:id`              | Consulter une place            |
| `PATCH`  | `/places/:id`              | Modifier une place             |
| `DELETE` | `/places/:id`              | Supprimer une place            |
| `POST`   | `/places/:placeId/reviews` | Créer une review               |
| `GET`    | `/places/:placeId/reviews` | Lister les reviews d'une place |
| `GET`    | `/reviews/:id`             | Consulter une review           |
| `PATCH`  | `/reviews/:id`             | Modifier une review            |
| `DELETE` | `/reviews/:id`             | Supprimer une review           |

La collection des places supporte notamment :

```text
?category=STUDY_SPACE
?page=1
?limit=10
```

Le filtre et la pagination peuvent être combinés.

---

## Structure

```text
src/
├── common/
│   ├── dtos/
│   └── filters/
├── places/
│   ├── dtos/
│   ├── entities/
│   ├── enum/
│   ├── places.controller.ts
│   ├── places.service.ts
│   └── places.module.ts
├── reviews/
│   ├── dtos/
│   ├── entities/
│   ├── places-reviews.controller.ts
│   ├── places-reviews.service.ts
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   └── reviews.module.ts
├── storage/
│   ├── storage.module.ts
│   └── storage.service.ts
├── app.module.ts
└── main.ts
```

Les contrôleurs, services, DTO, persistance et gestion globale des erreurs sont séparés conformément à l'organisation demandée par le TP.

---

## Limites connues

* Les données sont stockées localement dans un fichier JSON.
* L'API ne possède pas de système d'authentification.
* La persistance est destinée à un contexte pédagogique et non à une utilisation en production.
* Les scénarios manuels peuvent être exécutés avec Swagger UI ou Postman.

Le TP demande également que Swagger/OpenAPI reflète fidèlement le comportement réel de l'API et que les scénarios de test couvrent les opérations principales, les erreurs, le filtrage, la pagination et la persistance après redémarrage.
