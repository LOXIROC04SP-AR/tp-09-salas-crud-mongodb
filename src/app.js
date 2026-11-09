const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const { paginaNoEncontrada, manejarErrores } = require("./middleware/errores");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearControladorApi } = require("./controladores/reservas-api");
const { crearRouterReservas } = require("./rutas/reservas");
const { crearRouterApi } = require("./rutas/api");

function crearApp({ servicio, configuracion }) {
  const app = express();
  const controlador = crearControladorReservas(servicio);
  const controladorApi = crearControladorApi(servicio);
  const raiz = path.join(__dirname, "..");

  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", path.join(raiz, "views"));
  app.set("layout", "layouts/main");

  // Morgan va antes de static: también registra los archivos estáticos (CSS).
  if (configuracion.registrar) {
    app.use(morgan(configuracion.formatoRegistro));
  }
  app.use(identificarSolicitud);
  if (configuracion.registrar) {
    app.use(medirDuracion);
  }
  app.use(expressLayouts);
  app.use(express.static(path.join(raiz, "public")));

  const routerApi = crearRouterApi(controladorApi);
  app.use("/api", routerApi);

  const routerReservas = crearRouterReservas(controlador);
  app.use("/reservas", routerReservas);

  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Inicio" });
  });

  app.get("/estado", controlador.estado);

  app.use(paginaNoEncontrada);
  app.use(manejarErrores);

  return app;
}

module.exports = { crearApp };
