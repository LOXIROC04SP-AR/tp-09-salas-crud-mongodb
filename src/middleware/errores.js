const { ErrorEntrada, NoEncontrado } = require("../errores");

function apiNoEncontrada(req, res) {
  res.status(404).json({ error: "Ruta de API no encontrada" });
}

function paginaNoEncontrada(req, res) {
  res.status(404).render("no-encontrado", {
    titulo: "Página no encontrada",
    mensaje: "La página que buscás no existe.",
  });
}

function manejarErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  const esApi = req.originalUrl.startsWith("/api");

  if (error instanceof ErrorEntrada) {
    if (esApi) {
      return res
        .status(400)
        .json({ error: error.message, detalles: error.detalles });
    }
    return res
      .status(400)
      .render("error", { titulo: "Error", mensaje: error.message });
  }
  if (error instanceof NoEncontrado) {
    if (esApi) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(404).render("no-encontrado", {
      titulo: "No encontrado",
      mensaje: error.message,
    });
  }
  if (
    error.type === "entity.parse.failed" ||
    error.type === "entity.too.large"
  ) {
    return res.status(400).json({ error: "Cuerpo JSON inválido" });
  }

  console.error(error);
  if (esApi) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
  res.status(500).render("error", {
    titulo: "Error",
    mensaje: "Ocurrió un error interno.",
  });
}

module.exports = { apiNoEncontrada, paginaNoEncontrada, manejarErrores };
