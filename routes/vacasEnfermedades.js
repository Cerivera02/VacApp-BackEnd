const express = require("express");
const router = express.Router();

const {
  getVacasEnfermedades,
  getVacaEnfermedades,
  createVacasEnfermedad,
  updateVacasEnfermedad,
  deleteVacasEnfermedad,
  deleteAllVacaEnfermedades,
} = require("../controllers/vacasEnfermedadesController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/", verifyToken, getVacasEnfermedades);
router.get("/:vaca_id", verifyToken, getVacaEnfermedades);

router.post("/:vaca_id", verifyToken, createVacasEnfermedad);

router.put("/:id", verifyToken, updateVacasEnfermedad);
router.delete("/:id", verifyToken, verifyAdmin, deleteVacasEnfermedad);
router.delete(
  "/todas/:vaca_id",
  verifyToken,
  verifyAdmin,
  deleteAllVacaEnfermedades
);

module.exports = router;
