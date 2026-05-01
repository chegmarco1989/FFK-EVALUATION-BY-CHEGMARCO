# 🚀 Guide d'Installation Complet - FFK Evaluations

Guide pas à pas pour installer et lancer les deux applications **à partir de zéro**.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js** v18+ installé ([nodejs.org](https://nodejs.org))
- ✅ **npm** v9+ (inclus avec Node.js)
- ✅ **PowerShell** (Windows)
- ✅ **Clé API Unsplash** ([unsplash.com/developers](https://unsplash.com/developers))

---

## 🎯 Installation Rapide (Première fois)

### Étape 1 : Cloner ou télécharger le projet

```powershell
cd C:\laragon\www
git clone https://github.com/chegmarco1989/FFK-EVALUATION-BY-CHEGMARCO.git ffk-evaluation
```

### Étape 2 : Installer le Backend

```powershell
# Aller dans le dossier backend
cd C:\laragon\www\ffk-evaluation\backend-users

# Installer les dépendances
npm install

# Configurer l'environnement
Copy-Item .env.example .env

# Éditer le fichier .env et modifier JWT_SECRET
# Exemple : JWT_SECRET=votre-cle-secrete-min-32-caracteres-ici

# Générer le Prisma Client
npm run prisma:generate

# Créer la base de données
npm run prisma:migrate
# Quand demandé, tapez : init

# Lancer le serveur
npm run dev
```

**✅ Le backend devrait démarrer sur http://localhost:9090**

### Étape 3 : Installer le Frontend (nouveau terminal)

```powershell
# Ouvrir un NOUVEAU terminal PowerShell
cd C:\laragon\www\ffk-evaluation\frontend-gallery

# Installer les dépendances
npm install

# Configurer l'environnement
Copy-Item .env.local.example .env.local

# Éditer .env.local et ajouter votre clé Unsplash
# NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=votre-cle-unsplash-ici

# Lancer le serveur
npm run dev
```

**✅ Le frontend devrait démarrer sur http://localhost:3000 ou 3001**

---

## 🔄 Réinstallation Complète (Clean Install)

Si vous rencontrez des problèmes, suivez ces étapes pour tout nettoyer et réinstaller.

### Backend - Nettoyage Complet

```powershell
cd C:\laragon\www\ffk-evaluation\backend-users

# Arrêter le serveur (Ctrl+C)

# Supprimer tous les fichiers générés
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .prisma -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force dev.db -ErrorAction SilentlyContinue
Remove-Item -Force dev.db-journal -ErrorAction SilentlyContinue

# Réinstaller
npm install

# Régénérer Prisma
npm run prisma:generate

# Recréer la base de données
npm run prisma:migrate
# Tapez : init

# Relancer
npm run dev
```

### Frontend - Nettoyage Complet

```powershell
cd C:\laragon\www\ffk-evaluation\frontend-gallery

# Arrêter le serveur (Ctrl+C)

# Supprimer tous les fichiers générés
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Réinstaller
npm install

# Relancer
npm run dev
```

---

## 🎮 Commandes de Démarrage Quotidiennes

Une fois installé, utilisez ces commandes pour démarrer les serveurs :

### Terminal 1 - Backend

```powershell
cd C:\laragon\www\ffk-evaluation\backend-users
npm run dev
```

### Terminal 2 - Frontend

```powershell
cd C:\laragon\www\ffk-evaluation\frontend-gallery
npm run dev
```

---

## 🧪 Vérification de l'Installation

### Backend

1. **Ouvrez** : http://localhost:9090/api/docs
2. **Vous devriez voir** : Documentation Swagger interactive
3. **Testez** : GET /api/users/generate?count=10

### Frontend

1. **Ouvrez** : http://localhost:3000 (ou 3001)
2. **Vous devriez voir** : Page de login élégante
3. **Testez** : Connexion avec `muser1` / `mpassword1`

---

## 🔧 Résolution des Problèmes Courants

### Problème 1 : "Port already in use"

**Backend (port 9090) :**
```powershell
# Trouver le processus
netstat -ano | findstr :9090

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F

# Ou changer le port dans .env
# PORT=9091
```

**Frontend (port 3000) :**
- Next.js utilisera automatiquement le port suivant (3001, 3002, etc.)

### Problème 2 : Erreurs TypeScript dans VS Code

**Solution rapide :**
1. Appuyez sur `Ctrl+Shift+P`
2. Tapez : `TypeScript: Restart TS Server`
3. Appuyez sur Entrée

**Si ça persiste :**
1. Appuyez sur `Ctrl+Shift+P`
2. Tapez : `Developer: Reload Window`
3. Appuyez sur Entrée

**Note** : Si le serveur fonctionne (`npm run dev` démarre sans erreur), ignorez les erreurs VS Code - ce sont des faux positifs.

### Problème 3 : Prisma Client non trouvé

```powershell
cd backend-users
npm run prisma:generate
```

Puis redémarrez VS Code.

### Problème 4 : Images Unsplash ne chargent pas

1. Vérifiez que `.env.local` contient votre clé API
2. Redémarrez le frontend (`Ctrl+C` puis `npm run dev`)
3. Vérifiez la console du navigateur pour les erreurs

### Problème 5 : Base de données corrompue

```powershell
cd backend-users
Remove-Item dev.db -Force
npm run prisma:migrate
# Tapez : reset
```

---

## 📝 Configuration des Fichiers d'Environnement

### Backend - `.env`

```env
PORT=9090
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=votre-cle-secrete-min-32-caracteres-ici
JWT_EXPIRES_IN=24h
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MINUTES=15
CORS_ORIGIN=http://localhost:3000,http://localhost:9090
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/json
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

### Frontend - `.env.local`

```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=votre-cle-unsplash-ici
NEXT_PUBLIC_API_URL=http://localhost:9090/api
NEXT_PUBLIC_IMAGES_PER_PAGE=20
NEXT_PUBLIC_DEBUG_MODE=false
```

---

## 🎯 Credentials de Test

### Login Frontend

| Username | Password | Résultat |
|----------|----------|----------|
| `muser1` | `mpassword1` | ✅ Connexion réussie |
| `muser2` | `mpassword2` | ✅ Connexion réussie |
| `muser3` | `mpassword3` | ❌ Compte bloqué |
| Autre | Autre | ❌ Identifiants invalides |

---

## 📊 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:9090 | API REST |
| **Swagger Docs** | http://localhost:9090/api/docs | Documentation interactive |
| **Health Check** | http://localhost:9090/api/health | Vérification serveur |
| **Frontend** | http://localhost:3000 | Application web |

---

## 🚀 Workflow de Développement

### Démarrage Quotidien

1. **Ouvrir 2 terminaux PowerShell**
2. **Terminal 1** : `cd backend-users && npm run dev`
3. **Terminal 2** : `cd frontend-gallery && npm run dev`
4. **Ouvrir navigateur** : http://localhost:3000

### Arrêt des Serveurs

- Appuyez sur `Ctrl+C` dans chaque terminal

### Redémarrage

- `Ctrl+C` pour arrêter
- `npm run dev` pour relancer

---

## 📦 Structure des Dossiers

```
ffk-evaluation/
├── backend-users/          # API Node.js/Express
│   ├── src/                # Code source TypeScript
│   ├── prisma/             # Schéma base de données
│   ├── tests/              # Tests unitaires
│   ├── .env                # Configuration (à créer)
│   └── dev.db              # Base SQLite (auto-généré)
│
├── frontend-gallery/       # Application Next.js
│   ├── app/                # Pages et routes
│   ├── components/         # Composants React
│   ├── lib/                # Utilitaires
│   ├── .env.local          # Configuration (à créer)
│   └── .next/              # Build Next.js (auto-généré)
│
└── INSTALLATION.md         # Ce fichier
```

---

## 🎓 Commandes Utiles

### Backend

```powershell
npm run dev              # Démarrer en mode développement
npm run build            # Compiler TypeScript
npm start                # Démarrer en mode production
npm test                 # Lancer les tests
npm run prisma:studio    # Interface graphique base de données
npm run lint             # Vérifier le code
```

### Frontend

```powershell
npm run dev              # Démarrer en mode développement
npm run build            # Compiler pour production
npm start                # Démarrer en mode production
npm run lint             # Vérifier le code
npm run type-check       # Vérifier les types TypeScript
```

---

## 💡 Conseils

1. **Toujours démarrer le backend AVANT le frontend**
2. **Gardez les deux terminaux ouverts** pendant le développement
3. **Les erreurs TypeScript dans VS Code** peuvent être ignorées si le serveur fonctionne
4. **Rechargez VS Code** (`Ctrl+Shift+P` → `Developer: Reload Window`) si les erreurs persistent
5. **Consultez les logs** dans les terminaux pour déboguer

---

## 📞 Support

En cas de problème :

1. Vérifiez que Node.js v18+ est installé : `node --version`
2. Vérifiez que npm fonctionne : `npm --version`
3. Consultez les logs dans les terminaux
4. Essayez une réinstallation complète (voir section ci-dessus)

---

## ✅ Checklist de Vérification

Avant de commencer le développement :

- [ ] Node.js v18+ installé
- [ ] npm v9+ installé
- [ ] Clé API Unsplash obtenue
- [ ] Fichier `.env` créé et configuré (backend)
- [ ] Fichier `.env.local` créé et configuré (frontend)
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Swagger accessible sur http://localhost:9090/api/docs
- [ ] Page de login accessible sur http://localhost:3000
- [ ] Connexion avec `muser1`/`mpassword1` fonctionne
- [ ] Images Unsplash se chargent dans la galerie

---

**🎉 Vous êtes prêt ! Bon développement !**

*Par "MARC-AURELE A. CHEGNIMONHAN (Benin Dev.) - Senior Full-Stack Developer"*
