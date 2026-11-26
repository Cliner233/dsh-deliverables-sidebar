import { z } from 'zod';
import { KEY, initial, fold } from './model.js';
export const inject = ['sessionProjections'];
export async function apply(ctx) {
  await ctx.sessionProjections.register({
    key: KEY, stateVersion: 1, stateSchema: z.any(), init: initial, apply: fold,
    wire: { viewSchema: z.any(), view: state => state.rows, summary: false },
  });
}
