/**
 * Base class for custom errors.
 */
export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    // Set a more specific name. This will show up in e.g. console.log.
    this.name = this.constructor.name;
  }
}

/**
 * Base class for a custom error which wraps another error.
 */
export class WrappedError<T = Error> extends CustomError {
  public readonly originalError: T;

  constructor(
    message: string,
    originalError: T,
  ) {
    super(message);
    this.originalError = originalError;
  }
}

export class ConfigError extends CustomError {}
