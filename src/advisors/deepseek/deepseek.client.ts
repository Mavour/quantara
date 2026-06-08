import { llmConfig } from '../../config/llm.js';

export class DeepSeekError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'DeepSeekError';
  }
}

export class DeepSeekClient {
  async complete(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
    if (!llmConfig.apiKey) {
      throw new DeepSeekError('GENERALCOMPUTE_API_KEY is not configured');
    }

    return this.post(messages, true);
  }

  private async post(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    canRetry: boolean
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), llmConfig.timeoutMs);

    try {
      const response = await fetch(`${llmConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${llmConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: llmConfig.model,
          temperature: llmConfig.temperature,
          max_tokens: llmConfig.maxTokens,
          messages
        })
      });

      if (response.status >= 500 && canRetry) return this.post(messages, false);
      if (!response.ok) throw new DeepSeekError(`DeepSeek request failed: ${response.status}`, response.status);

      const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) throw new DeepSeekError('DeepSeek returned an empty response', response.status);
      return content;
    } catch (error) {
      if (error instanceof DeepSeekError) throw error;
      throw new DeepSeekError(error instanceof Error ? error.message : 'DeepSeek request failed');
    } finally {
      clearTimeout(timeout);
    }
  }
}
