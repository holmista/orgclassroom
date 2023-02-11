class ValidationError extends Error {
  field: string;
  message: string;
  error: any;
  constructor(field: string, message: string) {
    super();
    this.field = field;
    this.message = message;
    this.error = {};
    this.error[field] = { _errors: [message] };
  }
}
const a = new ValidationError("test", "not valid");
console.log(a);
export default ValidationError;
