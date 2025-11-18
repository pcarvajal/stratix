import type { TemplateData } from '../../types/index.js';

export const valueObjectTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;
  const hasProps = props.length > 0;

  return `import { ValueObject } from '@stratix/primitives';

export class ${entityName} extends ValueObject {
  private constructor(
${props.map(p => `    private readonly _${p.name}: ${p.type},`).join('\n')}
  ) {
    super();
  }

  static create(${hasProps ? `props: {\n${props.map(p => `    ${p.name}: ${p.type};`).join('\n')}\n  }` : ''}): ${entityName} {
    // Add validation here if needed
${props.filter(p => p.type === 'string').map(p => `    if (!props.${p.name} || props.${p.name}.trim().length === 0) {\n      throw new Error('${entityName}.${p.name} cannot be empty');\n    }`).join('\n')}
    
    return new ${entityName}(
${props.map(p => `      props.${p.name},`).join('\n')}
    );
  }
${hasProps ? '\n' + props.map(p => `  get ${p.name}(): ${p.type} {\n    return this._${p.name};\n  }`).join('\n\n') : ''}

  protected getEqualityComponents(): unknown[] {
    return [${props.map(p => `this._${p.name}`).join(', ')}];
  }
}
`;
};
