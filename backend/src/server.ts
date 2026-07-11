import { app } from './app';
import { env } from './config/env.config';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║         GrowEasy CRM API Server              ║
  ╠══════════════════════════════════════════════╣
  ║  Status:      Running                        ║
  ║  Environment: ${env.NODE_ENV.padEnd(30)}║
  ║  Port:        ${String(PORT).padEnd(30)}║
  ║  API:         ${`${env.API_PREFIX}/v1`.padEnd(30)}║
  ╚══════════════════════════════════════════════╝
  `);
});

// touch

// touch2
