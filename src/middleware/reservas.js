const { salasPermitidas, turnosPermitidos } = require("../modelos/catalogos");

const CAMPOS_TEXTO = ["estudiante", "email", "sala", "fecha", "turno"];

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function esObjetoPlano(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

// Copia EXPLICITAMENTE solo los campos admitidos y controla los tipos, para que
// Mongoose no los convierta en silencio (true -> 1, [2] -> 2, 5 -> "5").
// Las reglas de negocio (vacio, enum, rango, entero, @) las valida el modelo.
function extraerCampos(cuerpo, { formulario = false } = {}) {
  const datos = {};
  const errores = [];

  if (!esObjetoPlano(cuerpo)) {
    return {
      datos,
      errores: ["Se esperaba un cuerpo con los datos de la reserva."],
    };
  }

  for (const campo of CAMPOS_TEXTO) {
    const valor = cuerpo[campo];
    if (valor === undefined) continue;
    if (typeof valor !== "string") {
      errores.push(`El campo ${campo} debe ser texto.`);
    } else {
      datos[campo] = valor;
    }
  }

  const personas = cuerpo.personas;
  if (personas !== undefined) {
    if (formulario) {
      // Un formulario HTML siempre envia texto: se convierte de forma estricta.
      if (typeof personas !== "string") {
        errores.push("La cantidad de personas debe ser un número.");
      } else if (personas.trim() !== "") {
        const numero = Number(personas);
        if (Number.isNaN(numero)) {
          errores.push("La cantidad de personas debe ser un número.");
        } else {
          datos.personas = numero;
        }
      }
    } else if (typeof personas !== "number") {
      errores.push("El campo personas debe ser un número.");
    } else {
      datos.personas = personas;
    }
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
    salas: salasPermitidas,
    turnos: turnosPermitidos,
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

// Validar datos para actualización parcial
function validarActualizacion(datos) {
  const errores = [];
  
  if (datos.estudiante !== undefined) {
    if (typeof datos.estudiante !== "string") {
      errores.push("El campo estudiante debe ser texto.");
    }
  }
  
  if (datos.email !== undefined) {
    if (typeof datos.email !== "string") {
      errores.push("El campo email debe ser texto.");
    } else if (datos.email && !/@/.test(datos.email)) {
      errores.push("El email debe contener @");
    }
  }
  
  if (datos.sala !== undefined) {
    if (typeof datos.sala !== "string") {
      errores.push("El campo sala debe ser texto.");
    } else if (!salasPermitidas.includes(datos.sala)) {
      errores.push("Sala no permitida: " + datos.sala);
    }
  }
  
  if (datos.fecha !== undefined) {
    if (typeof datos.fecha !== "string") {
      errores.push("El campo fecha debe ser texto.");
    }
  }
  
  if (datos.turno !== undefined) {
    if (typeof datos.turno !== "string") {
      errores.push("El campo turno debe ser texto.");
    } else if (!turnosPermitidos.includes(datos.turno)) {
      errores.push("Turno no permitido: " + datos.turno);
    }
  }
  
  if (datos.personas !== undefined) {
    if (typeof datos.personas !== "number") {
      errores.push("El campo personas debe ser un número.");
    } else if (!Number.isInteger(datos.personas)) {
      errores.push("La cantidad de personas debe ser un número entero.");
    } else if (datos.personas < 1 || datos.personas > 6) {
      errores.push("La cantidad de personas debe estar entre 1 y 6.");
    }
  }
  
  if (datos.estado !== undefined) {
    if (typeof datos.estado !== "string") {
      errores.push("El campo estado debe ser texto.");
    } else if (!estadosPermitidos.includes(datos.estado)) {
      errores.push("Estado no permitido: " + datos.estado);
    }
  }
  
  return { errores };
}

function validarEstado(req, res, next) {
  const { datos, errores } = validarActualizacion(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ error: "Datos de actualización inválidos", detalles: errores });
  }
  next();
}

module.exports = {
  prepararAreaReservas,
  extraerCampos,
  valoresFormulario,
  mostrarFormularioInvalido,
  validarReservaFormulario,
  validarEstado,
};