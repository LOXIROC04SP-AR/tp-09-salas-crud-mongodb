const { salasPermitidas, turnosPermitidos } = require("../modelos/catalogos");
const { ErrorEntrada, NoEncontrado } = require("../errores");
const {
  valoresFormulario,
  mostrarFormularioInvalido,
} = require("../middleware/reservas");

function crearControladorReservas(servicio) {
  return {
    async estado(req, res) {
      res.json({
        servicio: "activo",
        reservas: await servicio.contar(),
        solicitudId: res.locals.seccion,
      });
    },

    async listar(req, res) {
      res.render("reservas/lista", {
        titulo: "Reservas",
        reservas: await servicio.listar(),
      });
    },

    formulario(req, res) {
      res.render("reservas/nueva", {
        titulo: "Nueva reserva",
        errores: [],
        datos: valoresFormulario({}),
        salas: salasPermitidas,
        turnos: turnosPermitidos,
      });
    },

    async detalle(req, res) {
      try {
        const reserva = await servicio.buscarPorId(req.params.id);
        res.render("reservas/detalle", {
          titulo: `Reserva ${reserva.id}`,
          reserva,
        });
      } catch (error) {
        // En el sitio, un identificador mal formado o ausente es una pagina 404.
        if (error instanceof ErrorEntrada || error instanceof NoEncontrado) {
          return res.status(404).render("no-encontrado", {
            titulo: "Reserva no encontrada",
            mensaje: "No existe una reserva con ese identificador.",
          });
        }
        throw error;
      }
    },

    async crear(req, res) {
      try {
        const reserva = await servicio.crear(req.reservaValidada);
        // Se redirige solo despues de esperar la escritura.
        res.redirect(302, `/reservas/${reserva.id}`);
      } catch (error) {
        if (error instanceof ErrorEntrada) {
          return mostrarFormularioInvalido(res, req.body, error.detalles);
        }
        throw error;
      }
    },

    async actualizar(req, res) {
      try {
        const reserva = await servicio.actualizar(req.params.id, req.reservaValidada);
        res.render("reservas/detalle", {
          titulo: `Reserva ${reserva.id}`,
          reserva,
        });
      } catch (error) {
        if (error instanceof ErrorEntrada) {
          // En caso de error de validación, volvemos al formulario con los datos
          return res.status(400).render("reservas/nueva", {
            titulo: "Editar reserva",
            errores: error.detalles,
            datos: valoresFormulario(req.body),
            salas: salasPermitidas,
            turnos: turnosPermitidos,
          });
        }
        if (error instanceof NoEncontrado) {
          return res.status(404).render("no-encontrado", {
            titulo: "Reserva no encontrada",
            mensaje: "No existe una reserva con ese identificador.",
          });
        }
        throw error;
      }
    },

    async eliminar(req, res) {
      try {
        await servicio.eliminar(req.params.id);
        // Después de eliminar, listamos las reservas restantes
        res.render("reservas/lista", {
          titulo: "Reservas",
          reservas: await servicio.listar(),
          mensaje: "Reserva eliminada correctamente.",
        });
      } catch (error) {
        if (error instanceof ErrorEntrada) {
          return res.status(400).render("error", {
            titulo: "Error",
            mensaje: error.message,
          });
        }
        if (error instanceof NoEncontrado) {
          return res.status(404).render("no-encontrado", {
            titulo: "Reserva no encontrada",
            mensaje: "No existe una reserva con ese identificador.",
          });
        }
        throw error;
      }
    },
  };
}

module.exports = { crearControladorReservas };