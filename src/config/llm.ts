import { env } from './env.js';

export const llmConfig = {
  baseUrl: env.GENERALCOMPUTE_BASE_URL,
  apiKey: env.GENERALCOMPUTE_API_KEY,
  model: 'deepseek-chat',
  temperature: 0.3,
  maxTokens: 1000,
  timeoutMs: 15_000
} as const;
