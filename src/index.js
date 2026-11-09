const { leerConfiguracion } = require("./config/entorno");
const {
  conectar,
  desconectar,
  describirError,
} = require("./config/base-datos");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearApp } = require("./app");

async function main() {
  // 1) Entorno  2) Conexión (el DNS se fija una sola vez al cargar base-datos.js)
  // 3) Recién entonces, escuchar el puerto.
  let configuracion;
  try {
    configuracion = leerConfiguracion();
  } catch (error) {
    console.error(`Error de configuración: ${error.message}`);
    process.exit(1);
  }

  try {
    await conectar();
    console.log("Conectado a MongoDB.");
  } catch (error) {
    // Sin conexión no se abre el puerto ni se anuncia disponibilidad.
    console.error("No se pudo iniciar: falló la conexión con MongoDB.");
    console.error(describirError(error));
    process.exit(1);
  }

  const app = crearApp({
    servicio: crearServicioReservas(),
    configuracion,
  });

  const servidor = await new Promise((resolver, rechazar) => {
    const instancia = app.listen(configuracion.puerto, () =>
      resolver(instancia),
    );
    instancia.once("error", rechazar);
  });
  console.log(
    `Servidor escuchando en http://localhost:${configuracion.puerto} (${configuracion.entorno})`,
  );

  // Cierre ordenado: se deja de aceptar solicitudes y luego se cierra la conexión.
  let cerrando = false;
  async function cerrar(senal) {
    if (cerrando) return;
    cerrando = true;
    console.log(`\n${senal} recibida: cerrando de forma ordenada...`);
    try {
      await new Promise((resolver) => servidor.close(resolver));
      await desconectar();
      console.log("Servidor y conexión cerrados.");
      process.exit(0);
    } catch (error) {
      console.error(describirError(error));
      process.exit(1);
    }
  }
  process.on("SIGINT", () => cerrar("SIGINT"));
  process.on("SIGTERM", () => cerrar("SIGTERM"));
}

main().catch((error) => {
  console.error("No se pudo iniciar el servidor.");
  console.error(describirError(error));
  process.exit(1);
});
