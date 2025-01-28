const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Cargar variables de entorno
require("dotenv").config();

// Middleware para recibir texto plano
app.use(express.text({ type: "*/*" })); // Asegurarnos de aceptar cualquier tipo de contenido

// Variables globales para almacenar el estado de la última solicitud
let ultimoEstado = null;
let ultimosDatosRecibidos = null;

// Función para validar JSON
function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}

// Ruta para la raíz del servidor
app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

// Endpoint para recibir la solicitud de SAP como texto plano y validar el JSON
app.post("/recibir-factura", (req, res) => {
  try {
    console.log("Tipo de contenido:", req.headers["content-type"]); // Log del tipo de contenido
    console.log("Datos recibidos de SAP:", req.body);

    let rawFacturaData = req.body;

    // Verificar que rawFacturaData es una cadena de texto
    if (typeof rawFacturaData !== "string") {
      throw new Error("Invalid input format");
    }

    // Validar JSON
    const esJsonValido = isValidJson(rawFacturaData);

    // Almacenar los datos de la última solicitud
    ultimoEstado = esJsonValido ? "JSON válido" : "JSON inválido";
    ultimosDatosRecibidos = rawFacturaData;

    // Responder con el estado de la validación
    res.status(200).send({ message: ultimoEstado });
  } catch (error) {
    // Manejo de errores
    console.error("Error al procesar el JSON:", error.message);
    ultimoEstado = `Error al procesar el JSON: ${error.message}`;
    res.status(400).send({ error: "BadRequest", message: error.message });
  }
});

// Nuevo endpoint para devolver el estado de la última solicitud
app.get("/estado-ultima-solicitud", (req, res) => {
  res.send({
    estado: ultimoEstado,
    datosRecibidos: ultimosDatosRecibidos,
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
