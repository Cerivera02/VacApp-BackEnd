// vacunasController.js
const pool = require("../db");

const getVacunas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vacunas");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error del servidor");
  }
};

const getVacuna = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM vacunas WHERE id=$1", [id]);
  res.json(result.rows[0]);
};

const createVacuna = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO vacunas (nombre) VALUES ($1) RETURNING *",
      [nombre]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Ya existe este valor.",
      });
    }
    res.status(500).json({
      error: "Error del servidor",
    });
  }
};

const updateVacuna = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const result = await pool.query(
      "UPDATE vacunas SET nombre = $1 WHERE id = $2 RETURNING *",
      [nombre, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrada",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Ya existe este valor.",
      });
    }

    res.status(500).json({
      error: "Error del servidor",
    });
  }
};

const deleteVacuna = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM vacunas WHERE id=$1", [id]);
  res.json({ message: "Vacuna eliminada" });
};

module.exports = {
  getVacunas,
  getVacuna,
  createVacuna,
  updateVacuna,
  deleteVacuna,
};
