const mongoose = require("mongoose");
const {
  salasPermitidas,
  turnosPermitidos,
  estadosPermitidos,
} = require("./catalogos");

const esquemaReserva = new mongoose.Schema({
  estudiante: {
    type: String,
    required: [true, "El estudiante es obligatorio"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    trim: true,
    match: [/@/, "El email debe contener @"],
  },
  sala: {
    type: String,
    required: [true, "La sala es obligatoria"],
    enum: {
      values: salasPermitidas,
      message: "Sala no permitida: {VALUE}",
    },
  },
  fecha: {
    type: String,
    required: [true, "La fecha es obligatoria"],
    trim: true,
  },
  turno: {
    type: String,
    required: [true, "El turno es obligatorio"],
    enum: {
      values: turnosPermitidos,
      message: "Turno no permitido: {VALUE}",
    },
  },
  personas: {
    type: Number,
    required: [true, "La cantidad de personas es obligatoria"],
    min: [1, "Debe haber al menos 1 persona"],
    max: [6, "No puede haber más de 6 personas"],
    validate: {
      validator: Number.isInteger,
      message: "La cantidad de personas debe ser un número entero",
    },
  },
  estado: {
    type: String,
    enum: {
      values: estadosPermitidos,
      message: "Estado no permitido: {VALUE}",
    },
    default: "pendiente",
  },
});

// Colección indicada de forma explícita: "reservas".
const Reserva = mongoose.model("Reserva", esquemaReserva, "reservas");

module.exports = Reserva;