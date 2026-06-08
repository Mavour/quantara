import type { Bot } from 'grammy';
import { registerScanCommand } from './scan.command.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerScalpCommand(bot: Bot<QuantaraContext>): void {
  registerScanCommand(bot, 'scalp');
}
