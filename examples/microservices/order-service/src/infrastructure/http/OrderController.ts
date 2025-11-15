import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus, QueryBus } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { CreateOrder, CreateOrderOutput } from '../../application/commands/CreateOrder.js';
import { GetOrder, OrderDto } from '../../application/queries/GetOrder.js';
import { OrderItem } from '../../domain/entities/Order.js';

interface CreateOrderBody {
  customerId: string;
  items: OrderItem[];
}

interface GetOrderParams {
  id: string;
}

export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async register(app: FastifyInstance): Promise<void> {
    app.post('/orders', this.createOrder.bind(this));
    app.get('/orders/:id', this.getOrder.bind(this));
    app.get('/health', this.health.bind(this));
  }

  private async createOrder(
    request: FastifyRequest<{ Body: CreateOrderBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.commandBus.dispatch<Result<CreateOrderOutput>>(
      new CreateOrder(request.body)
    );

    if (result.isSuccess) {
      reply.status(201).send(result.value);
    } else {
      reply.status(400).send({ error: result.error.message });
    }
  }

  private async getOrder(
    request: FastifyRequest<{ Params: GetOrderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.queryBus.dispatch<Result<OrderDto>>(
      new GetOrder({ id: request.params.id })
    );

    if (result.isSuccess) {
      reply.status(200).send(result.value);
    } else {
      reply.status(404).send({ error: result.error.message });
    }
  }

  private async health(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.status(200).send({
      status: 'ok',
      service: 'order-service',
      timestamp: new Date().toISOString(),
    });
  }
}
