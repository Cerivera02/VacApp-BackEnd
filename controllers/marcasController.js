const pool = require("../db");

const getMarcas = async (req, res) => {
  try {
    const rancho_id = req.user.rancho_id;
    const result = await pool.query(
      "SELECT * FROM marcas_herrar WHERE rancho_id=$1",
      [rancho_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error del servidor");
  }
};

const getMarca = async (req, res) => {
  const { id } = req.params;
  try {
    const rancho_id = req.user.rancho_id;

    const result = await pool.query(
      "SELECT * FROM marcas_herrar WHERE id=$1 and rancho_id=$2",
      [id, rancho_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Marca de herrar no encontrada",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

const createMarca = async (req, res) => {
  const { propietario } = req.body;
  const rancho_id = req.user.rancho_id;
  const usuario_id = req.user.id;
  try {
    const result = await pool.query(
      "INSERT INTO marcas_herrar (propietario, usuario_id, rancho_id) VALUES ($1, $2, $3) RETURNING *",
      [propietario, usuario_id, rancho_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

const updateMarca = async (req, res) => {
  const { propietario, usuario_id } = req.body;
  try {
    const rancho_id = req.user.rancho_id;
    const result = await pool.query(
      "UPDATE marcas_herrar SET propietario=$1 WHERE usuario_id=$2 and rancho_id=$3 RETURNING *",
      [propietario, usuario_id, rancho_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Marca no encontrada",
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

const deleteMarca = async (req, res) => {
  const { usuario_id } = req.body;
  try {
    const rancho_id = req.user.rancho_id;

    const marcaCheck = await pool.query(
      "SELECT rancho_id FROM marcas_herrar WHERE usuario_id = $1",
      [usuario_id]
    );

    if (marcaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Marca no encontrada",
      });
    }

    if (marcaCheck.rows[0].rancho_id !== rancho_id) {
      return res.status(403).json({
        error: "Acceso no autorizado.",
      });
    }

    const result = await pool.query(
      "DELETE FROM marcas_herrar WHERE usuario_id = $1 AND rancho_id = $2",
      [usuario_id, rancho_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "No se pudo eliminar la marca",
      });
    }

    res.json({ message: "Marca eliminada exitosamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { getMarcas, getMarca, createMarca, updateMarca, deleteMarca };
