import { isAttributePart, isChildPart, isCustomElementPart, isMetadataPart } from './parts.js';
import { META_CHILD_CLOSE, META_CLOSE } from './consts.js';
import { Buffer } from '#buffer';

let id = 0;

/**
 * A class for consuming the combined static and dynamic parts of a Template.
 */
export class TemplateResult {
  /**
   * Constructor
   * @param { Template } template
   * @param { Array<unknown> } values
   * @param { boolean } [root]
   * @param { boolean } [hydratable]
   */
  constructor(template, values, root = false, hydratable = false) {
    this.hydratable = hydratable;
    this.id = id++;
    this.index = 0;
    this.root = root;
    this.maxIndex = template.strings.length + template.parts.length - 1;
    this.template = template;
    this.valueIndex = 0;
    this.values = values;
  }

  /**
   * Consume template result content one chunk at a time.
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  readChunk(options) {
    const index = (this.index / 2) | 0;
    const isString = this.index % 2 === 0;
    const isFirstString = this.index === 0;
    const isLastString = this.index === this.maxIndex;
    const withMetadata = options?.includeHydrationMetadata;

    // Finished
    if (!isString && this.index >= this.maxIndex) {
      // Reset
      this.index = 0;
      this.valueIndex = 0;
      return null;
    }

    this.index++;

    if (isString) {
      let string = this.template.strings[index];

      if (withMetadata) {
        if (isFirstString) {
          string = Buffer.concat([
            Buffer.from(`<!--lit${this.root ? '' : '-child'} ${this.template.digest}-->`),
            string,
          ]);
        }
        if (isLastString) {
          string = Buffer.concat([string, this.root ? META_CLOSE : META_CHILD_CLOSE]);
        }
      }

      return string;
    }

    const part = this.template.parts[index];
    const isCustomElement = isCustomElementPart(part);

    if (isAttributePart(part) || isCustomElement) {
      const length = part.length;
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already handled by the instance)
      const values = this.values.slice(this.valueIndex, this.valueIndex + length);
      const value = part.resolveValue(values, options);
      this.valueIndex += length;
      return value;
    } else if (isChildPart(part)) {
      const value = part.resolveValue(this.values[this.valueIndex], options);
      this.valueIndex++;
      return value;
    } else if (isMetadataPart(part)) {
      return part.resolveValue(options);
    } else {
      this.valueIndex++;
      throw Error(`unknown part: ${part}`);
    }
  }
}
