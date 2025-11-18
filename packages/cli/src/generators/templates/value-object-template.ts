import type { TemplateData } from '../../types/index.js';

export const valueObjectTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;
  const hasProps = props.length > 0;

  return `import { ValueObject } from '@stratix/primitives';

interface ${entityName}Props {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class ${entityName} extends ValueObject<${entityName}Props> {
  private constructor(props: ${entityName}Props) {
    super(props);
  }

  static create(${hasProps ? `props: {\n${props.map(p => `    ${p.name}: ${p.type};`).join('\n')}\n  }` : ''}): ${entityName} {
    // Add validation here if needed
${props.filter(p => p.type === 'string').map(p => `    if (!props.${p.name} || props.${p.name}.trim().length === 0) {\n      throw new Error('${entityName}.${p.name} cannot be empty');\n    }`).join('\n')}
    
    return new ${entityName}(props);
  }
${hasProps ? '\n' + props.map(p => `  get ${p.name}(): ${p.type} {\n    return this.props.${p.name};\n  }`).join('\n\n') : ''}

  equals(other: ${entityName}): boolean {
    return ${props.length > 0 ? props.map(p => `this.props.${p.name} === other.props.${p.name}`).join(' && ') : 'true'};
  }
}
`;
};
