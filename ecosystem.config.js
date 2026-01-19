module.exports = {
  apps: [
    {
      name: 'continental-backend',
      script: 'server.js',
      cwd: '/var/www/continental-academy/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8001
      },
      error_file: '/var/log/pm2/continental-backend-error.log',
      out_file: '/var/log/pm2/continental-backend-out.log',
      log_file: '/var/log/pm2/continental-backend-combined.log',
      time: true
    }
  ]
};
