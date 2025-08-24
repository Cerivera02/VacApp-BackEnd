const express = require("express");
const router = express.Router();
const {
  getMarcas,
  getMarca,
  createMarca,
  updateMarca,
  deleteMarca,
} = require("../controllers/marcasController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/", verifyToken, getMarcas);
router.get("/:id", verifyToken, getMarca);
router.post("/", verifyToken, createMarca);
router.put("/", verifyToken, verifyAdmin, updateMarca);
router.delete("/", verifyToken, verifyAdmin, deleteMarca);

module.exports = router;
