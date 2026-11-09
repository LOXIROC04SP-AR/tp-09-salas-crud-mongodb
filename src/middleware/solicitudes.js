const { randomUUID } = require("node:crypto");

function identificarSolicitud(req, res, next) {
  res.locals.seccion = randomUUID();
  res.setHeader("X-Solicitud-Id", res.locals.seccion);
  next();
}

function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)} ms`,
    );
  });
  next();
}

module.exports = { identificarSolicitud, medirDuracion };
