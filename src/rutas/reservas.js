const express = require("express");
const {
  prepararAreaReservas,
  validarReservaFormulario,
  validarEstado,
} = require("../middleware/reservas");

function crearRouterReservas(controlador) {
  const router = express.Router();

  router.use(prepararAreaReservas);

  router.get("/", controlador.listar);
  router.get("/nueva", controlador.formulario);
  router.get("/:id", controlador.detalle);
  router.post(
    "/",
    express.urlencoded({ extended: false }),
    validarReservaFormulario,
    controlador.crear,
  );

  router.put(
    "/:id",
    prepararAreaReservas,
    validarReservaFormulario,
    validarEstado,
    controlador.actualizar,
  );

  router.delete(
    "/:id",
    prepararAreaReservas,
    controlador.eliminar,
  );

  return router;
}

module.exports = { crearRouterReservas };