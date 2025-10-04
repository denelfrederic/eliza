# 🧪 Guide de Test - Solution Ctrl+C

## ✅ **Solution 1 Implémentée**

La configuration PM2 a été modifiée pour résoudre le problème de Ctrl+C :

### 🔧 **Changements Appliqués**

```javascript
// ecosystem.config.js - AVANT
autorestart: true,  // ← PROBLÈME : Redémarre automatiquement

// ecosystem.config.js - APRÈS  
autorestart: false,  // ← SOLUTION : Désactivé l'auto-restart
kill_timeout: 5000,  // ← AJOUT : Timeout pour l'arrêt
wait_ready: true,    // ← AJOUT : Attendre que l'app soit prête
listen_timeout: 10000, // ← AJOUT : Timeout d'écoute
shutdown_with_message: true, // ← AJOUT : Arrêt propre
force: false         // ← AJOUT : Éviter l'arrêt forcé
```

## 🚀 **Comment Tester**

### **Méthode 1 : Script de Test Automatique**
```powershell
# Exécuter le script de test
.\test-ctrl-c.ps1
```

### **Méthode 2 : Test Manuel**

1. **Démarrer le serveur** :
   ```powershell
   .\start-with-pm2.ps1
   ```

2. **Voir les logs** :
   ```bash
   pm2 logs eliza-test-agent
   ```

3. **Tester Ctrl+C** :
   - Appuyez sur `Ctrl+C` dans le terminal des logs
   - Le serveur devrait s'arrêter proprement
   - Plus de redémarrage automatique !

### **Méthode 3 : Commandes PM2 Directes**

```bash
# Démarrer
pm2 start ecosystem.config.js

# Voir les logs
pm2 logs eliza-test-agent

# Arrêter proprement
pm2 stop eliza-test-agent

# Supprimer complètement
pm2 delete eliza-test-agent
```

## 🎯 **Résultats Attendus**

### ✅ **AVANT (Problème)**
- Ctrl+C → Serveur redémarre automatiquement
- Impossible d'arrêter avec Ctrl+C
- Besoin de `pm2 stop` ou `taskkill`

### ✅ **APRÈS (Solution)**
- Ctrl+C → Serveur s'arrête proprement
- Plus de redémarrage automatique
- Arrêt gracieux avec timeout de 5 secondes

## 🔍 **Vérifications**

1. **Statut PM2** :
   ```bash
   pm2 list
   # Devrait montrer "stopped" après Ctrl+C
   ```

2. **Port 3000** :
   ```bash
   netstat -ano | findstr :3000
   # Devrait être libre après arrêt
   ```

3. **Logs d'arrêt** :
   - Messages de fermeture propre
   - Pas de redémarrage automatique
   - Timeout respecté (5 secondes max)

## 🚨 **En Cas de Problème**

Si Ctrl+C ne fonctionne toujours pas :

1. **Arrêt forcé** :
   ```bash
   pm2 kill
   taskkill /F /IM bun.exe
   ```

2. **Vérifier la configuration** :
   ```bash
   pm2 show eliza-test-agent
   # Vérifier que autorestart: false
   ```

3. **Redémarrer proprement** :
   ```bash
   pm2 delete eliza-test-agent
   pm2 start ecosystem.config.js
   ```

## 📋 **Commandes de Gestion**

| Action | Commande | Description |
|--------|----------|-------------|
| **Démarrer** | `pm2 start ecosystem.config.js` | Lance l'agent |
| **Arrêter** | `pm2 stop eliza-test-agent` | Arrêt propre |
| **Redémarrer** | `pm2 restart eliza-test-agent` | Redémarrage |
| **Supprimer** | `pm2 delete eliza-test-agent` | Suppression complète |
| **Logs** | `pm2 logs eliza-test-agent` | Voir les logs |
| **Statut** | `pm2 list` | État des processus |

---

**🎉 La Solution 1 est maintenant implémentée !** Testez avec les scripts fournis.
