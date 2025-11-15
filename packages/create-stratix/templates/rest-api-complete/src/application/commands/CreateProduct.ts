// @ts-nocheck
import { Command } from '@stratix/abstractions';
import { z } from 'zod';

export const CreateProductInputSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().default(''),
  price: z.number().positive('Price must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
});

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;

export interface CreateProductOutput {
  productId: string;
}

export class CreateProduct implements Command<CreateProductInput> {
  constructor(public readonly data: CreateProductInput) {}
}
