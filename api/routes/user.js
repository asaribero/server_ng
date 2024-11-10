const express = require('express');
const router = express.Router();
const mysqlConnection = require('../connection/connection');
const jwt = require('jsonwebtoken');
const ID_ROL_ADMIN = 1;
const ID_ROL_ESTUDIANTE = 2;
const ID_ROL_DOCENTE = 3;
const name_table = 'usuarios';

router.get('/',(req,res)=>{
    mysqlConnection.query(`select * from ${name_table} u JOIN roles r ON u.rol = r.rol`, (err,rows,fields) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err)
        }
    })
});

router.get('/roles',(req,res)=>{
    mysqlConnection.query(`select * from roles`, (err,rows,fields) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err)
        }
    })
});

router.get('/userByParams/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query(`SELECT * FROM ${name_table} u JOIN roles r ON u.rol = r.rol WHERE idUsuario = ${id}`, (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                // Estructura para cumplir con UserResponse
                res.json({
                    data: rows[0], // Envía el primer resultado en la clave "data"
                    support: {
                        url: "http://support.example.com", // Información adicional de soporte
                        text: "Para más información, visita nuestro soporte."
                    }
                });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } else {
            console.log(err);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    });
});

// Ruta para crear un nuevo usuario
router.post('/create', (req, res) => {
    const { nombre, email, rol, contrasena } = req.body;

    // Validar la entrada del usuario
    if (!validateUserInput(nombre, email, rol, contrasena)) {
        return res.status(400).json({ status: 'Todos los campos son requeridos', id_status: 0 });
    }

    const insertQuery = `INSERT INTO usuarios (nombre, email, rol, contrasena) VALUES (?, ?, ?, ?)`;
    const queryParams = [nombre, email, rol, contrasena];

    mysqlConnection.query(insertQuery, queryParams, (err, result) => {
        if (!err) {
            res.json({ status: 'Usuario creado', id_status: 1 });
        } else {
            console.log(err);
            res.status(500).json({ status: 'Error al crear el usuario', id_status: 0 });
        }
    });
});

// Ruta para actualizar un usuario existente
router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, contrasena } = req.body;

    // Validar la entrada del usuario
    if (!validateUserInput(nombre, email, rol, contrasena)) {
        return res.status(400).json({ status: 'Todos los campos son requeridos', id_status: 0 });
    }

    const updateQuery = `UPDATE usuarios SET nombre = ?, email = ?, rol = ?, contrasena = ? WHERE idUsuario = ?`;
    const queryParams = [nombre, email, rol, contrasena, id];

    mysqlConnection.query(updateQuery, queryParams, (err, result) => {
        if (!err) {
            if (result.affectedRows > 0) {
                res.json({ status: 'Usuario actualizado', id_status: 1 });
            } else {
                res.status(404).json({ status: 'Usuario no encontrado', id_status: 0 });
            }
        } else {
            console.log(err);
            res.status(500).json({ status: 'Error al actualizar el usuario', id_status: 0 });
        }
    });
});


// Ruta para iniciar sesión
router.post('/signin', (req, res) => {
    const { nombre, contrasena } = req.body;

    const query = `SELECT * FROM ${name_table} WHERE nombre = ? AND contrasena = ?`;
    const queryParams = [nombre, contrasena];

    // Crear una versión de la consulta con los valores insertados para depuración
    const formattedQuery = mysqlConnection.format(query, queryParams);
    console.log(`Ejecutando consulta: ${formattedQuery}`);

    mysqlConnection.query(query, queryParams, (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let data = JSON.stringify(rows[0]);
                const token = jwt.sign(data, 'stil');
                res.json({ status: 'Usuario y contraseña Correctos' , token:token });
            } else {
                res.json('Usuario y contraseña incorrectos');
            }
        } else {
            console.log(err);
            res.status(500).json({ status: 'Error en el servidor', id_status: 0 });
        }
    });
});


router.get('/docentes',(req,res)=>{
    mysqlConnection.query(`select * from ${name_table} where rol=?`,[ID_ROL_DOCENTE] ,(err,rows,fields) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err)
        }
    })
});

router.get('/administradores',(req,res)=>{
    mysqlConnection.query(`select * from ${name_table} where rol=?`,[ID_ROL_ADMIN] ,(err,rows,fields) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err)
        }
    })
});

