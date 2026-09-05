import { describe, expect, it } from 'vitest';
import { validateBuildEnvironment } from './validateEnvironment';

describe('ambiente de build', () => {
  it.each([undefined, '', ' ', 'broken', 'http://api.example.com', 'https://localhost', 'https://localhost.', 'https://127.0.0.1', 'https://[::1]', 'https://user:password@api.example.com'])('recusa configuração %s', (url) => {
    expect(() => validateBuildEnvironment(url)).toThrow('VITE_API_URL');
  });
  it('aceita URL HTTPS de API de staging ou produção', () => {
    expect(() => validateBuildEnvironment('https://api.example.com')).not.toThrow();
  });
});
