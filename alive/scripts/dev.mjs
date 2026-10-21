import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [];
function start(command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (code && !stopping) stop(code); });
}
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (process.platform === 'win32' && child.pid) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
    else child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 350);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
start('go', ['run', './cmd/server'], path.join(root, 'backend'));
start(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], path.join(root, 'frontend'));
