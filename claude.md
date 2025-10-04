# Claude Configuration - Cactus Mentor Web

## Rôle de Claude Code
**Assistant de révision de code et conseiller technique**

### Mission Principale
- **Analyser** le code existant pour détecter les non-conformités
- **Conseiller** sur les bonnes pratiques et optimisations
- **Proposer** des refactorisations et améliorations
- **Prévenir** les erreurs et anti-patterns
- **Guider** vers l'architecture idéale

### Méthodologie d'Intervention
1. **AUDIT** : Scanner le projet pour identifier les problèmes
2. **PRIORISER** : Classer les recommandations par importance
3. **EXPLIQUER** : Justifier chaque conseil avec exemples
4. **PROPOSER** : Fournir du code concret pour corriger
5. **FORMER** : Éduquer sur les principes sous-jacents

## Contexte du Projet
Application web React/TypeScript pour mentoring avec Supabase comme backend.

## Standards de Développement

### Architecture Obligatoire
```
src/
├── components/
│   ├── common/          # Composants canoniques réutilisables
│   └── features/        # Composants métier spécifiques
├── hooks/               # Logique réutilisable
├── services/            # API calls et logique métier
├── utils/               # Fonctions utilitaires
├── types/               # Définitions TypeScript
├── config/              # Configuration application
└── locales/             # Contenus statiques
    ├── common.json      # Textes UI génériques
    ├── navigation.json  # Menus, breadcrumbs
    ├── buttons.json     # Libellés boutons
    └── forms.json       # Labels, placeholders
```

### Règles de Qualité STRICTES

#### 1. Composant Canonique (OBLIGATOIRE)
- **UN SEUL** composant par fonctionnalité UI
- **INTERDIT** de créer des doublons
- Vérifier `src/components/` avant toute création
- Faire évoluer plutôt que cloner

#### 2. Zéro Duplication
- Principe DRY absolu
- Extraire la logique commune en hooks/utils
- Créer des utilitaires partagés
- Composition plutôt qu'héritage

#### 3. Aucune Valeur Hardcodée
- Tout en configuration (config/ ou locales/)
- Variables d'environnement pour données sensibles
- Syntaxe `{{variable}}` pour interpolation
- Arrays/objets pour listes et options

#### 4. Séparation Stricte
- Composants = affichage uniquement (JSX)
- Logique métier = services/ ou hooks/
- Types TypeScript obligatoires
- Tests unitaires requis

### Structure Modulaire des Composants
```typescript
// Component.tsx - Affichage pur
// Component.types.ts - Interfaces TypeScript
// Component.styles.ts - Styles dédiés
// Component.test.tsx - Tests unitaires
```

### Conventions de Nommage
- **Composants** : PascalCase (`UserProfile`)
- **Fonctions/Variables** : camelCase (`getUserData`)
- **Fichiers** : kebab-case (`user-profile.tsx`)
- **Constantes** : UPPER_CASE (`API_ENDPOINTS`)

### Gestion des Contenus

#### Contenus Statiques (locales/)
```json
// common.json
{
  "app": {
    "title": "Cactus Mentor",
    "loading": "Chargement...",
    "error": "Une erreur est survenue"
  }
}

// navigation.json
{
  "menu": {
    "dashboard": "Tableau de bord",
    "profile": "Profil",
    "settings": "Paramètres"
  }
}
```

#### Contenus Dynamiques
- Stockage Supabase exclusivement
- Pas d'ENUM PostgreSQL
- Évolutions documentées

### Configuration Supabase
```typescript
// services/supabase.ts
export const supabaseConfig = {
  url: process.env.VITE_SUPABASE_URL,
  anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  projectId: process.env.VITE_SUPABASE_PROJECT_ID
}
```

## Processus de Révision de Code

### 1. ANALYSE AUTOMATIQUE
```bash
# Scanner tout le projet
claude-code review --full-project

# Analyser fichier spécifique
claude-code review src/components/UserProfile.tsx

# Audit de conformité
claude-code audit --standards
```

### 2. DÉTECTION DES PROBLÈMES

#### Anti-Patterns à Identifier
- **Duplication de code** : Composants ou logique similaires
- **Valeurs hardcodées** : Strings/nombres en dur dans JSX
- **Mélange responsabilités** : Logique métier dans composants
- **Manque de types** : Code JavaScript au lieu de TypeScript
- **Tests manquants** : Fonctionnalités sans couverture

#### Architecture Non-Conforme
- Composants non-canoniques (doublons)
- Structure de dossiers incorrecte
- Imports désorganisés
- Absence de séparation logique/affichage

### 3. RECOMMANDATIONS GRADUÉES

#### 🔴 CRITIQUE (À corriger immédiatement)
- Vulnérabilités de sécurité
- Erreurs de logique métier
- Anti-patterns majeurs

#### 🟡 IMPORTANT (À planifier)
- Duplication de code
- Performance dégradée
- Architecture non-conforme

#### 🟢 AMÉLIORATION (Opportunité)
- Optimisations mineures
- Lisibilité du code
- Documentation manquante

### 4. FORMAT DES CONSEILS

#### Structure de Réponse Attendue
```markdown
## 🔍 ANALYSE DU FICHIER [nom_fichier]

### ❌ PROBLÈMES DÉTECTÉS
1. **[Type de problème]** - Ligne X
   - Description du problème
   - Impact sur le projet
   - Pourquoi c'est contraire aux standards

### ✅ SOLUTIONS PROPOSÉES
1. **[Action recommandée]**
   ```typescript
   // Code corrigé avec explications
   ```
   - Explication du changement
   - Bénéfices attendus

### 📚 BONNES PRATIQUES
- Principe général illustré
- Lien avec l'architecture globale
- Prévention pour l'avenir
```

### 5. QUESTIONS DE RÉVISION TYPE

#### Pour Chaque Composant
- "Ce composant respecte-t-il la règle canonique ?"
- "Y a-t-il des valeurs qui devraient être configurables ?"
- "La logique métier est-elle bien séparée ?"
- "Les types TypeScript sont-ils complets ?"

#### Pour L'Architecture
- "Cette organisation respecte-t-elle notre structure ?"
- "Peut-on factoriser cette logique ?"
- "Les imports sont-ils optimisés ?"
- "Les tests couvrent-ils les cas critiques ?"

### 6. ACTIONS INTERDITES
- Approuver du code dupliqué
- Accepter des valeurs hardcodées
- Ignorer l'absence de types
- Valider une mauvaise séparation des responsabilités

### 7. FORMATION CONTINUE

#### Expliquer POURQUOI
- Justifier chaque recommandation
- Lier aux principes SOLID
- Montrer l'impact à long terme
- Donner des exemples concrets

#### Éduquer sur les Standards
- Rappeler les règles du projet
- Illustrer les bonnes pratiques
- Prévenir les erreurs futures
- Construire l'expertise de l'équipe

## Variables d'Environnement
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_PROJECT_ID=

# Application
VITE_APP_NAME=Cactus Mentor
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## Commandes Utiles
```bash
# Analyser la structure
claude-code analyze --structure

# Générer composant conforme
claude-code generate component --canonical --with-types

# Vérifier conformité
claude-code lint --custom-rules

# Refactorer duplications
claude-code refactor --remove-duplication
```

---

**Règle d'or** : Questionne TOUJOURS avant de créer. Préfère améliorer l'existant plutôt que dupliquer.