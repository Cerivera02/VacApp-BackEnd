const pool = require("../db");

const getVacasVacunas = async (req, res) => {
  try {
    const rancho_id = req.user.rancho_id;
    const result = await pool.query(
      `SELECT 
            vv.id, 
            vv.vaca_id, 
            vv.vacuna_id
        FROM vacas_vacunas vv 
        LEFT JOIN vacas v ON vv.vaca_id = v.id 
        WHERE v.rancho_id = $1
        AND (
            EXTRACT(YEAR FROM vv.fecha_aplicacion) = EXTRACT(YEAR FROM CURRENT_DATE)
            OR vv.fecha_vencimiento > CURRENT_DATE
            OR vv.fecha_vencimiento IS NULL
        )
        AND vv.id IN (
            SELECT MAX(id) 
            FROM vacas_vacunas vv2 
            WHERE vv2.vaca_id = vv.vaca_id 
            AND vv2.vacuna_id = vv.vacuna_id
        )
        ORDER BY vv.vaca_id, vv.fecha_aplicacion DESC`,
      [rancho_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No se encontraron registros",
      });
    }

    const vacasAgrupadas = {};

    result.rows.forEach((row) => {
      const vacaId = row.vaca_id;

      if (!vacasAgrupadas[vacaId]) {
        vacasAgrupadas[vacaId] = {
          vaca_id: vacaId,
          id: [],
          //   vacuna_id: [],
        };
      }

      //   vacasAgrupadas[vacaId].vacuna_id.push(row.vacuna_id);
      vacasAgrupadas[vacaId].id.push(row.id);
    });

    const resultadoFinal = Object.values(vacasAgrupadas);

    res.json(resultadoFinal);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error del servidor");
  }
};

const getVacaVacunasVigente = async (req, res) => {
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
      `SELECT 
            vv.id, 
            vv.vaca_id, 
            vv.vacuna_id,
            e.nombre as nombre_vacuna,
            vv.fecha_aplicacion,
            vv.fecha_vencimiento,
            vv.observaciones
        FROM vacas_vacunas vv
        LEFT JOIN vacunas e ON vv.vacuna_id = e.id
        WHERE vv.vaca_id = $1
        AND (
            EXTRACT(YEAR FROM vv.fecha_aplicacion) = EXTRACT(YEAR FROM CURRENT_DATE)
            OR vv.fecha_vencimiento > CURRENT_DATE
            OR vv.fecha_vencimiento IS NULL
        )
        AND vv.id IN (
            SELECT MAX(id) 
            FROM vacas_vacunas vv2 
            WHERE vv2.vaca_id = vv.vaca_id 
            AND vv2.vacuna_id = vv.vacuna_id
        )
        ORDER BY vv.vaca_id, vv.fecha_aplicacion DESC`,
      [vaca_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getVacaVacunas = async (req, res) => {
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
      `SELECT 
              vv.id,
              vv.vaca_id,
              vv.vacuna_id,
              e.nombre as nombre_vacuna,
              vv.fecha_aplicacion,
              vv.fecha_vencimiento,
              vv.observaciones
          FROM vacas_vacunas vv
          LEFT JOIN vacunas e ON vv.vacuna_id = e.id
          WHERE vv.vaca_id = $1
          ORDER BY vv.vaca_id, vv.fecha_aplicacion DESC`,
      [vaca_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

const createVacasVacunas = async (req, res) => {
  try {
    const { vaca_id } = req.params;
    const { vacuna_id, fecha_aplicacion, fecha_vencimiento, observaciones } =
      req.body;
    const rancho_id = req.user.rancho_id;

    if (!vacuna_id) {
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

    const vacunaCheck = await pool.query(
      "SELECT id FROM vacunas WHERE id = $1",
      [vacuna_id]
    );

    if (vacunaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Vacuna no encontrada",
      });
    }

    const campos = ["vaca_id", "vacuna_id"];
    const valores = [vaca_id, vacuna_id];
    let placeholders = "$1, $2";
    let contador = 3;

    if (fecha_aplicacion !== undefined && fecha_aplicacion !== null) {
      campos.push("fecha_aplicacion");
      valores.push(fecha_aplicacion);
      placeholders += `, $${contador}`;
      contador++;
    }

    if (fecha_vencimiento !== undefined && fecha_vencimiento !== null) {
      campos.push("fecha_vencimiento");
      valores.push(fecha_vencimiento);
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
        INSERT INTO vacas_vacunas (${campos.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

    const result = await pool.query(query, valores);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al asignar vacuna a la vaca:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Esta vaca ya tiene asignada esta vacuna en la misma fecha",
      });
    }

    if (err.code === "23503") {
      return res.status(400).json({
        error: "La vacuna o vaca especificada no existe",
      });
    }

    res.status(500).json({
      error: "Error del servidor al asignar la vacuna",
    });
  }
};

const updateVacasVacunas = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_aplicacion, fecha_vencimiento, observaciones, vacuna_id } =
      req.body;
    const rancho_id = req.user.rancho_id;
    const isAdmin = req.user.rol === "administrador";

    const vacunaCheck = await pool.query(
      `SELECT vv.id, vv.vacuna_id, vv.fecha_aplicacion, vv.fecha_vencimiento, vv.observaciones
         FROM vacas_vacunas vv 
         JOIN vacas v ON vv.vaca_id = v.id 
         WHERE vv.id = $1 AND v.rancho_id = $2`,
      [id, rancho_id]
    );

    if (vacunaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    let query, valores;

    if (isAdmin) {
      // Query único para admin: actualiza todos los campos excepto vacuna_id
      query =
        "UPDATE vacas_vacunas SET fecha_aplicacion = $1, fecha_vencimiento = $2, observaciones = $3 WHERE id = $4 RETURNING *";
      valores = [fecha_aplicacion, fecha_vencimiento, observaciones, id];
    } else {
      query =
        "UPDATE vacas_vacunas SET observaciones = $1 WHERE id = $2 RETURNING *";
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
    console.error("Error al actualizar vaca vacuna:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const deleteVacasVacunas = async (req, res) => {
  try {
    const { id } = req.params;
    const rancho_id = req.user.rancho_id;

    const enfermedadCheck = await pool.query(
      `SELECT vv.id 
       FROM vacas_vacunas vv 
       JOIN vacas v ON vv.vaca_id = v.id 
       WHERE vv.id = $1 AND v.rancho_id = $2`,
      [id, rancho_id]
    );

    if (enfermedadCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    const result = await pool.query("DELETE FROM vacas_vacunas WHERE id = $1", [
      id,
    ]);

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

const deleteAllVacaVacunas = async (req, res) => {
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
      "DELETE FROM vacas_vacunas WHERE vaca_id = $1",
      [vaca_id]
    );

    res.json(result.rowCount);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getVacasVacunas,
  getVacaVacunasVigente,
  getVacaVacunas,
  createVacasVacunas,
  updateVacasVacunas,
  deleteVacasVacunas,
  deleteAllVacaVacunas,
};
