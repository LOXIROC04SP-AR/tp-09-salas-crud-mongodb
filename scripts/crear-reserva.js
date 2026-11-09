const {
  conectar,
  desconectar,
  describirError,
} = require("../src/config/base-datos");
const { crearServicioReservas } = require("../src/servicios/reservas");

async function main() {
  await conectar();
  try {
    const servicio = crearServicioReservas();
    // POST por CLI: no acepta estado ni _id del cliente; default pendiente.
    const reserva = {
      estudiante: process.argv[2] || "Estudiante de prueba",
      email: process.argv[3] || "prueba@mail.com",
      sala: process.argv[4] || "Sala Norte",
      fecha: process.argv[5] || "2026-10-20",
      turno: process.argv[6] || "Mañana",
      personas: Number(process.argv[7]) || 2,
    };
    const resultado = await servicio.crear(reserva);
    console.log("Reserva creada:");
    console.log(`ID: ${resultado.id}`);
    console.log(`Estudiante: ${resultado.estudiante}`);
    console.log(`Sala: ${resultado.sala}`);
    console.log(`Fecha: ${resultado.fecha}`);
    console.log(`Turno: ${resultado.turno}`);
    console.log(`Personas: ${resultado.personas}`);
    console.log(`Estado: ${resultado.estado}`);
  } catch (error) {
    console.error("Error al crear reserva:", error.message);
    if (error.detalles) console.error("Detalles:", error.detalles);
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
