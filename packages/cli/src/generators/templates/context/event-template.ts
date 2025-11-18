import type { TemplateData } from '../../../types/index.js';

export const domainEventTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import { DomainEvent } from '@stratix/primitives';
import { EntityId } from '@stratix/primitives';

export class ${entityName}Created extends DomainEvent {
  constructor(public readonly entityId: EntityId<'${entityName}'>) {
    super();
  }
}
`;
};
