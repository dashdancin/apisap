const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let ultimoEstado = null;
let ultimosDatosRecibidos = null;
let ultimoJsonConvertido = null;

app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

app.post("/recibir-factura", async (req, res) => {
  try {
    console.log("Datos recibidos de SAP:", req.body);

    let rawFacturaData = req.body;

    if (typeof rawFacturaData !== "object") {
      throw new Error("Formato JSON inválido");
    }

    ultimoEstado = "JSON válido";
    ultimosDatosRecibidos = rawFacturaData;
    ultimoJsonConvertido = rawFacturaData;

    try {
      const response = await axios.post(
        "https://api.facturama.mx/3/cfdis/",
        rawFacturaData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          auth: {
            username: process.env.FACTURAMA_USER,
            password: process.env.FACTURAMA_PASSWORD,
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

app.get("/estado-ultima-solicitud", (req, res) => {
  res.send({
    estado: ultimoEstado,
    datosRecibidos: ultimosDatosRecibidos,
    jsonConvertido: ultimoJsonConvertido,
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
