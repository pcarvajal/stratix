// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateProductInputSchema } from '../../../application/commands/CreateProduct.js';
import { UpdateProductInputSchema } from '../../../application/commands/UpdateProduct.js';
import { GetProductByIdInputSchema } from '../../../application/queries/GetProductById.js';

export async function productRoutes(fastify: FastifyInstance) {
  const { commandBus, queryBus } = fastify.container.cradle;

  // Create product
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = CreateProductInputSchema.parse(request.body);

      const result = await commandBus.execute('CreateProduct', { data: validatedData });

      if (result.isFailure) {
        return reply.status(400).send({ error: result.error.message });
      }

      return reply.status(201).send(result.value);
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get product by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = GetProductByIdInputSchema.parse(request.params);

      const result = await queryBus.execute('GetProductById', { data: params });

      if (result.isFailure) {
        return reply.status(404).send({ error: result.error.message });
      }

      return reply.status(200).send(result.value);
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // List all products
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await queryBus.execute('ListProducts', { data: undefined });

      if (result.isFailure) {
        return reply.status(500).send({ error: result.error.message });
      }

      return reply.status(200).send(result.value);
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update product
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = UpdateProductInputSchema.parse({
        ...request.params,
        ...request.body,
      });

      const result = await commandBus.execute('UpdateProduct', { data: validatedData });

      if (result.isFailure) {
        const status = result.error.message.includes('not found') ? 404 : 400;
        return reply.status(status).send({ error: result.error.message });
      }

      return reply.status(200).send({ message: 'Product updated successfully' });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Delete product
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = GetProductByIdInputSchema.parse(request.params);

      const { productRepository } = fastify.container.cradle;
      const ProductId = (await import('../../../domain/entities/Product.js')).ProductId;
      const id = ProductId.from(params.id);

      await productRepository.delete(id);

      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
