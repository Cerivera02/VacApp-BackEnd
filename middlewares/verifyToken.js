const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Acceso denegado" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: verified.id,
      nombre_usuario: verified.nombre_usuario,
      rol: verified.rol,
      rancho_id: verified.rancho_id,
      rancho_nombre: verified.rancho_nombre,
    };

    next();
  } catch (err) {
    res.status(400).json({ message: "Token inválido" });
  }
};

module.exports = verifyToken;
