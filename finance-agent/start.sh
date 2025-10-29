#!/bin/bash
# ======================================
# SCRIPT DE DÉMARRAGE - FINANCE AGENT
# ======================================
# Ce script simplifie le démarrage de FinanceBot

set -e  # Arrêter en cas d'erreur

echo "🚀 Finance Agent - Démarrage"
echo "=============================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier finance-agent"
    echo "📁 Répertoire actuel: $(pwd)"
    echo "🔧 Solution: cd /c/cursor-projects/eliza/finance-agent"
    exit 1
fi

# Vérifier que Bun est installé
if ! command -v bun &> /dev/null; then
    echo "❌ Erreur: Bun n'est pas installé ou n'est pas dans le PATH"
    echo "🔧 Solution:"
    echo "   1. Installez Bun: curl -fsSL https://bun.sh/install | bash"
    echo "   2. Redémarrez Git Bash en mode administrateur"
    echo "   3. Vérifiez avec: bun --version"
    exit 1
fi

echo "✅ Bun détecté: $(bun --version)"
echo ""

# Vérifier que .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant"
    echo "📝 Création du fichier .env à partir de .env.example (si disponible)..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé à partir de .env.example"
        echo "⚠️  IMPORTANT: Éditez le fichier .env et ajoutez votre clé API"
        echo "   - OPENAI_API_KEY=sk-proj-VOTRE-CLE-ICI"
        echo ""
        read -p "Appuyez sur Entrée après avoir configuré votre .env..."
    else
        echo "❌ Fichier .env.example non trouvé"
        echo "📝 Créez manuellement un fichier .env avec au minimum:"
        echo "   OPENAI_API_KEY=sk-proj-VOTRE-CLE-ICI"
        echo "   PORT=3001"
        echo "   NODE_ENV=development"
        echo ""
        read -p "Appuyez sur Entrée après avoir créé votre .env..."
    fi
fi

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    bun install
    echo "✅ Dépendances installées"
    echo ""
fi

# Build du projet
echo "🔨 Compilation du projet..."
bun run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la compilation"
    exit 1
fi

echo "✅ Build terminé avec succès"
echo ""

# Démarrage de l'agent
echo "🚀 Démarrage de FinanceBot..."
echo "🌐 L'interface sera disponible sur: http://localhost:3001"
echo "⚠️  Pour arrêter l'agent, appuyez sur Ctrl+C"
echo ""
echo "=============================="
echo ""

# Démarrer l'agent
bunx elizaos start

