TRABAJO PRÁCTICO 09 - Actualización y eliminación de reservas de salas
======================================================================

PDF: semana-09-trabajo-practico-09
Curso: Desarrollo back-end con Node.js - Unidad 9
Base: reservas_salas_u9 - Colección: reservas

ORIGEN DE LA COPIA
------------------
Copia funcional del TP 08 (CRUD parcial de reservas con Express 5 + Mongoose +
MongoDB Atlas). Se conservaron fuentes, manifiesto, lockfile, plantilla de
entorno (.env.example) y configuración de calidad. El archivo .env (privato)
no se entrega.

VERSIONES UTILIZADAS
--------------------
- Node.js >= 20.6.0 (uso de --env-file)
- Express 5.2.x
- Mongoose 9.11.x
- EJS 6 / express-ejs-layouts 2.5
- Morgan 1.12 (registro HTTP)
- Prettier 3 y ESLint 10 (flat config: eslint.config.js)

PREPARACIÓN DEL ENTORNO
-----------------------
1) npm install
2) Copiar .env.example a .env y completar MONGODB_URI con el cluster propio:

   PORT=3000
   MONGODB_URI=mongodb+srv://usuario:contrasena@cluster0.xxx.mongodb.net/reservas_salas_u9?retryWrites=true&w=majority

3) DNS: en src/config/base-datos.js se fijan resolutores públicos
   (dns.setServers ["8.8.8.8","1.1.1.1"]) para la resolución SRV/TXT de Atlas.
   Es el ajuste de DNS autorizado: afecta solo la resolución de Node.

INICIO
------
- npm start          (conecta a MongoDB y recién entonces escucha el puerto)
- npm run dev        (con --watch)
- npm run comprobar-conexion   (CLI: conecta, informa y CIERRA la conexión)
- npm run crear / listar / actualizar / eliminar   (CLI, conectan y desconectan)

El arranque es posterior a la conexión: si MongoDB no responde, el puerto no
se abre. El cierre por SIGINT/SIGTERM cierra primero el servidor y después la
conexión. No se insertan ni borran datos automáticamente al iniciar ni al
listar (sin semillas automáticas).

CAPAS (CommonJS)
----------------
- src/config/     entorno (.env) y conexión a MongoDB
- src/modelos/    esquema Mongoose "Reserva" (colección "reservas") y catálogos
- src/servicios/  lógica de datos (no conoce req/res); construye los cambios
                  con lista blanca propia, nunca copia req.body completo
- src/controladores/  HTTP para sitio HTML y para API JSON
- src/rutas/      enrutadores /reservas y /api
- src/middleware/ validación de cuerpos (reservas.js, api.js) y manejo de
                  errores JSON/HTML (errores.js, módulo común con ErrorEntrada
                  -> 400, NoEncontrado -> 404, resto -> 500 sin secretos)
- views/          plantillas EJS (layout, inicio, lista, detalle, nueva,
                  no-encontrado, error)
- scripts/        CLI de terminal (conectar/desconectar explícito)

CAMPOS Y REGLAS (conservadas del enunciado)
-------------------------------------------
- estudiante: texto obligatorio, trim
- email: texto obligatorio, trim y presencia de @
- sala: enum ["Sala Norte", "Sala Sur", "Sala Multimedia"]
- fecha: texto obligatorio, trim (NO se valida calendario ni futuro)
- turno: enum ["Mañana", "Tarde", "Noche"]
- personas: entero entre 1 y 6. Se acepta número o texto numérico no vacío;
  NUNCA true, arreglos, objetos ni vacío. Se comprueba finitud, entero y rango.
- estado: enum ["pendiente", "confirmada"]; default "pendiente" al crear

No se agregan validaciones de calendario, disponibilidad, solapamiento, cupo
compartido ni unicidad.

