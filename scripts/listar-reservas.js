const { crearServicioReservas } = require('../src/servicios/reservas');
const servicio = crearServicioReservas();

async function listar() {
  const filtros = {};
  if (process.argv[3]) {
    filtros.sala = process.argv[3];
  }
  const reservas = await servicio.listar(filtros);
  reservas.forEach(r => {
    console.log(`ID: ${r.id} | ${r.estudiante} | ${r.sala} | ${r.fecha} ${r.turno} | ${r.personas} pers | Estado: ${r.estado}`);
  });
  console.log(`Total: ${reservas.length} reservas`);
}

listar().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });