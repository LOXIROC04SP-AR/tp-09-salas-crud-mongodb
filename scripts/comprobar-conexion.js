const {
  conectar,
  desconectar,
  describirError,
} = require("../src/config/base-datos");

async function main() {
  try {
    const conn = await conectar();
    console.log("Conexión exitosa a MongoDB.");
    console.log("Tipo de conexión:", conn.name);
    await desconectar();
    console.log("Conexión cerrada.");
  } catch (error) {
    console.error("Error de conexión:");
    console.error(describirError(error));
    process.exit(1);
  }
}

main();
