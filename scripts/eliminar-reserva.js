const {
  conectar,
  desconectar,
  describirError,
} = require("../src/config/base-datos");
const { crearServicioReservas } = require("../src/servicios/reservas");

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error(
      "Uso: node --env-file=.env scripts/eliminar-reserva.js <id-reserva>",
    );
    process.exit(1);
  }

  await conectar();
  try {
    const servicio = crearServicioReservas();
    const reserva = await servicio.eliminar(id);
    console.log("Reserva eliminada físicamente:");
    console.log(`ID: ${reserva.id}`);
    console.log(`Estudiante: ${reserva.estudiante}`);
  } catch (error) {
    console.error("Error al eliminar reserva:", error.message);
    if (error.name === "NoEncontrado") {
      console.error("La reserva con ID", id, "no existe.");
    }
    process.exitCode = 1;
  } finally {
    await desconectar();
    console.log("Conexión cerrada.");
  }
}

main().catch((error) => {
  console.error(describirError(error));
  process.exit(1);
});
