import { describe, expect, it } from 'vitest';
import { ContextResolver } from '../src/memory/context-resolver.js';

describe('ContextResolver', () => {
  it('returns null when no reply context exists', async () => {
    const resolver = new ContextResolver(
      { findByBotMessageId: () => null },
      {} as never,
      {} as never
    );
    await expect(resolver.resolveContext('1', 123)).resolves.toBeNull();
  });
});
