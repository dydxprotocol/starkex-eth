import { WrappedError } from '../errors';

// https://github.com/axios/axios/blob/cd7ff042b0b80f6f02e5564d184019131c90cacd/lib/core/enhanceError.js#L23
export type AxiosErrorObject = {};

/**
 * An error thrown by axios made r with large fields removed and the original error converted
 * into an object with its config removed.
 */
export class AxiosError extends WrappedError<AxiosErrorObject> {}

/**
  * Axios error with only status, statusText and data response error fields and a smaller original
  * error.
  */
export class AxiosServerError extends AxiosError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: {};

  constructor(
    response: { data: {}, status: number, statusText: string },
    originalError: AxiosErrorObject,
  ) {
    super(
      `${response.status}: ${response.statusText} - ${JSON.stringify(response.data, null, 2)}`,
      originalError,
    );
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = response.data;
  }
}
