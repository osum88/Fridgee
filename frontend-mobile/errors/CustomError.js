export class EmailError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "EmailError";
    this.type = "email";
  }
}

export class UsernameError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "UsernameError";
    this.type = "username";
  }
}

export class PasswordError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "PasswordError";
    this.type = "password";
  }
}
