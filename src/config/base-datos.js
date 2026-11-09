const dns = require("node:dns");
const mongoose = require("mongoose");
const { leerUriMongo } = require("./entorno");

// Resolutores DNS para los registros SRV/TXT de Atlas.
// Afecta solo la resolución DNS de Node: no el sistema operativo,
// ni la autenticación, ni la lista de IPs permitidas.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectar() {
  const uri = leerUriMongo();
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
}

async function desconectar() {
  await mongoose.disconnect();
}

// Quita URI y credenciales de un texto antes de mostrarlo.
function limpiar(texto) {
  return String(texto || "")
    .replace(/mongodb(\+srv)?:\/\/\S+/gi, "[URI oculta]")
    .replace(/\/\/[^\s/@]+@/g, "//[oculto]@");
}

// Diagnóstico sin datos sensibles: nombre, código, operación y detalle limpio.
function describirError(error) {
  const causa = error.cause || error.reason || {};
  const lineas = [`Error: ${error.name || "Error"}`];

  const codigo = error.code || causa.code;
  const operacion = error.syscall || causa.syscall;
  if (codigo) lineas.push(`Código: ${codigo}`);
  if (operacion) lineas.push(`Operación de resolución: ${operacion}`);
  lineas.push(`Detalle: ${limpiar(error.message)}`);

  return lineas.join("\n");
}

module.exports = { conectar, desconectar, describirError };
