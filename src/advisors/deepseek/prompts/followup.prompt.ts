import type { ResolvedContext } from '../../../core/types.js';

export function buildFollowupPrompt(context: ResolvedContext, question: string): string {
  return [
    'Answer a Telegram follow-up about an old Quantara signal.',
    'Rules: use the snapshot and current status only. Do not create a fresh signal.',
    `Question: ${question}`,
    `Context: ${JSON.stringify(context)}`,
    'Return concise Indonesian answer.'
  ].join('\n');
}
