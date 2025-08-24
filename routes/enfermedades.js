const express = require("express");
const router = express.Router();
const {
  getEnfermedades,
  createEnfermedad,
  updateEnfermedad,
  deleteEnfermedad,
} = require("../controllers/enfermedadesController");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/", verifyToken, getEnfermedades);
router.post("/", verifyToken, verifyAdmin, createEnfermedad);
router.put("/:id", verifyToken, verifyAdmin, updateEnfermedad);
router.delete("/:id", verifyToken, verifyAdmin, deleteEnfermedad);

module.exports = router;
