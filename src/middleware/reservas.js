const {
  salasPermitidas,
  turnosPermitidos,
  estadosPermitidos,
} = require("../modelos/catalogos");

// Campos de texto del recurso y lista completa de campos editables.
const CAMPOS_TEXTO = ["estudiante", "email", "sala", "fecha", "turno"];
const CAMPOS_EDITABLES = [...CAMPOS_TEXTO, "personas", "estado"];
// PATCH solo admite estos dos campos.
const CAMPOS_PARCIALES = ["personas", "estado"];

const SALAS = salasPermitidas;
const TURNOS = turnosPermitidos;
const ESTADOS = estadosPermitidos;

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function esObjetoPlano(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

// Detecta claves de operador ($set, $gt) o rutas de punto enviadas por el cliente.
function esOperador(clave) {
  return clave.startsWith("$") || clave.includes(".");
}

// Valida una clave presente en el cuerpo: conocida, no _id, no operador.
// ignorar: claves que se descartan en silencio (estado/_id en POST).
function validarClave(clave, errores, { camposAdmitidos, ignorar = [] } = {}) {
  if (esOperador(clave)) {
    errores.push(`No se permiten operadores en el campo ${clave}.`);
    return "rechazar";
  }
  if (ignorar.includes(clave)) return "ignorar";
  if (clave === "_id") {
    errores.push("No se permite modificar el identificador (_id).");
    return "rechazar";
  }
  if (!camposAdmitidos.includes(clave)) {
    errores.push(`Campo desconocido: ${clave}.`);
    return "rechazar";
  }
  return "validar";
}

// Valida el valor de un campo y lo copia (con conversiones estrictas) al resultado.
function validarValor(campo, valor, errores, { formulario = false } = {}) {
  if (CAMPOS_TEXTO.includes(campo)) {
    if (typeof valor !== "string") {
      errores.push(`El campo ${campo} debe ser texto.`);
      return;
    }
    const texto = valor.trim();
    if (texto === "") {
      errores.push(`El campo ${campo} es obligatorio.`);
      return;
    }
    if (campo === "email" && !texto.includes("@")) {
      errores.push("El email debe contener @.");
      return;
    }
    if (campo === "sala" && !SALAS.includes(texto)) {
      errores.push(`Sala no permitida: ${texto}.`);
      return;
    }
    if (campo === "turno" && !TURNOS.includes(texto)) {
      errores.push(`Turno no permitido: ${texto}.`);
      return;
    }
    return texto;
  }

  if (campo === "personas") {
    // Se admite numero o texto numerico no vacio (formularios HTML); nunca
    // true, arreglos ni objetos. Luego se comprueban finitud, entero y rango.
    let numero = valor;
    if (formulario) {
      if (typeof valor !== "string") {
        errores.push("La cantidad de personas debe ser un número.");
        return;
      }
      if (valor.trim() === "") {
        errores.push("La cantidad de personas es obligatoria.");
        return;
      }
      numero = Number(valor);
      if (Number.isNaN(numero)) {
        errores.push("La cantidad de personas debe ser un número.");
        return;
      }
    } else if (typeof valor === "string") {
      if (valor.trim() === "") {
        errores.push("La cantidad de personas no puede quedar vacía.");
        return;
      }
      numero = Number(valor);
      if (Number.isNaN(numero)) {
        errores.push("La cantidad de personas debe ser un número.");
        return;
      }
    } else if (typeof valor !== "number") {
      errores.push("El campo personas debe ser un número.");
      return;
    }
    if (!Number.isFinite(numero) || !Number.isInteger(numero)) {
      errores.push("La cantidad de personas debe ser un número entero.");
      return;
    }
    if (numero < 1 || numero > 6) {
      errores.push("La cantidad de personas debe estar entre 1 y 6.");
      return;
    }
    return numero;
  }

  if (campo === "estado") {
    if (typeof valor !== "string") {
      errores.push("El campo estado debe ser texto.");
      return;
    }
    const texto = valor.trim();
    if (texto === "") {
      errores.push("El campo estado es obligatorio.");
      return;
    }
    if (!ESTADOS.includes(texto)) {
      errores.push(`Estado no permitido: ${texto}.`);
      return;
    }
    return texto;
  }
}

// Recorre el cuerpo y devuelve { datos, errores } segun la lista de campos pedida.
// rechazo: que hacer con claves no incluidas en la lista ("rechazar" o "ignorar").
function extraerDeCuerpo(
  cuerpo,
  camposAdmitidos,
  { formulario = false, ignorar = [] } = {},
) {
  const datos = {};
  const errores = [];

  if (!esObjetoPlano(cuerpo)) {
    return {
      datos,
      errores: ["Se esperaba un cuerpo con los datos de la reserva."],
    };
  }

  for (const clave of Object.keys(cuerpo)) {
    const trato = camposAdmitidos.includes(clave)
      ? "validar"
      : validarClave(clave, errores, { camposAdmitidos, ignorar });
    if (trato === "rechazar") continue;
    if (trato === "ignorar") continue;
    const valor = validarValor(clave, cuerpo[clave], errores, { formulario });
    if (valor !== undefined) datos[clave] = valor;
  }

  return { datos, errores };
}

// POST: copia los seis campos originales e ignora estado/_id del cliente.
// Los admitidos no incluyen estado/_id: caen en la lista de ignorados.
function extraerCampos(cuerpo, { formulario = false } = {}) {
  const seisCampos = CAMPOS_EDITABLES.filter((c) => c !== "estado");
  return extraerDeCuerpo(cuerpo, seisCampos, {
    formulario,
    ignorar: ["estado", "_id"],
  });
}

// PUT: exige los siete campos editables, sin completar omisiones con defaults.
function extraerReemplazo(cuerpo, { formulario = false } = {}) {
  const { datos, errores } = extraerDeCuerpo(cuerpo, CAMPOS_EDITABLES, {
    formulario,
  });
  for (const campo of CAMPOS_EDITABLES) {
    if (datos[campo] === undefined) {
      errores.push(
        `El campo ${campo} es obligatorio para el reemplazo completo.`,
      );
    }
  }
  return { datos, errores };
}

// PATCH: solo personas y estado, con al menos uno presente.
function extraerCambioParcial(cuerpo) {
  const { datos, errores } = extraerDeCuerpo(cuerpo, CAMPOS_PARCIALES);
  if (errores.length === 0 && Object.keys(datos).length === 0) {
    errores.push(
      "Debe indicar al menos un campo a modificar (personas o estado).",
    );
  }
  return { datos, errores };
}

// Valores para volver a mostrar en el formulario (siempre texto).
function valoresFormulario(cuerpo) {
  const origen = esObjetoPlano(cuerpo) ? cuerpo : {};
  const texto = (v) => (typeof v === "string" ? v : "");
  return {
    estudiante: texto(origen.estudiante),
    email: texto(origen.email),
    sala: texto(origen.sala),
    fecha: texto(origen.fecha),
    turno: texto(origen.turno),
    personas: texto(origen.personas),
  };
}

function mostrarFormularioInvalido(res, cuerpo, errores) {
  return res.status(400).render("reservas/nueva", {
    titulo: "Nueva reserva",
    errores,
    datos: valoresFormulario(cuerpo),
    salas: SALAS,
    turnos: TURNOS,
  });
}

// Sitio HTML: tipos y forma. Si falla, 400 y el formulario conserva los valores.
function validarReservaFormulario(req, res, next) {
  const { datos, errores } = extraerCampos(req.body, { formulario: true });
  if (errores.length > 0) {
    return mostrarFormularioInvalido(res, req.body, errores);
  }
  req.reservaValidada = datos;
  next();
}

module.exports = {
  prepararAreaReservas,
  extraerCampos,
  extraerReemplazo,
  extraerCambioParcial,
  valoresFormulario,
  mostrarFormularioInvalido,
  validarReservaFormulario,
};
