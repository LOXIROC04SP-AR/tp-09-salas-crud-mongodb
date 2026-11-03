const { crearServicioReservas } = require('../src/servicios/reservas');
const servicio = crearServicioReservas();

async function eliminar() {
  const id = process.argv[3];
  if (!id) {
    console.error("Uso: node scripts/eliminar-reserva.js <id-reserva>");
    process.exit(1);
  }

  try {
    const reserva = await servicio.eliminar(id);
    console.log("Reserva eliminada:");
    console.log(`ID: ${reserva.id}`);
    console.log(`Estudiante: ${reserva.estudiante}`);
    console.log(`Sala: ${reserva.sala}`);
  } catch (error) {
    console.error("Error al eliminar reserva:", error.message);
    if (error.name === "ErrorEntrada") {
      console.error("ID mal formado.");
    }
    if (error.name === "NoEncontrado") {
      console.error("La reserva con ID", id, "no existe.");
    }
    process.exit(1);
  }
}

eliminar().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });