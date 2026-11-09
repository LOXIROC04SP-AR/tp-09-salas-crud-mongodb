const PUERTO_PREDETERMINADO = 3000;

function leerPuerto(valor) {
  if (valor === undefined || String(valor).trim() === "") {
    return PUERTO_PREDETERMINADO;
  }

  const texto = String(valor).trim();
  const puerto = Number(texto);

  if (!/^\d+$/.test(texto) || puerto < 1 || puerto > 65535) {
    throw new Error(
      `PORT inválido: "${texto}". Debe ser un número entero entre 1 y 65535.`,
    );
  }

  return puerto;
}

// Configuración HTTP (antes en src/configuracion.js). No exige MONGODB_URI.
function leerConfiguracion(env = process.env) {
  const entorno = env.NODE_ENV || "development";

  return {
    puerto: leerPuerto(env.PORT),
    entorno,
    formatoRegistro: entorno === "production" ? "combined" : "dev",
    registrar: true,
  };
}

// Solo la usan los programas de terminal; el sitio en memoria no la necesita.
function leerUriMongo(env = process.env) {
  const uri = String(env.MONGODB_URI || "").trim();

  if (uri === "") {
    throw new Error(
      "Falta la variable MONGODB_URI. Copiar .env.example a .env y completarla.",
    );
  }

  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
    throw new Error(
      "MONGODB_URI tiene un prefijo incorrecto: debe empezar con mongodb+srv:// o mongodb://",
    );
  }

  return uri;
}

module.exports = { leerConfiguracion, leerUriMongo };
