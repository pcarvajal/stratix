import { EventHandler, Logger } from '@stratix/abstractions';
import { EntityId } from '@stratix/primitives';
import { StockReservedEvent } from '../../domain/events/StockReservedEvent.js';
import { StockReservationFailedEvent } from '../../domain/events/StockReservationFailedEvent.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';

export class StockReservedEventHandler implements EventHandler<StockReservedEvent> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly logger: Logger
  ) {}

  async handle(event: StockReservedEvent): Promise<void> {
    this.logger.info('Stock reserved for order', { orderId: event.orderId });

    const orderId = EntityId.from<'Order'>(event.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (order) {
      order.confirm();
      await this.orderRepository.save(order);
      this.logger.info('Order confirmed', { orderId: event.orderId });
    }
  }
}

export class StockReservationFailedEventHandler
  implements EventHandler<StockReservationFailedEvent>
{
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly logger: Logger
  ) {}

  async handle(event: StockReservationFailedEvent): Promise<void> {
    this.logger.error('Stock reservation failed for order', {
      orderId: event.orderId,
      reason: event.reason,
    });

    const orderId = EntityId.from<'Order'>(event.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (order) {
      order.fail();
      await this.orderRepository.save(order);
      this.logger.info('Order marked as failed', { orderId: event.orderId });
    }
  }
}
