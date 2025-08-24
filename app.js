var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const usuariosRouter = require("./routes/usuarios");
const marcasRouter = require("./routes/marcas");
const vacunasRouter = require("./routes/vacunas");
const enfermedadesRouter = require("./routes/enfermedades");
const vacasRouter = require("./routes/vacas");
const vacasEnfermedadesRouter = require("./routes/vacasEnfermedades");
const vacasVacunasRouter = require("./routes/vacasVacunas");

var app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/usuarios", usuariosRouter);
app.use("/marca", marcasRouter);
app.use("/enfermedades", enfermedadesRouter);
app.use("/vacunas", vacunasRouter);
app.use("/vacas", vacasRouter);
app.use("/vacasEnfermedades", vacasEnfermedadesRouter);
app.use("/vacasVacunas", vacasVacunasRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // send error response as JSON
  res.status(err.status || 500);
  res.json({
    error: err.message,
    status: err.status || 500,
    ...(req.app.get("env") === "development" && { stack: err.stack }),
  });
});

module.exports = app;
