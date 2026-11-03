// Valores permitidos: los usan el modelo, las vistas y las validaciones.
// Viven aqui (y no en datos/semilla.js) para que el arranque persistente
// no dependa de la semilla en memoria.
const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];
const estadosPermitidos = ["pendiente", "confirmada"];

module.exports = { salasPermitidas, turnosPermitidos, estadosPermitidos };