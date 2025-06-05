import { ErrorType } from '../types/types.js';

export interface Details {
  cause?: unknown;
  attr?: object;
}

export interface Metadata {
  type?: ErrorType;
  code?: string;
}

export class BaseError extends Error {
  readonly type: ErrorType | undefined;
  readonly code: string | undefined;
  readonly attr: object | undefined;

  constructor(message: string, details?: Details, meta?: Metadata) {
    let options: ErrorOptions | undefined = undefined;
    if (details?.cause) {
      options = { cause: details.cause };
    }

    super(message, options);
    this.name = this.constructor.name;

    if (details) {
      if (details.attr) {
        this.attr = details.attr;
      }
    }

    if (meta) {
      if (meta.type) {
        this.type = meta.type;
      }
      if (meta.code) {
        this.code = meta.code;
      }
    }
  }
}
