const pool = require("../db");

const getVacas = async (req, res) => {
  const rancho_id = req.user.rancho_id;
  const result = await pool.query(
    "SELECT * FROM vacas WHERE rancho_id=$1 ORDER BY no_arete asc",
    [rancho_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: "No se encontraron vacas",
    });
  }
  res.json(result.rows);
};

const getVaca = async (req, res) => {
  try {
    const { id } = req.params;
    const rancho_id = req.user.rancho_id;

    if (!id) {
      return res.status(400).json({
        error: "Datos faltantes",
      });
    }

    let query;
    let params;

    if (id) {
      query = "SELECT * FROM vacas WHERE id = $1 AND rancho_id = $2";
      params = [id, rancho_id];
    }

    const result = await pool.query(query, params);

    // ✅ Verificar si se encontró algo
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener vaca:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const createVaca = async (req, res) => {
  try {
    const {
      marca_herrar_id,
      no_arete,
      nombre,
      fecha_nacimiento,
      color,
      pariciones,
      ultima_paricion,
      descripcion,
    } = req.body;

    const rancho_id = req.user.rancho_id;

    if (!marca_herrar_id || !no_arete) {
      return res.status(400).json({
        error: "Datos incompletos",
      });
    }

    const marcaCheck = await pool.query(
      "SELECT id FROM marcas_herrar WHERE id = $1 AND rancho_id = $2",
      [marca_herrar_id, rancho_id]
    );

    if (marcaCheck.rows.length === 0) {
      return res.status(403).json({
        error: "No tienes autorización para usar esta marca de herrar",
      });
    }

    const campos = ["marca_herrar_id", "rancho_id", "no_arete"];
    const valores = [marca_herrar_id, rancho_id, no_arete];

    if (nombre !== undefined && nombre !== null && nombre.trim() !== "") {
      campos.push("nombre");
      valores.push(nombre.trim());
    }

    if (fecha_nacimiento) {
      campos.push("fecha_nacimiento");
      valores.push(fecha_nacimiento);
    }

    if (color !== undefined && color !== null && color.trim() !== "") {
      campos.push("color");
      valores.push(color.trim());
    }

    if (pariciones !== undefined && pariciones !== null) {
      campos.push("pariciones");
      valores.push(pariciones);
    }

    if (ultima_paricion) {
      campos.push("ultima_paricion");
      valores.push(ultima_paricion);
    }

    if (
      descripcion !== undefined &&
      descripcion !== null &&
      descripcion.trim() !== ""
    ) {
      campos.push("descripcion");
      valores.push(descripcion.trim());
    }

    const placeholders = valores.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
      INSERT INTO vacas (${campos.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, valores);

    res.status(200).json({
      message: "Vaca creada exitosamente",
    });
  } catch (err) {
    console.error("Error al crear vaca:", err.message);
    console.log(err);

    // ✅ Manejar errores específicos
    if (err.code === "23503") {
      // Foreign key violation
      return res.status(400).json({
        error: "La marca de herrar especificada no existe",
      });
    }

    if (err.code === "23505") {
      // Unique violation
      return res.status(409).json({
        error: "Ya existe una vaca con ese número de arete",
      });
    }

    res.status(500).json({
      error: "Error del servidor al crear la vaca",
    });
  }
};

const updateVaca = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      marca_herrar_id,
      no_arete,
      nombre,
      fecha_nacimiento,
      color,
      pariciones,
      ultima_paricion,
      descripcion,
    } = req.body;

    const rancho_id = req.user.rancho_id;

    console.log(req.body);

    // ✅ Verificar que la vaca exista y pertenezca al rancho del usuario
    const vacaCheck = await pool.query(
      "SELECT id FROM vacas WHERE id = $1 AND rancho_id = $2",
      [id, rancho_id]
    );

    if (vacaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "No se encontró el registro",
      });
    }

    // ✅ Si se va a cambiar marca_herrar_id, verificar que pertenezca al rancho
    if (marca_herrar_id) {
      const marcaCheck = await pool.query(
        "SELECT id FROM marcas_herrar WHERE id = $1 AND rancho_id = $2",
        [marca_herrar_id, rancho_id]
      );

      if (marcaCheck.rows.length === 0) {
        return res.status(403).json({
          error: "No tienes autorización para usar esta marca de herrar",
        });
      }
    }

    // ✅ Actualizar todos los campos directamente
    const query = `
      UPDATE vacas 
      SET marca_herrar_id = $1, 
          no_arete = $2, 
          nombre = $3, 
          fecha_nacimiento = $4, 
          color = $5, 
          pariciones = $6, 
          ultima_paricion = $7, 
          descripcion = $8
      WHERE id = $9 AND rancho_id = $10 
      RETURNING *
    `;

    const valores = [
      marca_herrar_id,
      no_arete,
      nombre ? nombre.trim() : null,
      fecha_nacimiento,
      color ? color.trim() : null,
      pariciones,
      ultima_paricion,
      descripcion ? descripcion.trim() : null,
      id,
      rancho_id,
    ];

    const result = await pool.query(query, valores);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No se pudo actualizar la vaca",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar vaca:", err.message);
    console.log(err);

    // ✅ Manejar errores específicos
    if (err.code === "23503") {
      return res.status(400).json({
        error: "La marca de herrar especificada no existe",
      });
    }

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Ya existe una vaca con ese número de arete",
      });
    }

    res.status(500).json({
      error: "Error del servidor al actualizar la vaca",
    });
  }
};

const deleteVaca = async (req, res) => {
  const { id } = req.params;
  try {
    const rancho_id = req.user.rancho_id;

    // ✅ Primero verificar que la vaca exista y pertenezca al rancho del usuario
    const vacaCheck = await pool.query(
      "SELECT id FROM vacas WHERE id = $1 AND rancho_id = $2",
      [id, rancho_id]
    );

    if (vacaCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Registro no encontrado",
      });
    }

    // ✅ Si pasa las validaciones, eliminar la vaca
    const result = await pool.query(
      "DELETE FROM vacas WHERE id = $1 AND rancho_id = $2",
      [id, rancho_id]
    );

    // Verificar que se eliminó algo
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "No se pudo eliminar la vaca",
      });
    }

    res.json({ message: "Vaca eliminada exitosamente" });
  } catch (err) {
    console.error("Error al eliminar vaca:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { getVacas, getVaca, createVaca, updateVaca, deleteVaca };