POST copia los seis campos originales e IGNORA estado y _id del cliente.
PUT exige los SIETE campos editables (incluido estado), sin completar
omisiones con defaults; si falta uno, 400.
PATCH admite SOLO personas y estado, con al menos uno presente.
En PUT/PATCH se rechazan con 400: campos desconocidos, _id, operadores
(claves que empiezan con $ o contienen puntos), cuerpos ausentes, arreglos
como cuerpo raíz, y tipos numéricos inadecuados. El rechazo NO modifica datos.

CONTRATOS HTTP
--------------
Método    Rutas                     Resultado
--------  -------------------------   -------------------------
POST      /api/reservas             201 + recurso + Location
GET       /api/reservas           200 con un ARREGLO puro
GET       /api/reservas/:id       200 y recurso | 404 JSON
PUT       /api/reservas/:id       200 reemplazo completo MISMO ID
PATCH     /api/reservas/:id       200 cambios parciales MISMO ID
DELETE    /api/reservas/:id       204 SIN CUERPO si borró

Errores HTTP
------------
- ID mal formado                                 -> 400 JSON
- ID válido ausente (GET/PUT/PATCH/DELETE)       -> 404 JSON sin upsert
- Entrada inválida, JSON roto, cuerpo ausente    -> 400 JSON sin modificar
- Fallo inesperado                               -> 500 JSON seguro (sin secretos)
- Ruta de API desconocida                        -> 404 JSON

Detalles de implementación:
- El middleware de errores de cuatro parámetros se registra después de las
  rutas y distingue API (JSON) de sitio (HTML).
- El servicio usa lista blanca propia: reemplazar() (PUT, siete campos) y
  actualizarParcial() (PATCH, solo campos presentes). Ambos buscan el
  documento, conservan el ID y guardan con runValidators:true, devolviendo el
  documento posterior. upsert:false: actualizar un ID ausente NO crea nada.
- Actualizar el estado confirma la reserva por decisión explícita; no
  comprueba condiciones extra.
- DELETE hace BORRADO FÍSICO de un solo documento (findByIdAndDelete): un
  segundo DELETE y un GET posterior devuelven 404. Esto es distinto de cambiar
  el estado: la baja real quita el documento de la colección; el cambio de
  estado mantiene el documento con "pendiente"/"confirmada". No hay borrado
  masivo ni ruta para vaciar datos.

SOLICITUDES POSTMAN
-------------------
En GET y DELETE dejar Body en "none". En POST, PUT y PATCH usar Body, raw,
JSON y verificar Content-Type: application/json.

1) POST http://localhost:3000/api/reservas con:
   {
     "estudiante": "Ana Ejemplo",
     "email": "ana@example.com",
     "sala": "Sala Norte",
     "fecha": "2026-10-28",
     "turno": "Mañana",
     "personas": 2
   }
   -> 201, ID en el cuerpo y Location: /api/reservas/ID.

2) PUT http://localhost:3000/api/reservas/ID_RECIBIDO con los seis campos
   anteriores más "estado": "confirmada" -> 200, mismo ID, siete valores.

3) PATCH a la misma URL con { "personas": 3 } -> 200, personas 3 y el resto
   conservado. Probar también { "estado": "pendiente" }.

4) DELETE http://localhost:3000/api/reservas/ID_RECIBIDO -> 204 sin cuerpo;
   repetir -> 404; GET posterior -> 404; el listado baja en uno.

MATRIZ DE PRUEBAS OBSERVADAS
----------------------------
Ejecutada contra reservas_salas_u9.reservas con el servidor real. Cantidades
de la colección antes/después de cada bloque.

