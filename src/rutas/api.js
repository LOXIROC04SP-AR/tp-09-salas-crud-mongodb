const express = require("express");
const {
  validarCuerpoApi,
  validarReemplazoApi,
  validarCambioParcialApi,
} = require("../middleware/api");
const { apiNoEncontrada } = require("../middleware/errores");

function crearRouterApi(controlador) {
  const router = express.Router();

  router.use(express.json({ limit: "10kb" }));

  router.get("/reservas", controlador.listar);
  router.get("/reservas/:id", controlador.obtener);
  router.post("/reservas", validarCuerpoApi, controlador.crear);
  router.put("/reservas/:id", validarReemplazoApi, controlador.actualizar);
  router.patch(
    "/reservas/:id",
    validarCambioParcialApi,
    controlador.actualizarParcial,
  );
  // DELETE sin middleware de cuerpo: no necesita datos para borrar por ID.
  router.delete("/reservas/:id", controlador.eliminar);

  // Ruta API desconocida: JSON, no HTML.
  router.use(apiNoEncontrada);

  return router;
}

module.exports = { crearRouterApi };
