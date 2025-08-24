const pool = require("../db");

const getEnfermedades = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM enfermedades");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error del servidor");
  }
};

const createEnfermedad = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO enfermedades (nombre) VALUES ($1) RETURNING *",
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

const updateEnfermedad = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const result = await pool.query(
      "UPDATE enfermedades SET nombre = $1 WHERE id = $2 RETURNING *",
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

const deleteEnfermedad = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM enfermedades WHERE id=$1", [id]);
  res.json({ message: "Enfermedad eliminada" });
};

module.exports = {
  getEnfermedades,
  createEnfermedad,
  updateEnfermedad,
  deleteEnfermedad,
};
