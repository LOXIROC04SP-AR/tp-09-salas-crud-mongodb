class ErrorEntrada extends Error {
  constructor(message, detalles) {
    super(message);
    this.name = "ErrorEntrada";
    this.detalles = detalles || [];
  }
}

class NoEncontrado extends Error {
  constructor(message) {
    super(message);
    this.name = "NoEncontrado";
  }
}

module.exports = { ErrorEntrada, NoEncontrado };