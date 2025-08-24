const express = require("express");
const router = express.Router();

const {
  getVacasVacunas,
  getVacaVacunas,
  getVacaVacunasVigente,
  createVacasVacunas,
  updateVacasVacunas,
  deleteVacasVacunas,
  deleteAllVacaVacunas,
} = require("../controllers/vacasVacunasController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.post("/:vaca_id", verifyToken, createVacasVacunas);

router.get("/", verifyToken, getVacasVacunas);
router.get("/:vaca_id", verifyToken, getVacaVacunas);
router.get("/vigente/:vaca_id", verifyToken, getVacaVacunasVigente);

router.put("/:id", verifyToken, updateVacasVacunas);
router.delete("/:id", verifyToken, verifyAdmin, deleteVacasVacunas);
router.delete(
  "/todas/:vaca_id",
  verifyToken,
  verifyAdmin,
  deleteAllVacaVacunas
);

module.exports = router;
