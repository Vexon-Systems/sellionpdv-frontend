export function validateBuildEnvironment(apiUrl: string | undefined): void {
  const message = 'Build de hospedagem exige VITE_API_URL HTTPS da API; localhost não é permitido.';
  let url: URL;
  try {
    url = new URL(apiUrl?.trim() ?? '');
  } catch {
    throw new Error(message);
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (url.protocol !== 'https:' || url.username || url.password ||
      host === 'localhost' || host.endsWith('.localhost') || host === '[::1]' ||
      host.startsWith('127.') || host === '0.0.0.0' || url.search || url.hash) {
    throw new Error(message);
  }
}
