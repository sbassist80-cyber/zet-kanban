module.exports = {
  apps: [
    {
      name: 'zet-kanban',
      cwd: '/Users/bergs/.openclaw/workspace/projects/zet-kanban',
      script: 'npm',
      args: 'run dev',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'ngrok-kanban',
      script: 'ngrok',
      args: 'http 3000 --log=stdout',
      watch: false,
      autorestart: true,
      max_restarts: 10
    }
  ]
};
