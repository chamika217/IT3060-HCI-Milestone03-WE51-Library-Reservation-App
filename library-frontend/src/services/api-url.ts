export function resolveApiUrl(configured: string | undefined, platform: string, development: boolean, hostUri?: string | null) {
  const url = new URL(configured?.trim() || 'http://localhost:5000/api');
  const loopback = (host: string) => ['localhost', '127.0.0.1', '[::1]'].includes(host);
  if (development && platform !== 'web' && loopback(url.hostname)) {
    // Expo's LAN host is the computer running Metro and the local API.
    const host = hostUri ? new URL(`http://${hostUri}`).hostname : '';
    const lanHost = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    if (lanHost) url.hostname = host;
    else if ((!host || loopback(host)) && platform === 'android') url.hostname = '10.0.2.2';
    // Tunnel hosts do not forward the backend port; use an explicit API URL for tunnels.
  }
  return url.toString().replace(/\/$/, '');
}
