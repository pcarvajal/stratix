# Actualizaciones Necesarias en Documentación Docusaurus

## Resumen
Después de revisar toda la documentación de Docusaurus y compararla con el código actual de la CLI, se identificaron las siguientes discrepancias que necesitan corrección.

## 🔴 Cambios Críticos

### 1. Bug en `add.ts` - Extensión `migrations` no definida
**Archivo**: `/packages/cli/src/commands/add.ts`
**Línea**: 168
**Problema**: El código referencia la extensión `'migrations'` en el comando `list`, pero esta extensión NO está definida en el objeto `EXTENSIONS`.

```typescript
// Línea 168 - REFERENCIA A EXTENSIÓN NO EXISTENTE
['http', 'validation', 'mappers', 'auth', 'migrations', 'errors'].forEach(
```

**Solución**: Eliminar `'migrations'` de la lista O agregar la definición de la extensión.

### 2. README.md - Formato de Props Incorrecto
**Archivo**: `/packages/cli/README.md`
**Línea**: 19
**Problema**: El ejemplo usa un formato simplificado que NO es compatible con el código:

```bash
# INCORRECTO (en README)
stratix generate context Products --props "name:string,price:number,stock:number"

# CORRECTO (según el código)
stratix generate context Products --props '[{"name":"name","type":"string"},{"name":"price","type":"number"},{"name":"stock","type":"number"}]'
```

## 🟡 Mejoras Recomendadas

### 3. Opciones Globales No Implementadas
**Archivo**: `/docs/website/docs/cli/cli-overview.md`
**Líneas**: 55-62
**Problema**: La documentación menciona opciones globales que no están implementadas:

```bash
--verbose       Enable verbose output
--quiet         Suppress output
```

**Solución**: 
- Opción A: Implementar estas opciones en el CLI
- Opción B: Eliminar de la documentación

### 4. Actualizar Lista de Extensiones en add-command.md
**Archivo**: `/docs/website/docs/cli/add-command.md`
**Problema**: Asegurar que la lista de extensiones coincida exactamente con las definidas en `add.ts`.

**Extensiones actuales en código (13 total)**:
- postgres
- mongodb
- redis
- rabbitmq
- http
- validation
- auth
- mappers
- errors
- opentelemetry
- secrets
- ai-openai
- ai-anthropic

## ✅ Elementos Correctos (No Requieren Cambios)

1. ✅ Generador `context` - Correctamente documentado
2. ✅ Generador `entity` - Correctamente documentado
3. ✅ Generador `value-object` - Correctamente documentado
4. ✅ Generador `command` - Correctamente documentado
5. ✅ Generador `query` - Correctamente documentado
6. ✅ Generador `repository` - Correctamente documentado
7. ✅ Generador `quality` - Correctamente documentado
8. ✅ Comando `info` - Correctamente documentado
9. ✅ Comando `new` - Correctamente documentado

## Prioridad de Implementación

1. **Alta**: Corregir bug de `migrations` en `add.ts`
2. **Alta**: Corregir formato de props en README.md
3. **Media**: Decidir sobre opciones globales `--verbose` y `--quiet`
4. **Baja**: Verificar que todas las extensiones estén listadas correctamente

## Archivos a Modificar

1. `/packages/cli/src/commands/add.ts` - Eliminar referencia a `migrations`
2. `/packages/cli/README.md` - Corregir ejemplo de props en línea 19
3. `/docs/website/docs/cli/cli-overview.md` - Revisar opciones globales
