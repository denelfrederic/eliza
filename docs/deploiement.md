# Guide de déploiement ELIZA OS

Ce guide explique comment déployer ELIZA OS en production sur un serveur Linux ou Windows.

## 🎯 Prérequis

- **Serveur** : Linux (Ubuntu 20.04+) ou Windows Server
- **Runtime** : Bun installé globalement
- **Git** : Pour cloner le dépôt
- **Accès réseau** : Port ouvert (par défaut 3000)
- **Clés API** : OpenAI ou Anthropic configurées

## 🔐 Sécurité

⚠️ **Important** : Ne jamais commiter le fichier `.env` qui contient vos clés API.

```bash
# Vérifier que .env est dans .gitignore
echo ".env" >> .gitignore
```

## 🚀 Déploiement étape par étape

### 1. Cloner le dépôt

```bash
git clone https://github.com/denelfrederic/eliza.git
cd eliza/test-agent
```

### 2. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos clés API
nano .env
```

Variables essentielles :
```env
# Au moins une clé API requise
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/eliza

# Production
NODE_ENV=production
PORT=3000
```

### 3. Installation des dépendances

```bash
bun install
```

### 4. Build de production

```bash
bun run build
```

### 5. Lancement en production

```bash
NODE_ENV=production bun run start
```

## 🔄 Supervision avec PM2

### Installation de PM2

```bash
# Installer PM2 globalement
bun install -g pm2
```

### Configuration PM2

Créer `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'eliza-os',
    script: 'bun',
    args: 'run start',
    cwd: '/path/to/eliza/test-agent',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

### Commandes PM2

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Voir les logs
pm2 logs eliza-os

# Redémarrer
pm2 restart eliza-os

# Arrêter
pm2 stop eliza-os

# Sauvegarder la configuration
pm2 save
pm2 startup
```

## 💾 Gestion des données

### Sauvegarde des données

```bash
# Créer un script de sauvegarde
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "eliza_backup_$DATE.tar.gz" data/ .eliza/
```

### Restauration

```bash
# Extraire la sauvegarde
tar -xzf eliza_backup_20240101_120000.tar.gz
```

## 📊 Logs et monitoring

### Localisation des logs

```bash
# Logs PM2
pm2 logs eliza-os

# Logs système (si systemd)
journalctl -u eliza-os -f
```

### Rotation des logs

```bash
# Configuration logrotate
sudo nano /etc/logrotate.d/eliza-os
```

Contenu :
```
/var/log/eliza-os/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 www-data www-data
}
```

## 🔄 Mise à jour et rollback

### Mise à jour

```bash
# Sauvegarder avant mise à jour
pm2 stop eliza-os
cp -r data/ data_backup_$(date +%Y%m%d)/

# Mettre à jour
git pull origin main
bun install
bun run build

# Redémarrer
pm2 start eliza-os
```

### Rollback

```bash
# Revenir à une version précédente
git checkout <commit-hash>
bun install
bun run build
pm2 restart eliza-os
```

### Tags de release (recommandé)

```bash
# Créer un tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Déployer un tag spécifique
git checkout v1.0.0
bun install && bun run build
pm2 restart eliza-os
```

## 🛡️ Sécurité de base

### Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Utilisateur dédié

```bash
# Créer un utilisateur pour l'application
sudo useradd -m -s /bin/bash eliza
sudo chown -R eliza:eliza /path/to/eliza
```

## ❓ FAQ

### Q: L'application ne démarre pas
**A:** Vérifiez les logs avec `pm2 logs eliza-os` et les variables d'environnement.

### Q: Port déjà utilisé
**A:** Changez le port dans `.env` ou arrêtez le processus : `sudo lsof -i :3000`

### Q: Erreur de base de données
**A:** Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` est correct.

### Q: Clés API manquantes
**A:** Vérifiez que `.env` contient au moins `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`.

### Q: Mémoire insuffisante
**A:** Augmentez `max_memory_restart` dans `ecosystem.config.js` ou ajoutez de la RAM.

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/denelfrederic/eliza/issues)
- **Documentation ElizaOS** : [ElizaOS Docs](https://docs.elizaos.com)
- **Communauté** : [ElizaOS Discord](https://discord.gg/elizaos)

---

**Dépôt** : [denelfrederic/eliza](https://github.com/denelfrederic/eliza)
