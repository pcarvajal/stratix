import type { TemplateData } from '../../types/index.js';

export const entityTemplate = (data: TemplateData): string => {
  const { entityName, props, naming } = data;
  const hasProps = props.length > 0;

  return `import { ${data.aggregate ? 'AggregateRoot' : 'Entity'} } from '@stratix/primitives';
import { EntityId } from '@stratix/primitives';

export class ${entityName} extends ${data.aggregate ? 'AggregateRoot' : 'Entity'}<EntityId<'${entityName}'>> {
  private constructor(
    id: EntityId<'${entityName}'>,${ hasProps ? '\n' + props.map(p => `    private _${p.name}: ${p.type},`).join('\n') : ''}
  ) {
    super(id);
  }

  static create(${hasProps ? `props: {\n${props.map(p => `    ${p.name}: ${p.type};`).join('\n')}\n  }` : ''}): ${entityName} {
    const id = EntityId.create<'${entityName}'>('${entityName}');
    const entity = new ${entityName}(
      id,${hasProps ? '\n' + props.map(p => `      props.${p.name},`).join('\n') + '\n    ' : ''}
    );
    
    return entity;
  }
${hasProps ? '\n' + props.map(p => `  get ${p.name}(): ${p.type} {\n    return this._${p.name};\n  }\n\n  set${naming?.toPascalCase(p.name) ?? p.name}(${p.name}: ${p.type}): void {\n    this._${p.name} = ${p.name};\n  }`).join('\n\n') : ''}
}
`;
};
