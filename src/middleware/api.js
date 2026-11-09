const { ErrorEntrada } = require("../errores");
const {
  extraerCampos,
  extraerReemplazo,
  extraerCambioParcial,
} = require("./reservas");

// Cada middleware deja los datos saneados en req.reservaValidada.
// Un cuerpo ausente o de otro tipo deja req.body sin definir y se rechaza aqui.

// POST: seis campos originales; ignora estado/_id del cliente.
function validarCuerpoApi(req, res, next) {
  const { datos, errores } = extraerCampos(req.body);
  if (errores.length > 0) {
    return next(new ErrorEntrada("Datos de reserva inválidos", errores));
  }
  req.reservaValidada = datos;
  next();
}

// PUT: exige los siete campos editables; rechaza extras, _id y operadores.
function validarReemplazoApi(req, res, next) {
  const { datos, errores } = extraerReemplazo(req.body);
  if (errores.length > 0) {
    return next(new ErrorEntrada("Datos de actualización inválidos", errores));
  }
  req.reservaValidada = datos;
  next();
}

// PATCH: solo personas/estado, con al menos uno presente.
function validarCambioParcialApi(req, res, next) {
  const { datos, errores } = extraerCambioParcial(req.body);
  if (errores.length > 0) {
    return next(new ErrorEntrada("Datos de actualización inválidos", errores));
  }
  req.reservaValidada = datos;
  next();
}

module.exports = {
  validarCuerpoApi,
  validarReemplazoApi,
  validarCambioParcialApi,
};
