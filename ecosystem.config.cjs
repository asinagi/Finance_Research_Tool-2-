module.exports = {
  apps: [
    {
      name: 'macroquant',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000 --compatibility-date 2026-05-03',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
