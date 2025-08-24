const express = require("express");
const router = express.Router();
const {
  getVacas,
  getVaca,
  createVaca,
  updateVaca,
  deleteVaca,
} = require("../controllers/vacasController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.post("/", verifyToken, createVaca);
router.get("/", verifyToken, getVacas);
router.get("/:id", verifyToken, getVaca);
router.post("/buscar", verifyToken, getVaca);
router.put("/:id", verifyToken, verifyAdmin, updateVaca);
router.delete("/:id", verifyToken, verifyAdmin, deleteVaca);

module.exports = router;
