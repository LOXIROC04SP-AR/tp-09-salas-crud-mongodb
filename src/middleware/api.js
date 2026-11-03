const { ErrorEntrada } = require("../errores");
const { extraerCampos } = require("./reservas");

// API JSON: deja los datos saneados en req.reservaValidada.
// Un cuerpo ausente o de otro tipo deja req.body sin definir y se rechaza aqui.
function validarCuerpoApi(req, res, next) {
  const { datos, errores } = extraerCampos(req.body);
  if (errores.length > 0) {
    return next(new ErrorEntrada("Datos de reserva inválidos", errores));
  }
  req.reservaValidada = datos;
  next();
}

// Validar actualización parcia para API
function validarActualizacionApi(req, res, next) {
  const { datos, errores } = extraerCampos(req.body);
  if (errores.length > 0) {
    return next(new ErrorEntrada("Datos de actualización inválidos", errores));
  }
  req.reservaValidada = datos;
  next();
}

module.exports = { validarCuerpoApi, validarActualizacionApi };