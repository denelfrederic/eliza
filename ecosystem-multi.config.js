// Configuration PM2 Multi-Agents ElizaOS
module.exports = {
  apps: [
    {
      name: 'eliza-test-agent',
      script: 'bun',
      args: 'run start',
      cwd: './test-agent',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        ELIZA_SERVER_HOST: 'localhost',
        ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3000',
        ELIZA_SERVER_WEBSOCKET_ENABLED: 'true',
        ELIZA_SERVER_WEBSOCKET_PATH: '/socket.io/',
        IGNORE_BOOTSTRAP: 'true',
        ELIZA_DISABLE_UPDATE_CHECK: 'true'
      },
      autorestart: false,  // ← SOLUTION : Désactivé pour Ctrl+C
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
      force: false
    },
    {
      name: 'eliza-finance-agent',
      script: 'bun',
      args: 'run start',
      cwd: './finance-agent',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,  // ← Port différent
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        ELIZA_SERVER_HOST: 'localhost',
        ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3001',
        ELIZA_SERVER_WEBSOCKET_ENABLED: 'true',
        ELIZA_SERVER_WEBSOCKET_PATH: '/socket.io/',
        IGNORE_BOOTSTRAP: 'true',
        ELIZA_DISABLE_UPDATE_CHECK: 'true'
      },
      autorestart: false,  // ← SOLUTION : Désactivé pour Ctrl+C
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
      force: false
    },
    {
      name: 'eliza-support-agent',
      script: 'bun',
      args: 'run start',
      cwd: './support-agent',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,  // ← Port différent
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        ELIZA_SERVER_HOST: 'localhost',
        ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3002',
        ELIZA_SERVER_WEBSOCKET_ENABLED: 'true',
        ELIZA_SERVER_WEBSOCKET_PATH: '/socket.io/',
        IGNORE_BOOTSTRAP: 'true',
        ELIZA_DISABLE_UPDATE_CHECK: 'true'
      },
      autorestart: false,  // ← SOLUTION : Désactivé pour Ctrl+C
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
      force: false
    }
  ]
}