| Caso                                        | Resultado observado                     |
|---------------------------------------------|-----------------------------------------|
| Inicio de colección                          | 0 reservas                              |
| POST válido                                  | 201, Location /api/reservas/6af212e5a5fe9bec76110888, estado "pendiente". Colección: 1 |
| POST con estado y _id del cliente            | 201 pero estado "pendiente" e ID propio: estado/_id ignorados |
| PUT completo (7 campos)                      | 200, mismo ID, sala=Sala Multimedia, turno=Noche, personas=5, estado=confirmada |
| PUT incompleto (falta fecha)                 | 400 "El campo fecha es obligatorio..."; GET posterior intacto (sala=Sala Multimedia) |
| PUT con campo extra + _id                    | 400 ("Campo desconocido: extra.", "_id" no modificable) |
| PUT con $set                                 | 400 ("No se permiten operadores...")    |
| PATCH {personas:3}                           | 200, personas=3; estado y sala conservados |
| PATCH {estado:"pendiente"}                   | 200, estado=pendiente; personas=3 conservadas |
| PATCH {} (vacío)                             | 400 "Debe indicar al menos un campo..." |
| PATCH con campo extra (email)                | 400 "Campo desconocido: email."         |
| PATCH con _id                                | 400                                     |
| PATCH con $set                               | 400                                     |
| PATCH personas 0 / 7 / 2.5 / true / ["a"] / {"n":1} / "" | 400 en todos, sin modificar  |
| PATCH estado "cancelada"                     | 400 (enum inválido)                     |
| GET /api/reservas                            | 200, arreglo puro                       |
| GET ID mal formado (abc)                     | 400 JSON                                |
| PUT ID válido ausente (5f1a...d1e)           | 404 JSON; total sin cambios (no crea)   |
| PATCH ID válido ausente                      | 404 JSON                                |
| POST JSON mal formado                        | 400 JSON                                |
| POST sin cuerpo                              | 400 JSON                                |
| GET /api/otra (ruta desconocida)             | 404 JSON {"error":"Ruta de API no encontrada"} |
| DELETE existente (6af212e5...88)             | 204 sin cuerpo; colección: 2 -> 1       |
| DELETE repetido                              | 404 JSON                                |
| GET posterior al DELETE                      | 404 JSON                                |
| Listado tras DELETE                          | 1 reserva (una menos); las otras se conservan |

Persistencia tras reinicio (misma base, datos preparados antes de reiniciar):
- Reserva 6af212e5a5fe9bec76110889 con PATCH {personas:6, estado:"confirmada"};
  se detuvo el servidor (Ctrl+C / SIGINT) y se volvió a iniciar: GET devuelve
  200 con personas=6 y estado=confirmada.
- Reserva 6af212e5a5fe9bec76110888 eliminada antes de reiniciar: tras el
  reinicio el GET sigue devolriendo 404.
- /estado refleja la cantidad real de MongoDB y coincide con el listado.

Sitio HTML (conservado):
- GET / y GET /reservas: listado (arreglo, sin metadatos nuevos).
- GET /reservas/nueva: formulario con action="/reservas"; envío válido ->
  302 con Location /reservas/ID (comprobado con respuesta HTTP cruda:
  "HTTP/1.1 302 Found / Location: /reservas/6af2..."); envío inválido ->
  400 con errores y valores conservados.
- GET /reservas/:id: detalle; ID inexistente o mal formado -> 404 HTML.
- Los cambios hechos por la API se ven en el listado y el detalle HTML.

CALIDAD
-------
- npm run format / format:check (Prettier sobre src y scripts)
- npm run lint / npm run check   (ESLint flat config + Prettier check)
- Última ejecución de npm run check: sin errores.

LISTA ANTES DE ENTREGAR (verificada)
------------------------------------
- POST crea con estado "pendiente" y no acepta estado ni _id.
- PUT exige los siete campos; PATCH solo personas/estado.
- Los rechazos (400/404) no modifican ni crean recursos.
- DELETE elimina solo el ID elegido y responde 204 sin cuerpo.
- Listado API y HTML devuelven arreglos simples.
- GET individual permite comprobar PUT, PATCH y la ausencia tras DELETE.
- Los cambios sobreviven al reinicio y /estado refleja MongoDB.
- Sin secretos ni node_modules en el repositorio (.gitignore + .env.example).