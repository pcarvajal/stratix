// @ts-nocheck
import { Query } from '@stratix/abstractions';
import { z } from 'zod';

export const GetProductByIdInputSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

export type GetProductByIdInput = z.infer<typeof GetProductByIdInputSchema>;

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export class GetProductById implements Query<GetProductByIdInput, ProductDTO> {
  constructor(public readonly data: GetProductByIdInput) {}
}
