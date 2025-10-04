module.exports = {
  apps: [{
    name: 'eliza-test-agent',
    script: 'bun',
    args: 'run start',
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      ELIZA_SERVER_AUTH_TOKEN: '',
      ELIZA_SERVER_PORT: 3000,
      ELIZA_SERVER_HOST: 'localhost',
      ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3000',
      ELIZA_SERVER_WEBSOCKET_ENABLED: 'true',
      ELIZA_SERVER_WEBSOCKET_PATH: '/socket.io/',
      IGNORE_BOOTSTRAP: 'true',
      ELIZA_DISABLE_UPDATE_CHECK: 'true'
    },
    instances: 1,
    autorestart: false,  // ← CHANGEMENT : Désactiver l'auto-restart
    watch: false,
    max_memory_restart: '1G',
    kill_timeout: 5000,  // ← AJOUT : Timeout pour l'arrêt (5 secondes)
    wait_ready: true,    // ← AJOUT : Attendre que l'app soit prête
    listen_timeout: 10000, // ← AJOUT : Timeout d'écoute (10 secondes)
    shutdown_with_message: true, // ← AJOUT : Arrêt propre avec message
    force: false         // ← AJOUT : Éviter l'arrêt forcé
  }]
}
