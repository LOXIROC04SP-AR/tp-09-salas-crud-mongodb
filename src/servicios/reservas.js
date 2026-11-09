const Reserva = require("../modelos/reserva");
const { ErrorEntrada, NoEncontrado } = require("../errores");

// El servicio solo habla con el modelo: no conoce req ni res.
// Todas las operaciones son asincronas (devuelven promesas).

const ID_VALIDO = /^[0-9a-fA-F]{24}$/;

// Lista blanca del servicio: jamas se copia req.body completo al modelo.
const CAMPOS_ADMITIDOS = [
  "estudiante",
  "email",
  "sala",
  "fecha",
  "turno",
  "personas",
  "estado",
];

// Representacion publica: id textual derivado del ObjectId + campos del recurso.
// Las vistas usan estos mismos nombres (reserva.id, reserva.sala, ...).
function aRepresentacion(doc) {
  return {
    id: String(doc._id),
    estudiante: doc.estudiante,
    email: doc.email,
    sala: doc.sala,
    fecha: doc.fecha,
    turno: doc.turno,
    personas: doc.personas,
    estado: doc.estado,
  };
}

function validarId(id) {
  if (typeof id !== "string" || !ID_VALIDO.test(id)) {
    throw new ErrorEntrada("ID mal formado");
  }
}

// Copia explicita por lista blanca: solo campos conocidos y presentes.
function construirCambios(datos) {
  const cambios = {};
  for (const campo of CAMPOS_ADMITIDOS) {
    if (datos[campo] !== undefined) cambios[campo] = datos[campo];
  }
  return cambios;
}

function traducirErrorDeValidacion(error, mensaje) {
  if (error.name === "ValidationError") {
    const detalles = Object.values(error.errors).map((e) => e.message);
    throw new ErrorEntrada(mensaje, detalles);
  }
  throw error;
}

function crearServicioReservas(modelo = Reserva) {
  return {
    // filtros.sala (opcional): solo un texto; el criterio se arma de forma explicita.
    async listar(filtros = {}) {
      const criterio = {};
      if (filtros.sala !== undefined) {
        if (typeof filtros.sala !== "string") {
          throw new ErrorEntrada("El filtro sala debe ser un único texto");
        }
        criterio.sala = filtros.sala;
      }
      const documentos = await modelo.find(criterio).lean();
      return documentos.map(aRepresentacion);
    },

    async buscarPorId(id) {
      validarId(id);
      const documento = await modelo.findById(id).lean();
      if (!documento) {
        throw new NoEncontrado("Reserva no encontrada");
      }
      return aRepresentacion(documento);
    },

    async contar() {
      return modelo.countDocuments({});
    },

    async crear(datos) {
      const reserva = new modelo(construirCambios(datos));
      try {
        await reserva.save();
      } catch (error) {
        traducirErrorDeValidacion(error, "Datos de reserva inválidos");
      }
      return aRepresentacion(reserva);
    },

    // Reemplazo completo (PUT): los datos ya llegan con los siete campos.
    // Se conserva el ID: se busca el documento, se reemplazan los campos
    // editables y se guarda con runValidators. Un ID ausente no crea (404).
    async reemplazar(id, datos) {
      validarId(id);
      const existente = await modelo.findById(id);
      if (!existente) {
        throw new NoEncontrado("Reserva no encontrada");
      }
      const cambios = construirCambios(datos);
      for (const campo of CAMPOS_ADMITIDOS) {
        if (cambios[campo] !== undefined) existente[campo] = cambios[campo];
      }
      try {
        await existente.save({ runValidators: true });
      } catch (error) {
        traducirErrorDeValidacion(error, "Datos de reserva inválidos");
      }
      return aRepresentacion(existente);
    },

    // Cambio parcial (PATCH): solo se tocan los campos presentes en datos.
    async actualizarParcial(id, datos) {
      validarId(id);
      const existente = await modelo.findById(id);
      if (!existente) {
        throw new NoEncontrado("Reserva no encontrada");
      }
      const cambios = construirCambios(datos);
      // Equivalente a findOneAndUpdate con $set y lista blanca propia, pero
      // sobre el documento recuperado para conservar el ID y validar con el
      // modelo antes de escribir.
      existente.set(cambios);
      try {
        await existente.save({ runValidators: true });
      } catch (error) {
        traducirErrorDeValidacion(error, "Datos de reserva inválidos");
      }
      return aRepresentacion(existente);
    },

    // Eliminacion fisica de un solo documento. No cambia estado ni borra mas.
    async eliminar(id) {
      validarId(id);
      const resultado = await modelo.findByIdAndDelete(id);
      if (!resultado) {
        throw new NoEncontrado("Reserva no encontrada");
      }
      return aRepresentacion(resultado);
    },
  };
}

module.exports = { crearServicioReservas, aRepresentacion };
