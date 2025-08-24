const express = require("express");
const router = express.Router();
const {
  getVacunas,
  getVacuna,
  createVacuna,
  updateVacuna,
  deleteVacuna,
} = require("../controllers/vacunasController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/", verifyToken, getVacunas);
router.post("/", verifyToken, verifyAdmin, createVacuna);
router.put("/:id", verifyToken, verifyAdmin, updateVacuna);
router.delete("/:id", verifyToken, verifyAdmin, deleteVacuna);

module.exports = router;
