const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Obtener todos los usuarios (solo admin)
const getUsuarios = async (req, res) => {
  try {
    const rancho_id = req.user.rancho_id;

    const result = await pool.query(
      "SELECT id, nombre_usuario, rol FROM usuarios where rancho_id=$1",
      [rancho_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// // Obtener usuario por id
// const getUsuario = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       "SELECT id, nombre_usuario, rol FROM usuarios WHERE id=$1",
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Usuario no encontrado" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Error del servidor");
//   }
// };

// Crear usuario (registro)
const createUsuario = async (req, res) => {
  const { username, password, rancho_id } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre_usuario, password, rancho_id) VALUES ($1, $2, $3)",
      [username, hashedPassword, rancho_id]
    );
    res.status(200).json({ message: "Usuario creado con éxito" });
  } catch (err) {
    if (
      err.code === "23505" &&
      err.constraint === "usuarios_nombre_usuario_key"
    ) {
      return res
        .status(400)
        .json({ message: "El nombre de usuario ya existe" });
    }
    console.log(err);
    res.status(500).send("Error del servidor");
  }
};

// Login usuario
const loginUsuario = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT u.id, u.nombre_usuario, u.password, u.rol, u.rancho_id, r.nombre as rancho_nombre FROM usuarios u inner join ranchos r on u.rancho_id=r.id where u.nombre_usuario=$1",
      [username]
    );
    const usuario = result.rows[0];

    if (!usuario)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const validPass = await bcrypt.compare(password, usuario.password);
    if (!validPass)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        rancho_nombre: usuario.rancho_nombre,
        rancho_id: usuario.rancho_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// Actualizar usuario (opcional)
// const updateUsuario = async (req, res) => {
//   const { id } = req.params;
//   const { nombre_usuario, password, rol } = req.body;
//   try {
//     let hashedPassword = password;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       hashedPassword = await bcrypt.hash(password, salt);
//     }

//     const result = await pool.query(
//       "UPDATE usuarios SET nombre_usuario=$1, password=$2, rol=$3 WHERE id=$4 RETURNING id, nombre_usuario, rol",
//       [nombre_usuario, hashedPassword, rol, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     if (
//       err.code === "23505" &&
//       err.constraint === "usuarios_nombre_usuario_key"
//     ) {
//       return res
//         .status(400)
//         .json({ message: "El nombre de usuario ya existe" });
//     }
//     res.status(500).send("Error del servidor");
//   }
// };

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id=$1", [id]);
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getUsuarios,
  // getUsuario,
  createUsuario,
  loginUsuario,
  // updateUsuario,
  deleteUsuario,
};
