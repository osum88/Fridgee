export class EmailError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "EmailError";
    this.type = "email";
  }
}



export class PasswordError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "PasswordError";
    this.type = "password";
  }
}












