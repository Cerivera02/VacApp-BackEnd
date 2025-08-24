const pool = require("../db");

const getVacasEnfermedades = async (req, res) => {
  try {
    const rancho_id = req.user.rancho_id;
    const result = await pool.query(
      `SELECT 
          ve.id, 
          ve.vaca_id, 
          ve.enfermedad_id, 
          e.nombre as nombre_enfermedad, 
          ve.estado
       FROM vacas_enfermedades ve 
       LEFT JOIN vacas v ON ve.vaca_id = v.id 
       LEFT JOIN enfermedades e ON ve.enfermedad_id = e.id
       WHERE v.rancho_id = $1
       ORDER BY ve.vaca_id, ve.id`,
      [rancho_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    const vacasAgrupadas = {};

    result.rows.forEach((row) => {
      const vacaId = row.vaca_id;

      if (!vacasAgrupadas[vacaId]) {
        vacasAgrupadas[vacaId] = {
          vaca_id: vacaId,
          enfermedad_id: [],
          nombre_enfermedades: [],
          estados: [],
        };
      }

      vacasAgrupadas[vacaId].enfermedad_id.push(row.enfermedad_id);
      vacasAgrupadas[vacaId].nombre_enfermedades.push(row.nombre_enfermedad);
      vacasAgrupadas[vacaId].estados.push(row.estado);
    });

    const resultadoFinal = Object.values(vacasAgrupadas);

    res.json(resultadoFinal);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error del servidor");
  }
};

const getVacaEnfermedades = async (req, res) => {
  try {
    const { vaca_id } = req.params;
    const rancho_id = req.user.rancho_id;

    const vacaCheck = await pool.query(
      "SELECT id FROM vacas WHERE id = $1 AND rancho_id = $2",
      [vaca_id, rancho_id]
    );

    if (vacaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Vaca no encontrada o no tienes autorización para verla",
      });
    }

    const result = await pool.query(
      `SELECT 
          ve.id, 
          ve.enfermedad_id, 
          e.nombre as nombre_enfermedad, 
          ve.estado,
          ve.fecha_diagnostico,
          ve.observaciones
       FROM vacas_enfermedades ve 
       LEFT JOIN enfermedades e ON ve.enfermedad_id = e.id
       WHERE ve.vaca_id = $1
       ORDER BY ve.fecha_diagnostico DESC`,
      [vaca_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener enfermedades de la vaca:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const createVacasEnfermedad = async (req, res) => {
  try {
    const { vaca_id } = req.params;
    const { enfermedad_id, estado, observaciones } = req.body;
    const rancho_id = req.user.rancho_id;

    if (!enfermedad_id) {
      return res.status(400).json({
        error: "Datos faltantes",
      });
    }

    const vacaCheck = await pool.query(
      "SELECT id FROM vacas WHERE id = $1 AND rancho_id = $2",
      [vaca_id, rancho_id]
    );

    if (vacaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    const enfermedadCheck = await pool.query(
      "SELECT id FROM enfermedades WHERE id = $1",
      [enfermedad_id]
    );

    if (enfermedadCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    const campos = ["vaca_id", "enfermedad_id"];
    const valores = [vaca_id, enfermedad_id];
    let placeholders = "$1, $2";
    let contador = 3;

    if (estado !== undefined && estado !== null) {
      campos.push("estado");
      valores.push(estado);
      placeholders += `, $${contador}`;
      contador++;
    }

    if (
      observaciones !== undefined &&
      observaciones !== null &&
      observaciones.trim() !== ""
    ) {
      campos.push("observaciones");
      valores.push(observaciones.trim());
      placeholders += `, $${contador}`;
      contador++;
    }

    const query = `
      INSERT INTO vacas_enfermedades (${campos.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, valores);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Esta vaca ya tiene asignada esta enfermedad",
      });
    }

    if (err.code === "23503") {
      return res.status(400).json({
        error: "La enfermedad o vaca especificada no existe",
      });
    }

    res.status(500).send("Error del servidor");
  }
};

const updateVacasEnfermedad = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones, fecha_diagnostico } = req.body;
    const rancho_id = req.user.rancho_id;
    const isAdmin = req.user.rol === "administrador";

    // Verificar que el registro existe y pertenece al rancho del usuario
    const enfermedadCheck = await pool.query(
      `SELECT ve.id, ve.enfermedad_id, ve.estado, ve.observaciones
       FROM vacas_enfermedades ve 
       JOIN vacas v ON ve.vaca_id = v.id 
       WHERE ve.id = $1 AND v.rancho_id = $2`,
      [id, rancho_id]
    );

    if (enfermedadCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    const registroActual = enfermedadCheck.rows[0];
    let query, valores;

    if (isAdmin) {
      query =
        "UPDATE vacas_enfermedades SET estado = $1, observaciones = $2, fecha_diagnostico = $3 WHERE id = $4 RETURNING *";
      valores = [estado, observaciones, fecha_diagnostico, id];
    } else {
      query =
        "UPDATE vacas_enfermedades SET observaciones = $1 WHERE id = $2 RETURNING *";
      valores = [observaciones, id];
    }

    const result = await pool.query(query, valores);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No se pudo actualizar el registro",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar vaca enfermedad:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const deleteVacasEnfermedad = async (req, res) => {
  try {
    const { id } = req.params;
    const rancho_id = req.user.rancho_id;

    const enfermedadCheck = await pool.query(
      `SELECT ve.id 
       FROM vacas_enfermedades ve 
       JOIN vacas v ON ve.vaca_id = v.id 
       WHERE ve.id = $1 AND v.rancho_id = $2`,
      [id, rancho_id]
    );

    if (enfermedadCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    const result = await pool.query(
      "DELETE FROM vacas_enfermedades WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "No se pudo eliminar el registro",
      });
    }

    res.json({ message: "Registro eliminado correctamente" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const deleteAllVacaEnfermedades = async (req, res) => {
  try {
    const { vaca_id } = req.params;
    const rancho_id = req.user.rancho_id;

    const vacaCheck = await pool.query(
      "SELECT id FROM vacas WHERE id = $1 AND rancho_id = $2",
      [vaca_id, rancho_id]
    );

    if (vacaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    const result = await pool.query(
      "DELETE FROM vacas_enfermedades WHERE vaca_id = $1",
      [vaca_id]
    );

    res.json(result.rowCount);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getVacasEnfermedades,
  getVacaEnfermedades,
  createVacasEnfermedad,
  updateVacasEnfermedad,
  deleteVacasEnfermedad,
  deleteAllVacaEnfermedades,
};
