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
    const filtros = {};
    if (process.argv[2]) {
      filtros.sala = process.argv[2];
    }
    const reservas = await servicio.listar(filtros);
    reservas.forEach((r) => {
      console.log(
        `ID: ${r.id} | ${r.estudiante} | ${r.sala} | ${r.fecha} ${r.turno} | ${r.personas} pers | Estado: ${r.estado}`,
      );
    });
    console.log(`Total: ${reservas.length} reservas`);
  } catch (error) {
    console.error(error.message);
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
