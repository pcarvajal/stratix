import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CommandBus, QueryBus } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { CreateProduct, CreateProductOutput } from '../../application/commands/CreateProduct.js';
import { UpdateProductPrice } from '../../application/commands/UpdateProductPrice.js';
import { GetProduct, ProductDto } from '../../application/queries/GetProduct.js';
import { ListProducts, ListProductsOutput } from '../../application/queries/ListProducts.js';

export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async register(app: FastifyInstance): Promise<void> {
    // Create product
    app.post('/products', async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as any;

      const result = await this.commandBus.dispatch<Result<CreateProductOutput>>(
        new CreateProduct({
          name: body.name,
          description: body.description,
          price: body.price,
          stock: body.stock,
          category: body.category,
        }),
      );

      if (result.isSuccess) {
        return reply.status(201).send(result.value);
      } else {
        return reply.status(400).send({ error: result.error.message });
      }
    });

    // Get product by ID
    app.get('/products/:id', async (request: FastifyRequest, reply: FastifyReply) => {
      const params = request.params as any;

      const result = await this.queryBus.execute<Result<ProductDto>>(
        new GetProduct({ id: params.id }),
      );

      if (result.isSuccess) {
        return reply.status(200).send(result.value);
      } else {
        return reply.status(404).send({ error: result.error.message });
      }
    });

    // List products
    app.get('/products', async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as any;

      const result = await this.queryBus.execute<Result<ListProductsOutput>>(
        new ListProducts({
          category: query.category,
          availableOnly: query.availableOnly === 'true',
        }),
      );

      if (result.isSuccess) {
        return reply.status(200).send(result.value);
      } else {
        return reply.status(500).send({ error: result.error.message });
      }
    });

    // Update product price
    app.patch('/products/:id/price', async (request: FastifyRequest, reply: FastifyReply) => {
      const params = request.params as any;
      const body = request.body as any;

      const result = await this.commandBus.dispatch<Result<void>>(
        new UpdateProductPrice({
          id: params.id,
          price: body.price,
        }),
      );

      if (result.isSuccess) {
        return reply.status(204).send();
      } else {
        return reply.status(400).send({ error: result.error.message });
      }
    });
  }
}
