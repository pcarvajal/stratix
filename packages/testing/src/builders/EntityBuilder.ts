import { Entity, EntityId } from '@stratix/primitives';

/**
 * Generic Entity Builder for testing
 *
 * Provides a fluent API for building test entities.
 *
 * @example
 * ```typescript
 * const user = new EntityBuilder(User)
 *   .withProps({ email: 'test@example.com', name: 'Test' })
 *   .build();
 * ```
 */
export class EntityBuilder<E extends Entity<any>> {
  private props: any = {};
  private id?: any;

  constructor(private readonly EntityClass: new (props: any, id: any) => E) {}

  /**
   * Set entity properties
   */
  withProps(props: Partial<any>): this {
    this.props = { ...this.props, ...props };
    return this;
  }

  /**
   * Set entity ID
   */
  withId(id: any): this {
    this.id = id;
    return this;
  }

  /**
   * Build the entity
   */
  build(): E {
    if (!this.id) {
      this.id = EntityId.create();
    }

    return new this.EntityClass(this.props, this.id);
  }

  /**
   * Build multiple entities
   */
  buildMany(count: number): E[] {
    const entities: E[] = [];

    for (let i = 0; i < count; i++) {
      entities.push(this.build());
    }

    return entities;
  }
}

/**
 * Create an entity builder
 *
 * @example
 * ```typescript
 * const user = entityBuilder(User)
 *   .withProps({ email: 'test@example.com' })
 *   .build();
 * ```
 */
export function entityBuilder<E extends Entity<any>>(
  EntityClass: new (props: any, id: any) => E
): EntityBuilder<E> {
  return new EntityBuilder(EntityClass);
}
