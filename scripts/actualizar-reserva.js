const { crearServicioReservas } = require('../src/servicios/reservas');
const servicio = crearServicioReservas();

async function actualizar() {
  const id = process.argv[3];
  if (!id) {
    console.error("Uso: node scripts/actualizar-reserva.js <id-reserva>");
    process.exit(1);
  }

  const datos = {
    estudiante: process.argv[4] || undefined,
    email: process.argv[5] || undefined,
    sala: process.argv[6] || undefined,
    fecha: process.argv[7] || undefined,
    turno: process.argv[8] || undefined,
    personas: process.argv[9] ? Number(process.argv[9]) : undefined,
    estado: process.argv[10] || undefined,
  };

  try {
    const reserva = await servicio.actualizar(id, datos);
    console.log("Reserva actualizada:");
    console.log(`ID: ${reserva.id}`);
    console.log(`Estudiante: ${reserva.estudiante}`);
    console.log(`Sala: ${reserva.sala}`);
    console.log(`Fecha: ${reserva.fecha}`);
    console.log(`Turno: ${reserva.turno}`);
    console.log(`Personas: ${reserva.personas}`);
    console.log(`Estado: ${reserva.estado}`);
  } catch (error) {
    console.error("Error al actualizar reserva:", error.message);
    if (error.name === "ErrorEntrada") {
      console.error("Detalles:", error.detalles);
    }
    if (error.name === "NoEncontrado") {
      console.error("La reserva con ID", id, "no existe.");
    }
    process.exit(1);
  }
}

actualizar().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });