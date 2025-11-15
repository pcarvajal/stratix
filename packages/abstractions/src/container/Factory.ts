import { ResolutionContext } from './ResolutionContext.js';

/**
 * Factory function that creates a service instance.
 *
 * Receives a ResolutionContext to resolve dependencies.
 *
 * @template T - The type of service this factory creates
 * @param context - The resolution context for resolving dependencies
 * @returns The created service instance
 *
 * @example
 * ```typescript
 * const userServiceFactory: Factory<UserService> = (context) => {
 *   const repository = context.resolve<UserRepository>('userRepository');
 *   const eventBus = context.resolve<EventBus>('eventBus');
 *   return new UserService(repository, eventBus);
 * };
 * ```
 */
export type Factory<T> = (context: ResolutionContext) => T;
