/**
 * The return type of the template tag functions
 */
declare type TemplateResult = {
  template: Template;
  values: Array<unknown>;
  readChunk(options?: RenderOptions): unknown;
};

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
declare class Template {
  constructor(strings: TemplateStringsArray, processor: TemplateProcessor);
  getStrings(options?: RenderOptions): Array<Buffer>;
  getParts(): Array<Part>;
}

interface TemplateResultRenderer {
  push: (chunk: Buffer | null) => boolean;
  destroy: (err: Error) => void;
}

declare enum PartType {
  METADATA = 0,
  ATTRIBUTE = 1,
  CHILD = 2,
  PROPERTY = 3,
  BOOLEAN_ATTRIBUTE = 4,
  EVENT = 5,
  ELEMENT = 6,
}

interface MetadataPartType {
  readonly type: PartType;
  resolveValue(options?: RenderOptions): Buffer;
}

interface ChildPartType {
  tagName: string;
  readonly type: PartType;
  resolveValue(value: unknown, options?: RenderOptions): unknown;
}
interface AttributePartType {
  tagName: string;
  readonly name: string;
  readonly type: PartType;
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}
interface PropertyPartType extends AttributePartType {
  readonly type: PartType;
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}
interface BooleanAttributePartType {
  readonly type: PartType;
  nameAsBuffer: Buffer;
}
interface EventPartType {
  readonly type: PartType;
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
interface ElementPartType {
  readonly type: PartType;
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
declare type Part =
  | MetadataPartType
  | ChildPartType
  | AttributePartType
  | PropertyPartType
  | BooleanAttributePartType
  | ElementPartType
  | EventPartType;

/**
 * Options supported by template render functions
 */
declare type RenderOptions = {
  /**
   * Include inline metadata for rehydration in the browser (default `false`)
   */
  includeRehydrationMetadata?: boolean;
  /**
   * JSON serialize property attributes (default `false`)
   */
  serializePropertyAttributes?: boolean;
};
