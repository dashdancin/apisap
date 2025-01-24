const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Ruta para la raíz del servidor
app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

// Endpoint para recibir la solicitud de SAP
app.post("/recibir-factura", (req, res) => {
  const facturaData = req.body;

  // Logs para ver los datos recibidos de SAP
  console.log("Datos recibidos de SAP:", facturaData);

  // Responder con los datos recibidos (para pruebas)
  res.status(200).send({
    message: "Datos recibidos",
    data: facturaData,
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
