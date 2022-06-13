import './dom-shim.js'; // Needs to be bundled as "external" in order to shim before lit-html imports
import { isTemplateResult } from './internal/is.js';
import { promiseTemplateRenderer } from './internal/promise-template-renderer.js';
import { streamTemplateRenderer } from './internal/node-stream-template-renderer.js';
import { Template } from './internal/template.js';
import { TemplateResult } from './internal/template-result.js';

export { noChange, nothing } from 'lit';

/**
 * Default templateResult factory
 * @param { unknown } value
 * @returns { TemplateResult }
 */
const DEFAULT_TEMPLATE_FN = (value) =>
  html`
    ${value}
  `;

const templateCache = new Map();

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream or String
 * @param { TemplateStringsArray } strings
 * @param  { ...unknown } values
 * @returns { TemplateResult }
 */
function html(strings, ...values) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new Template(strings);
    templateCache.set(strings, template);
  }

  return new TemplateResult(template, values);
}

/**
 * Render a template result to a Readable stream
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { import('stream').Readable | ReadableStream }
 */
function renderToStream(result, options) {
  return streamTemplateRenderer(getRenderResult(result), options);
}

/**
 * Render a template result to a string resolving Promise.
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<string> }
 */
function renderToString(result, options) {
  return promiseTemplateRenderer(getRenderResult(result), false, options);
}

/**
 * Render a template result to a Buffer resolving Promise.
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<Buffer> }
 */
function renderToBuffer(result, options) {
  return promiseTemplateRenderer(getRenderResult(result), true, options);
}

/**
 * Retrieve TemplateResult for render
 * @param { unknown} result
 * @returns { TemplateResult }
 */
function getRenderResult(result) {
  // @ts-ignore
  return !isTemplateResult(result) ? DEFAULT_TEMPLATE_FN(result) : result;
}

export { html, renderToBuffer, renderToStream, renderToString, html as svg };