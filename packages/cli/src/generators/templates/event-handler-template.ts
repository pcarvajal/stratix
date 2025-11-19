export function generateEventHandler(
  eventName: string,
  handlerName: string
): string {
  return `import type { EventHandler } from '@stratix/core';
import type { DomainEvent } from '@stratix/core';

// TODO: Import or define ${eventName} type
// import type { ${eventName} } from '../../domain/events/${eventName}.js';

export class ${handlerName} implements EventHandler<DomainEvent> {
  constructor() {}

  async handle(event: DomainEvent): Promise<void> {
    console.log(\`Handling \${event.constructor.name} event:\`, event);
    
    // TODO: Implement your business logic here
    // Examples:
    // - Send notification
    // - Update read model
    // - Trigger another process
    // - Log analytics
  }
}
`;
}
