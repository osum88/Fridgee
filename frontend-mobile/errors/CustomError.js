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

export class NameError extends Error {
  constructor(message) {
    super(message);
    this.name = "NameError";
    this.type = "name";
  }
}

export class SurnameError extends Error {
  constructor(message) {
    super(message);
    this.name = "SurnameError";
    this.type = "surname";
  }
}

export class BirthDateError extends Error {
  constructor(message) {
    super(message);
    this.name = "BirthDateError";
    this.type = "birthDate";
  }
}

export class GenderError extends Error {
  constructor(message) {
    super(message);
    this.name = "GenderError";
    this.type = "gender";
  }
}

export class CountryError extends Error {
  constructor(message) {
    super(message);
    this.name = "CountryError";
    this.type = "country";
  }
}

export class BankNumberError extends Error {
  constructor(message) {
    super(message);
    this.name = "BankNumberError";
    this.type = "bankNumber";
  }
}

export class EveryError extends Error {
  constructor(message) {
    super(message);
    this.name = "EveryError";
    this.type = "every";
  }
}

