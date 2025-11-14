// @ts-nocheck
import { Command } from '@stratix/abstractions';
import { z } from 'zod';

export const UpdateProductInputSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;

export class UpdateProduct implements Command<UpdateProductInput> {
  constructor(public readonly data: UpdateProductInput) {}
}
