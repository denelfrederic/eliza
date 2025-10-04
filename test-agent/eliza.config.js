export default {
  plugins: [
    '@elizaos/plugin-sql',
    '@elizaos/plugin-openai',
    '@elizaos/plugin-bootstrap'
  ],
  settings: {
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small'
  }
}
