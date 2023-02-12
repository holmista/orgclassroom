export interface IValidationError {
  [field: string]: {
    _errors: string[];
  };
}

class ValidationError extends Error {
  field: string;
  message: string;
  error: IValidationError;
  constructor(field: string, message: string) {
    super();
    this.field = field;
    this.message = message;
    this.error = {} as IValidationError;
    this.error[field] = { _errors: [message] };
  }
}

export default ValidationError;
