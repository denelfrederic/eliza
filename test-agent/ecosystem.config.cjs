module.exports = {
  apps: [{
    name: 'eliza-test-agent',
    script: 'bun',
    args: 'run start',
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      OPENAI_MODEL: 'gpt-4o-mini',
      TEXT_EMBEDDING_MODEL: 'text-embedding-3-small',
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
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    shutdown_with_message: true,
    force: false
  }]
};
