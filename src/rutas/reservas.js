const express = require("express");
const {
  prepararAreaReservas,
  validarReservaFormulario,
} = require("../middleware/reservas");

function crearRouterReservas(controlador) {
  const router = express.Router();

  router.use(prepararAreaReservas);

  // Lectura y creacion (conservadas de la unidad anterior).
  router.get("/", controlador.listar);
  router.get("/nueva", controlador.formulario);
  router.get("/:id", controlador.detalle);
  router.post(
    "/",
    express.urlencoded({ extended: false }),
    validarReservaFormulario,
    controlador.crear,
  );

  return router;
}

module.exports = { crearRouterReservas };
