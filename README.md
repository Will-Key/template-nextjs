# Next.js Template

Un template moderne pour démarrer rapidement vos projets Next.js avec les meilleures pratiques.

## 🚀 Technologies

- **Next.js 15** - App Router, Server Components, Turbopack
- **Prisma ORM** - PostgreSQL, migrations automatiques, requêtes type-safe
- **Shadcn/UI** - Composants accessibles et personnalisables
- **Tailwind CSS v4** - Styling moderne avec variables CSS
- **TypeScript** - Type-safety complète
- **Authentification JWT** - Cookies HTTP-only sécurisés
- **next-themes** - Support du mode sombre

## 📦 Installation

```bash
# Cloner le template
git clone <your-repo-url> my-project
cd my-project

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer la base de données PostgreSQL dans .env
# DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Générer le client Prisma
pnpm db:generate

# Créer les tables
pnpm db:migrate

# (Optionnel) Remplir avec des données de test
pnpm db:seed
```

## 🏃 Démarrage

```bash
# Mode développement
pnpm dev

# Build production
pnpm build

# Démarrer en production
pnpm start
```

## 📁 Structure du projet

```
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Données de test
├── src/
│   ├── app/
│   │   ├── api/         # Routes API
│   │   │   ├── auth/    # Authentification (login, logout, me)
│   │   │   └── users/   # CRUD utilisateurs
│   │   ├── dashboard/   # Pages dashboard
│   │   ├── login/       # Page de connexion
│   │   └── page.tsx     # Page d'accueil
│   ├── components/
│   │   ├── ui/          # Composants Shadcn/UI
│   │   └── ...          # Composants personnalisés
│   ├── lib/
│   │   ├── auth/        # Contexte et utilitaires auth
│   │   ├── prisma.ts    # Client Prisma
│   │   └── utils.ts     # Utilitaires
│   └── hooks/           # Hooks personnalisés
```

## 🔐 Authentification

Le template inclut un système d'authentification complet :

- **Login** : `POST /api/auth/login`
- **Logout** : `POST /api/auth/logout`
- **Current User** : `GET /api/auth/me`

### Comptes de test

| Email              | Mot de passe | Rôle  |
| ------------------ | ------------ | ----- |
| admin@example.com  | admin123     | admin |
| user@example.com   | user123      | user  |

## 📝 Scripts

```bash
pnpm dev          # Démarrer en développement
pnpm build        # Build production
pnpm start        # Démarrer en production
pnpm lint         # Linter ESLint
pnpm db:generate  # Générer le client Prisma
pnpm db:migrate   # Créer une migration
pnpm db:push      # Push schema sans migration
pnpm db:seed      # Remplir la BDD avec des données de test
pnpm db:reset     # Reset complet de la BDD
pnpm db:studio    # Ouvrir Prisma Studio
```

## 🎨 Personnalisation

### Thème

Modifiez les couleurs dans `src/app/globals.css` :

```css
:root {
  --primary: oklch(0.67 0.18 45);
  /* ... autres variables */
}
```

### Schéma de base de données

Ajoutez vos modèles dans `prisma/schema.prisma` puis :

```bash
pnpm db:migrate
```

### Ajouter des composants Shadcn/UI

```bash
npx shadcn@latest add <component-name>
```

## 📄 License

MIT
