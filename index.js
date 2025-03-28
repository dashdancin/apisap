const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.text({ type: "*/*" }));


let ultimoEstado = null;
let ultimosDatosRecibidos = null;

app.get("/", (req, res) => {
  res.send("API envía facturas a Facturama sin validación");
});

// Enviar info a Facturama sin validar
app.post("/recibir-factura", async (req, res) => {
  try {
    console.log("Tipo de contenido:", req.headers["content-type"]);
    console.log("Datos recibidos de SAP:", req.body);

    var authFact = req.headers["authorization"]; 

    let rawFacturaData = req.body;
    rawFacturaData = rawFacturaData.replaceAll('\'', '"');
    rawFacturaData = rawFacturaData.replaceAll('&amp;', '&');
    rawFacturaData = rawFacturaData.replace('"";', '"\"');
    rawFacturaData = rawFacturaData.replace('"";', '\""');
    rawFacturaData = rawFacturaData.replace('%26', '&');
    rawFacturaData = rawFacturaData.replaceAll("#apostrophe", '\'');
    rawFacturaData = rawFacturaData.replaceAll("#double", '\\\"');
    


    // Verificar que rawFacturaData es una cadena de texto
    if (typeof rawFacturaData !== "string") {
      throw new Error("Formato de entrada no válido");
    }

    ultimoEstado = "Datos recibidos";
    ultimosDatosRecibidos = rawFacturaData;

    // Enviar datos a Facturama sin validar el JSON
    try {
      
      var invoice = JSON.parse(rawFacturaData);
      ultimosDatosRecibidos = invoice;

      const response = await axios.post(
        "https://api.facturama.mx/3/cfdis/",
        invoice,
        {
          headers: {
            "Content-Type": "application/json", "authorization":authFact
          },

        }
      );
      console.log("Respuesta de Facturama:", response.data);
      ultimoEstado = "Datos enviados a Facturama correctamente";
      res.status(200).send({
        message: ultimoEstado,
        datosEnviados: rawFacturaData,
        respuestaFacturama: response.data,
      });
    } catch (error) {
      console.error("Error al enviar datos a Facturama:", error.message);
      ultimoEstado = `Error al enviar datos a Facturama: ${error.message}`;
      res.status(500).send({
        error: "Internal Server Error",
        message: `Error al enviar datos a Facturama: ${error.message}`,
      });
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error.message);
    ultimoEstado = `Error al procesar la solicitud: ${error.message}`;
    res.status(400).send({ error: "BadRequest", message: error.message });
  }
});


app.post("/recibir-archivo", async (req, res) => {
  try {

    let invoiceID = req.body;
   
    try {
      


      var authFact = req.headers["authorization"]; 

      const response = await axios.get(
        "https://api.facturama.mx/"+req.body,
        
        {
          headers: {
            "Content-Type": "application/json", "authorization":authFact
          },

        }
      );
      
     
      res.status(200).send({
        respuestaFacturama: response.data,
      });
    } catch (error) {
      console.error("Error al enviar datos a Facturama:", error.message);
      ultimoEstado = `Error al enviar datos a Facturama: ${error.message}`;
      res.status(500).send({
        error: "Internal Server Error",
        message: `Error al enviar datos a Facturama: ${error.message}`,
      });
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error.message);
    ultimoEstado = `Error al procesar la solicitud: ${error.message}`;
    res.status(400).send({ error: "BadRequest", message: error.message });
  }
});


// Devolver el estado de la última solicitud
app.get("/estado-ultima-solicitud", (req, res) => {
  res.send({
   
    estado: ultimoEstado,
    datosRecibidos: ultimosDatosRecibidos,
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
