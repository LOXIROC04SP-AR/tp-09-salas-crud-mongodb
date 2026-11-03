TRABAJO PRÁCTICO 09 - Salas HTTP - MongoDB

PDF: semana-09-trabajo-practico-09
Titulo: Trabajo practico 09 - Actualización y eliminación de reservas de salas

OBJETIVO IMPLEMENTADO:
Este trabajo práctico corresponde a la unidad 9 del curso, basado en el PDF
`semana-09-trabajo-practico-09` con el título: "Trabajo practico 09 - Actualización y eliminación de reservas de salas".

El objetivo fue añadir funcionalidades de actualización y eliminación de reservas
de salas al sistema existente (tp-08), que ya contaba con:
- Creación de reservas
- Listado de reservas
- Validación de formularios

QUE SE IMPLEMENTÓ en tp-09:

1. FUNCIONALIDAD DE ACTUALIZACIÓN (PUT)
   - Endpoint: PUT /reservas/:id (HTML) y PUT /api/reservas/:id (JSON)
   - Permite modificar reservas existentes cambiando campos como: estudiante, email,
     sala, fecha, turno, personas, estado
   - Validación parcial de campos (solo los que se proporcionen se actualizan)
   - Manejo de errores si el ID no existe o los datos son inválidos
   - Vista EJS que reutiliza el formulario de creación con título "Editar reserva"

2. FUNCIONALIDAD DE ELIMINACIÓN (DELETE)
   - Endpoint: DELETE /reservas/:id (HTML) y DELETE /api/reservas/:id (JSON)
   - Elimina una reserva por su ID con confirmación JavaScript
   - Después de eliminar, muestra la lista actualizada con mensaje "Reserva eliminada correctamente."
   - Manejo de error si el ID no existe

ARQUITECTURA DEL SISTEMA:
El proyecto mantiene la misma estructura del tp-08 (Express 5 + Mongoose + MongoDB Atlas):
- Controladores: Lógica de negocio para vistas HTML y API JSON
- Servicios: Capa intermedia que comunica con el modelo de Mongoose
- Rutas: Definición de endpoints HTTP
- Modelos: Esquemas Mongoose con validación de campos
- Middleware: Validación de datos y manejo de errores

ARCHIVOS CLAVE:

tp-09/
├── package.json          # Configuración del proyecto con scripts
├── .env                 # Variables de entorno (PORT, MONGODB_URI)
├── src/
│   ├── config/          # Configuración (entorno, base-datos)
│   ├── modelos/         # Esquemas Mongoose y catálogos
│   ├── servicios/       # Lógica de negocio (actualizar/eliminar)
│   ├── controladores/   # Controladores HTML y API
│   ├── rutas/           # Rutas Express (PUT y DELETE añadidos)
│   └── middleware/      # Validación de datos
├── views/               # Plantillas EJS (nueva, detalle, lista)
├── public/              # CSS stylesheet
└── scripts/             # Comandos CLI para testing

SCRIPTS DE LINEA DE COMANDOS (CLS):
Incluidos para testing manual:
- npm run crear - Crear una reserva nueva
- npm run listar - Listar todas las reservas (opcionalmente filtrar por sala)
- npm run actualizar - Actualizar una reserva por ID
- npm run eliminar - Eliminar una reserva por ID
- npm run comprobar-conexion - Verificar conexión a MongoDB

CARACTERÍSTICAS TÉCNICAS:
- Express 5 con enrutamiento nativo de promesas
- Mongoose 9 con esquemas validados
- MongoDB Atlas como base de datos
- EJS para vistas HTML
- Validación de esquema: campos obligatorios, enum (salas/turnos/estados),
  rango de personas (1-6), formato de email
- Manejo de errores: ErrorEntrada (400), NoEncontrado (404), errores de validación

CÓMO EJECUTAR EL PROYECTO:

1. Instalar dependencias:
   npm install

2. Configurar el archivo .env:
   PORT=3000
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.example.mongodb.net/tp09

3. Iniciar el servidor:
   npm start

4. Probar las nuevas funcionalidades:
   - Actualizar: npm run actualizar (ingresar ID y nuevos datos)
   - Eliminar: npm run eliminar (ingresar ID de la reserva a borrar)

DIFERENCIAS CON tp-08:
- Se añadieron los métodos actualizar() y eliminar() en src/servicios/reservas.js
- Se agregaron rutas PUT /reservas/:id y DELETE /reservas/:id en src/rutas/reservas.js
- Se añadieron controladores actualizar y eliminar en src/controladores/reservas.js
- Se incluyó middleware validarEstado para validación de updates parciales
- Las vistas reutilizan nueva.ejs con título "Editar reserva" para la actualización

CONCLUSIONES:
El trabajo práctico 09 completó exitosamente la funcionalidad solicitada en el PDF
seman-09-trabajo-practico-09, añadiendo las capacidades de actualización y
eliminación de reservas de salas al sistema existente, manteniendo la consistencia
architectónica con el trabajo práctico 08 y utilizando las tecnologías
correspondientes (Express 5, Mongoose 9, MongoDB Atlas).