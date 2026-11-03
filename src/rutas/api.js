const express = require("express");
const { validarCuerpoApi, validarActualizacionApi } = require("../middleware/api");
const { apiNoEncontrada } = require("../middleware/errores");

function crearRouterApi(controlador) {
  const router = express.Router();

  router.use(express.json({ limit: "10kb" }));

  router.get("/reservas", controlador.listar);
  router.get("/reservas/:id", controlador.obtener);
  router.post("/reservas", validarCuerpoApi, controlador.crear);
  router.put("/reservas/:id", validarCuerpoApi, validarActualizacionApi, controlador.actualizar);
  router.delete("/reservas/:id", validarCuerpoApi, controlador.eliminar);

  // Ruta API desconocida: JSON, no HTML. No hay PUT, PATCH ni DELETE.
  router.use(apiNoEncontrada);

  return router;
}

module.exports = { crearRouterApi };