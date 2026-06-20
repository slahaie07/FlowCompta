import { execFile } from 'child_process';

/**
 * Open a URL in the user's default browser (no Git Bash / shell scripts).
 * Windows: cmd.exe `start` — macOS: `open` — Linux: `xdg-open`
 */
export function openUrl(url: string): void {
  if (process.env.BROWSER === 'none') return;

  const platform = process.platform;

  if (platform === 'win32') {
    execFile('cmd.exe', ['/c', 'start', '', url], { windowsHide: true }, () => {});
    return;
  }

  if (platform === 'darwin') {
    execFile('open', [url], () => {});
    return;
  }

  execFile('xdg-open', [url], () => {});
}
