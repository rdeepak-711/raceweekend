import net from 'node:net';
import { spawn } from 'node:child_process';

const startPort = Number(process.env.PORT || 3002);
const maxPort = Number(process.env.MAX_PORT || startPort + 100);
const extraArgs = process.argv.slice(2);

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.on('error', () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(start, max) {
  for (let port = start; port <= max; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    const isAvailable = await checkPort(port);
    if (isAvailable) return port;
  }
  return null;
}

async function main() {
  const port = await findAvailablePort(startPort, maxPort);

  if (!port) {
    console.error(`[dev] No available port found in range ${startPort}-${maxPort}`);
    process.exit(1);
  }

  console.log(`[dev] Starting Next.js on port ${port}`);

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(npxCmd, ['next', 'dev', '--port', String(port), ...extraArgs], {
    stdio: 'inherit',
  });

  child.on('exit', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    console.error('[dev] Failed to launch Next.js:', err);
    process.exit(1);
  });
}

main();
