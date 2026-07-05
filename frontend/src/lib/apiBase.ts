export const getApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

  if (!configured) {
    return '/api';
  }

  const lowered = configured.toLowerCase();
  if (
    lowered.startsWith('http://localhost') ||
    lowered.startsWith('https://localhost') ||
    lowered.includes('127.0.0.1') ||
    lowered === 'localhost'
  ) {
    return '/api';
  }

  return configured.replace(/\/$/, '');
};
