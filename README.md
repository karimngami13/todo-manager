# Damotech Todo Manager

Application Angular + Firebase développée dans le cadre d'un test technique.

## App live Link : https://todo-manager-prod.web.app


## Stack technique

- Frontend : Angular 19, TypeScript strict, Standalone Components, Signals
- Auth : Firebase Authentication (Email/Password + Google)
- DB : Cloud Firestore
- Storage : Firebase Cloud Storage
- Functions : Cloud Functions v2 (3 fonctions)
- Hosting : Firebase Hosting

## Prérequis

- Node.js >= 20
- Angular CLI : `npm i -g @angular/cli`
- Firebase CLI : `npm i -g firebase-tools`
- Java >= 21 (pour les emulators)

## Installation
```bash
git clone https://github.com/karimngami13/todo-manager.git
cd todo-manager
npm install
cd functions && npm install && cd ..
cp src/environments/environment.example.ts src/environments/environment.ts
# Remplir les valeurs Firebase dans environment.ts
```

## Développement local
```bash
# Terminal 1 — Emulators
firebase emulators:start --export-on-exit=./emulator-data --import=./emulator-data

# Terminal 2 — Angular
ng serve
```

App disponible sur `http://localhost:4200`
Emulator UI sur `http://127.0.0.1:4000`

## Tests
```bash
ng test --watch=false --browsers=ChromeHeadless
```

## Déploiement
```bash
ng build --configuration production
firebase deploy
```

## Schéma Firestore
```
todos/{todoId}
   uid: string
   title: string
   description?: string
   status: 'todo' | 'in_progress' | 'done' | 'archived'
   deadline: Timestamp
   categoryId: string | null
   progress: number (calculé par Cloud Function)
   subTasks: SubTask[]
   photos: TodoPhoto[]
   createdAt: Timestamp
   updatedAt: Timestamp

categories/{categoryId}
   uid: string
   name: string
   color?: string
   createdAt: Timestamp
```

## Décisions techniques

**SubTasks et Photos embarqués** dans le document todo (pas de sous-collections) — lecture atomique, limite 1MB largement suffisante.

**Suppression de catégorie** — pas de cascade delete. Les todos gardent leur `categoryId` orphelin et l'UI les affiche "Sans catégorie". Décision intentionnelle pour éviter des écritures massives non contrôlées.

**Cloud Functions v2** — cold starts réduits, meilleure gestion des erreurs.

**Signals + toSignal()** — état réactif moderne sans subscribe() dans les composants.