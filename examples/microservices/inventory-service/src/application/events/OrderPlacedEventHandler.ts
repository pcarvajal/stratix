import { EventHandler, EventBus, Logger } from '@stratix/abstractions';
import { OrderPlacedEvent } from '../../domain/events/OrderPlacedEvent.js';
import { Inventory, StockReservedEvent, StockReservationFailedEvent } from '../../domain/entities/Inventory.js';
import { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

export class OrderPlacedEventHandler implements EventHandler<OrderPlacedEvent> {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    this.logger.info('Processing order placed event', { orderId: event.orderId });

    try {
      const reservations: Array<{ productId: string; quantity: number }> = [];

      for (const item of event.items) {
        let inventory = await this.inventoryRepository.findByProductId(item.productId);

        if (!inventory) {
          inventory = Inventory.create(item.productId, 0);
          await this.inventoryRepository.save(inventory);
        }

        if (!inventory.canReserve(item.quantity)) {
          const failureEvent = new StockReservationFailedEvent(
            event.orderId,
            `Insufficient stock for product ${item.productId}. Available: ${inventory.available}, Requested: ${item.quantity}`
          );

          await this.eventBus.publish([failureEvent]);

          this.logger.warn('Stock reservation failed', {
            orderId: event.orderId,
            productId: item.productId,
            available: inventory.available,
            requested: item.quantity,
          });

          return;
        }
      }

      for (const item of event.items) {
        const inventory = await this.inventoryRepository.findByProductId(item.productId);
        if (inventory) {
          inventory.reserve(item.quantity);
          await this.inventoryRepository.save(inventory);
          reservations.push({ productId: item.productId, quantity: item.quantity });
        }
      }

      const successEvent = new StockReservedEvent(event.orderId, reservations);
      await this.eventBus.publish([successEvent]);

      this.logger.info('Stock reserved successfully', {
        orderId: event.orderId,
        reservations,
      });
    } catch (error) {
      this.logger.error('Error processing order placed event', {
        orderId: event.orderId,
        error: (error as Error).message,
      });

      const failureEvent = new StockReservationFailedEvent(
        event.orderId,
        `Error processing order: ${(error as Error).message}`
      );

      await this.eventBus.publish([failureEvent]);
    }
  }
}
