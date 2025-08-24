const express = require("express");
const router = express.Router();
const {
  getUsuarios,
  getUsuario,
  createUsuario,
  loginUsuario,
  updateUsuario,
  deleteUsuario,
} = require("../controllers/usuariosController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Rutas públicas
router.post("/", createUsuario); // registro
router.post("/login", loginUsuario); // login

// Rutas protegidas (requieren token)
router.get("/", verifyToken, verifyAdmin, getUsuarios);
// router.get("/:id", verifyToken, verifyAdmin, getUsuario);
// router.put("/:id", verifyToken, verifyAdmin, updateUsuario);
router.delete("/:id", verifyToken, verifyAdmin, deleteUsuario);

module.exports = router;
