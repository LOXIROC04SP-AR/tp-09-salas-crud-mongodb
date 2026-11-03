const { crearServicioReservas } = require('../src/servicios/reservas');
const { leerConfiguracion } = require('../src/config/entorno');
const servicio = crearServicioReservas();

async function crear() {
  const config = leerConfiguracion();
  const reserva = {
    estudiante: process.argv[3] || "Estudiante de prueba",
    email: process.argv[4] || "prueba@mail.com",
    sala: process.argv[5] || "Sala Norte",
    fecha: process.argv[6] || "2026-10-20",
    turno: process.argv[7] || "Mañana",
    personas: Number(process.argv[8]) || 2,
  };
  try {
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
    if (error.name === "ErrorEntrada") {
      console.error("Detalles:", error.detalles);
    }
    process.exit(1);
  }
}

crear().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });