module.exports = {
  apps : [{
    name: 'node-hmg',
    script: 'dist/app.js',
    instances: 0,
    autorestart: true,
    watch: false,
    max_memory_restart: '600M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/production',
      repo: 'git@github.com:miranda-ig/node-hmg.git'
    }
  }
};
