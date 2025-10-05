#!/bin/bash
# ======================================
# SCRIPT DE DÉMARRAGE ELIZAOS - GIT BASH
# ======================================

echo "🚀 ElizaOS - Démarrage avec Git Bash"
echo "====================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "test-agent" ] || [ ! -d "finance-agent" ] || [ ! -d "support-agent" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet ElizaOS"
    echo "📁 Répertoire actuel: $(pwd)"
    echo "🔧 Solution: cd /c/cursor-projects/eliza"
    exit 1
fi

# Fonction pour démarrer un agent
start_agent() {
    local agent=$1
    local port=$2
    
    echo "🔧 Démarrage de l'agent $agent (Port $port)..."
    
    if [ -d "$agent" ]; then
        cd "$agent"
        
        # Vérifier que .env existe
        if [ ! -f ".env" ]; then
            echo "⚠️  Fichier .env manquant dans $agent"
            echo "📝 Copiez .env.example vers .env et configurez vos clés API"
            if [ -f ".env.example" ]; then
                cp .env.example .env
                echo "✅ Fichier .env créé à partir de .env.example"
            fi
        fi
        
        # Build et démarrage
        echo "🔨 Building $agent..."
        bun run build
        
        echo "🚀 Starting $agent..."
        bunx elizaos start
        
    else
        echo "❌ Agent $agent non trouvé"
    fi
}

# Menu de sélection
echo ""
echo "🤖 Sélectionnez l'agent à démarrer:"
echo "1) test-agent (Port 3000)"
echo "2) finance-agent (Port 3001)" 
echo "3) support-agent (Port 3002)"
echo "4) Tous les agents"
echo "5) Quitter"
echo ""

read -p "Votre choix (1-5): " choice

case $choice in
    1)
        start_agent "test-agent" "3000"
        ;;
    2)
        start_agent "finance-agent" "3001"
        ;;
    3)
        start_agent "support-agent" "3002"
        ;;
    4)
        echo "🚀 Démarrage de tous les agents..."
        echo "⚠️  Note: Ouvrez des terminaux séparés pour chaque agent"
        echo ""
        echo "Terminal 1: cd test-agent && bunx elizaos start"
        echo "Terminal 2: cd finance-agent && bunx elizaos start"  
        echo "Terminal 3: cd support-agent && bunx elizaos start"
        ;;
    5)
        echo "👋 Au revoir !"
        exit 0
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Script terminé"
echo "🌐 Accédez à l'interface: http://localhost:3000 (ou port correspondant)"
echo "📚 Documentation: docs/git-bash-guide.md"
