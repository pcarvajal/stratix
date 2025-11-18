import type { TemplateData } from '../../../types/index.js';

export const contextEntityTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `import { AggregateRoot, EntityId } from '@stratix/primitives';
import { ${entityName}Created } from '../events/${entityName}Created.js';

export class ${entityName} extends AggregateRoot<'${entityName}'> {
  private constructor(
    id: EntityId<'${entityName}'>,
    createdAt: Date,
    updatedAt: Date,${ props.length > 0 ? '\n' + props.map(p => `    private _${p.name}: ${p.type},`).join('\n') : ''}
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(props: {
${props.map(p => `    ${p.name}: ${p.type};`).join('\n')}
  }): ${entityName} {
    const id = EntityId.create<'${entityName}'>();
    const now = new Date();
    const entity = new ${entityName}(
      id,
      now,
      now,${props.length > 0 ? '\n' + props.map(p => `      props.${p.name},`).join('\n') : ''}
    );
    
    entity.record({
      occurredAt: new Date(),
      entityId: id,
    } as ${entityName}Created);
    
    return entity;
  }

  update(props: Partial<{
${props.map(p => `    ${p.name}: ${p.type};`).join('\n')}
  }>): void {
${props.map(p => `    if (props.${p.name} !== undefined) {\n      this._${p.name} = props.${p.name};\n      this.touch();\n    }`).join('\n')}
  }
${props.length > 0 ? '\n' + props.map(p => `  get ${p.name}(): ${p.type} {\n    return this._${p.name};\n  }`).join('\n\n') : ''}
}
`;
};
