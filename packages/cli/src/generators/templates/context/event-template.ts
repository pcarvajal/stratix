import type { TemplateData } from '../../../types/index.js';

export const domainEventTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { DomainEvent } from '@stratix/core';
import { EntityId } from '@stratix/core';

export class ${entityName}Created implements DomainEvent {
  readonly occurredAt: Date;

  constructor(public readonly entityId: EntityId<'${entityName}'>) {
    this.occurredAt = new Date();
  }
}
`;
};
