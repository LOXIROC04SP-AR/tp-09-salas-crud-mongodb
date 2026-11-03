// Controlador de la API JSON. Contiene lógica de acceso a datos.
function crearControladorApi(servicio) {
  return {
    async listar(req, res) {
      res.status(200).json(await servicio.listar({ sala: req.query.sala }));
    },

    async obtener(req, res) {
      res.status(200).json(await servicio.buscarPorId(req.params.id));
    },

    async crear(req, res) {
      const reserva = await servicio.crear(req.reservaValidada);
      // 201 y Location se envian DESPUES de guardar.
      res.status(201).location(`/api/reservas/${reserva.id}`).json(reserva);
    },

    async actualizar(req, res) {
      const reserva = await servicio.actualizar(req.params.id, req.reservaValidada);
      res.status(200).json(reserva);
    },

    async eliminar(req, res) {
      await servicio.eliminar(req.params.id);
      res.status(204).json({ mensaje: "Reserva eliminada" });
    },
  };
}

module.exports = { crearControladorApi };