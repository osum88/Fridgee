export class EmailError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "EmailError";
    this.type = "email";
  }
}
