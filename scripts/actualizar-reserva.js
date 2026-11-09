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
      "Uso: node --env-file=.env scripts/actualizar-reserva.js <id-reserva> <estudiante> <email> <sala> <fecha> <turno> <personas> <estado>",
    );
    process.exit(1);
  }

  // PUT por CLI: reemplazo completo de los siete campos editables.
  const datos = {
    estudiante: process.argv[3],
    email: process.argv[4],
    sala: process.argv[5],
    fecha: process.argv[6],
    turno: process.argv[7],
    personas: Number(process.argv[8]),
    estado: process.argv[9],
  };

  await conectar();
  try {
    const servicio = crearServicioReservas();
    const reserva = await servicio.reemplazar(id, datos);
    console.log("Reserva actualizada (PUT completo):");
    console.log(`ID: ${reserva.id}`);
    console.log(`Estudiante: ${reserva.estudiante}`);
    console.log(`Email: ${reserva.email}`);
    console.log(`Sala: ${reserva.sala}`);
    console.log(`Fecha: ${reserva.fecha}`);
    console.log(`Turno: ${reserva.turno}`);
    console.log(`Personas: ${reserva.personas}`);
    console.log(`Estado: ${reserva.estado}`);
  } catch (error) {
    console.error("Error al actualizar reserva:", error.message);
    if (error.detalles) console.error("Detalles:", error.detalles);
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
