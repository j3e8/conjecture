module.exports = {
  apps: [
    {
      name: 'conjecture',
      script: './index.js',
      instances: 1,
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'development' },
      ignore_watch: ['train']
    },
  ],
};
