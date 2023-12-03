function isOptional(value: unknown): value is Optional<unknown> {
  return (
    typeof value === "object" &&
    (value as Optional<unknown>).get() !== undefined
  );
}

export class Optional<T> {
  public static of<U>(value: U): Optional<U> {
    return new Optional(value);
  }

  public static empty<U>(): Optional<U> {
    return new Optional(null);
  }

  private readonly _value: T;

  private constructor(_value: T) {
    if (!_value && _value !== "" && _value !== 0) {
      this._value = null;
    }

    this._value = _value;
  }

  public isPresent(): boolean {
    return this._value !== null;
  }

  public mapIfPresent<U>(callback: (value: T) => Optional<U>): Optional<U>;
  public mapIfPresent<U>(callback: (value: T) => U): Optional<U>;
  public mapIfPresent<U>(
    callback: ((value: T) => U) | ((value: T) => Optional<U>),
  ): Optional<U> {
    if (!this.isPresent()) {
      return Optional.empty();
    }

    const value: Optional<U> | U = callback(this._value);
    return isOptional(value) ? value : Optional.of(value);
  }

  public orElse(newValue: Optional<T>): Optional<T>;
  public orElse(newValue: T): Optional<T>;
  public orElse(newValue: T | Optional<T>): Optional<T> {
    if (this.isPresent()) {
      return this;
    }

    return isOptional(newValue) ? newValue : Optional.of(newValue);
  }

  public get(): T {
    return this._value;
  }
}