router.get('/estudiantes',(req,res)=>{
    mysqlConnection.query(`select * from ${name_table} where rol=?`,[ID_ROL_ESTUDIANTE] ,(err,rows,fields) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err)
        }
    })
});

router.post('/test',verifyToken,(req,res) => {
    res.json('Informacion secreta');
});

// Ruta para guardar un usuario
router.post('/save', (req, res) => {
    const { nombre, email, rol, contrasena } = req.body;

    // Validar la entrada del usuario
    if (!validateUserInput(nombre, email, rol, contrasena)) {
        return res.status(400).json({ status: 'Todos los campos son requeridos', id_status: 0 });
    }

    const insertQuery = `INSERT INTO usuarios (nombre, email, rol, contrasena) VALUES (?, ?, ?, ?)`;
    const queryParams = [nombre, email, rol, contrasena];

    // Crear una versión de la consulta con los valores insertados para depuración
    const formattedQuery = mysqlConnection.format(insertQuery, queryParams);
    console.log(`Ejecutando consulta: ${formattedQuery}`);

    mysqlConnection.query(insertQuery, queryParams, (err, result) => {
        if (!err) {
            res.json({ status: 'Usuario Guardado', id_status: 1 });
        } else {
            console.log(err);
            res.status(500).json({ status: 'Error al guardar el usuario', id_status: 0 });
        }
    });
});

// Ruta para actualizar un usuario
router.post('/update', (req, res) => {
    const { id, nombre, email, rol, contrasena } = req.body;

    // Validar la entrada del usuario
    if (!id || !validateUserInput(nombre, email, rol, contrasena)) {
        return res.status(400).json({ status: 'Todos los campos son requeridos', id_status: 0 });
    }

    const updateQuery = `UPDATE usuarios SET nombre = ?, email = ?, rol = ?, contrasena = ? WHERE idUsuario = ?`;
    const queryParams = [nombre, email, rol, contrasena, id];

    // Crear una versión de la consulta con los valores insertados para depuración
    const formattedQuery = mysqlConnection.format(updateQuery, queryParams);
    console.log(`Ejecutando consulta: ${formattedQuery}`);

    mysqlConnection.query(updateQuery, queryParams, (err, result) => {
        if (!err) {
            if (result.affectedRows > 0) {
                res.json({ status: 'Usuario Actualizado', id_status: 1 });
            } else {
                res.status(404).json({ status: 'Usuario no encontrado', id_status: 0 });
            }
        } else {
            console.log(err);
            res.status(500).json({ status: 'Error al actualizar el usuario', id_status: 0 });
        }
    });
});

// Ruta para eliminar un usuario
router.post('/delete', (req, res) => {
    const { id } = req.body;

    // Validar que el ID esté presente
    if (!id) {
        return res.status(400).json({ status: 'ID es requerido', id_status: 0 });
    }

    const deleteQuery = `DELETE FROM usuarios WHERE idUsuario = ?`;
    const queryParams = [id];

    // Crear una versión de la consulta con los valores insertados para depuración
    const formattedQuery = mysqlConnection.format(deleteQuery, queryParams);
    console.log(`Ejecutando consulta: ${formattedQuery}`);

    mysqlConnection.query(deleteQuery, queryParams, (err, result) => {
        if (!err) {
            if (result.affectedRows > 0) {
                res.json({ status: 'Usuario Eliminado', id_status: 1 });
            } else {
                res.status(404).json({ status: 'Usuario no encontrado', id_status: 0 });
            }
        } else {
            console.log(err);
            res.status(500).json({ status: 'Error al eliminar el usuario', id_status: 0 });
        }
    });
});

function verifyToken(req,res,next){
   if(!req.headers.authorization) return res.status(401).json('No autorizado');

   const token = req.headers.authorization.substr(7);
   if(token !== ''){
    const content = jwt.verify(token,'stil');
    req.data = content;
    next();
   }else{
    res.status(401).json('Token vacio');
   }
}

// Función para validar que todos los campos estén presentes y no vacíos
function validateUserInput(nombre, email, rol, contrasena) {
    if (!nombre || !email || !rol || !contrasena) {
        return false;
    }
    return true;
}
module.exports = router;