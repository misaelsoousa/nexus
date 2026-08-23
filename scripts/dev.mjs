// Wrapper around `next dev` that opens the dev server in the OS default
// browser. Next has no --open flag of its own, so we watch its output for the
// "Local:" URL and hand that to the OS shell -- going through the shell means
// the editor's built-in browser never gets a chance to intercept the link.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');

const args = process.argv.slice(2);
const shouldOpen = args.includes('--open');
const nextArgs = args.filter((arg) => arg !== '--open');

const child = spawn(process.execPath, [nextBin, 'dev', ...nextArgs], {
  stdio: ['inherit', 'pipe', 'pipe'],
  // Next drops colors once its stdout is a pipe instead of a TTY, but forcing
  // them back on would override an explicit NO_COLOR.
  env: process.env.NO_COLOR
    ? process.env
    : { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
});

let opened = false;

function watch(stream, out) {
  stream.on('data', (chunk) => {
    out.write(chunk);
    if (opened || !shouldOpen) return;

    const plain = chunk.toString().replace(/\x1b\[[0-9;]*m/g, '');
    const match = /https?:\/\/(?:localhost|127\.0\.0\.1):\d+/.exec(plain);
    if (match) {
      opened = true;
      openBrowser(match[0]);
    }
  });
}

function openBrowser(url) {
  const [command, commandArgs] =
    process.platform === 'win32'
      ? // `start` reads its first quoted argument as the window title.
        ['cmd', ['/c', 'start', '', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];

  const opener = spawn(command, commandArgs, { detached: true, stdio: 'ignore' });
  opener.on('error', (err) => {
    console.error(`\nNao consegui abrir o navegador (${err.message}). Abra: ${url}\n`);
  });
  opener.unref();
}

watch(child.stdout, process.stdout);
watch(child.stderr, process.stderr);

child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
