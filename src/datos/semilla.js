const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

const reservasIniciales = [
  {
    estudiante: "Lucía Fernández",
    email: "lucia.fernandez@mail.com",
    sala: "Sala Norte",
    fecha: "2026-10-05",
    turno: "Mañana",
    personas: 3,
  },
  {
    estudiante: "Martín Gómez",
    email: "martin.gomez@mail.com",
    sala: "Sala Sur",
    fecha: "2026-10-05",
    turno: "Tarde",
    personas: 5,
  },
  {
    estudiante: "Camila Rojas",
    email: "camila.rojas@mail.com",
    sala: "Sala Multimedia",
    fecha: "2026-10-06",
    turno: "Noche",
    personas: 2,
  },
  {
    estudiante: "Diego Herrera",
    email: "diego.herrera@mail.com",
    sala: "Sala Norte",
    fecha: "2026-10-07",
    turno: "Tarde",
    personas: 4,
  },
];

module.exports = { salasPermitidas, turnosPermitidos, reservasIniciales };