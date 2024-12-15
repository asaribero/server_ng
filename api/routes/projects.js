const express = require('express');
const router = express.Router();
const mysqlConnection = require('../connection/connection');
const jwt = require('jsonwebtoken');
const name_table = 'proyectosdegrado';
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

router.use(fileUpload());

router.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No se han cargado archivos.');
    }

    // 'file' es el nombre del campo en el formulario de carga
    let uploadedFile = req.files.file;
    console.log(uploadedFile)
    // Crea la ruta si no existe
    const uploadPath = path.join(__dirname, '/uploads/');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Usa el nombre de archivo original, o cambialo como necesites
    uploadedFile.mv(`${uploadPath}${uploadedFile.name}`, function (err) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json({ 
            message: 'Archivo subido a ' + uploadPath + uploadedFile.name,
            pathOuput:uploadPath + uploadedFile.name,
            nameDocument:uploadedFile.name
         });
    });
});

router.get('/all', (req, res) => {
    mysqlConnection.query(`SELECT pg.*,asi.idAsignacion,c.nombre nombre_categoria,ea.nombreEstado nombre_estado FROM ${name_table} pg 
                            LEFT JOIN asignaciones asi ON pg.idProyecto = asi.idProyecto
                            LEFT JOIN estadosasignacion ea ON ea.idEstado = pg.estado
                            LEFT JOIN categorias c ON c.idCategoria = pg.idCategoria
                            `, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err)
        }
    })
});

router.post('/save', (req, res) => {
    const { titulo, resumen, estado, fechaInicio, fechaFin, idCategoria } = req.body;
    const insertQuery = `INSERT INTO ${name_table} (titulo, resumen, estado, fechaInicio, fechaFin, idCategoria) VALUES (?, ?, ?, ?, ?, ?)`;
    mysqlConnection.query(insertQuery, [titulo, resumen, estado, fechaInicio, fechaFin, idCategoria], (err, rows, fields) => {
        if (!err) {
            res.json({ status: 'Proyecto Guardado', id_status: 1 });
        } else {
            console.log(err)
            res.status(500).json({ status: 'Error al guardar el proyecto', id_status: 0 });
        }
    })
});

// Ruta para actualizar un proyecto existente
router.put('/update/:idProyecto', (req, res) => {
    const { idProyecto } = req.params; // Capturar el ID del proyecto desde la URL
    const { titulo, resumen, estado, fechaInicio, fechaFin, idCategoria } = req.body;

    // Validar la entrada del proyecto
    if (!titulo || !resumen || !fechaInicio || !fechaFin || !idCategoria) {
        return res.status(400).json({ status: 'Todos los campos son requeridos', id_status: 0 });
    }

    const updateQuery = `
        UPDATE ${name_table} 
        SET titulo = ?, resumen = ?, fechaInicio = ?, fechaFin = ?, idCategoria = ? 
        WHERE idProyecto = ?
    `;
    const queryParams = [titulo, resumen, fechaInicio, fechaFin, idCategoria, idProyecto];

    // Ejecutar la consulta SQL
    mysqlConnection.query(updateQuery, queryParams, (err, result) => {
        if (!err) {
            if (result.affectedRows > 0) {
                res.json({ status: 'Proyecto actualizado correctamente', id_status: 1 });
            } else {
                res.status(404).json({ status: 'Proyecto no encontrado', id_status: 0 });
            }
        } else {
            console.error(err);
            res.status(500).json({ status: 'Error al actualizar el proyecto', id_status: 0 });
        }
    });
});

router.delete('/delete/:idProyecto', (req, res) => {
    const { idProyecto } = req.params;

    const deleteQuery = `DELETE FROM ${name_table} WHERE idProyecto = ?`;

    mysqlConnection.query(deleteQuery, [idProyecto], (err, result) => {
        if (!err) {
            if (result.affectedRows > 0) {
                res.json({ status: 'Proyecto eliminado correctamente', id_status: 1 });
            } else {
                res.status(404).json({ status: 'Proyecto no encontrado', id_status: 0 });
            }
        } else {
            console.error(err);
            res.status(500).json({ status: 'Error al eliminar el proyecto', id_status: 0 });
        }
    });
});

router.get('/getProject/:idProyecto', (req, res) => {
    const { idProyecto } = req.params;
    const insertQuery = `select * from ${name_table} where idProyecto=${idProyecto}`;
    mysqlConnection.query(insertQuery, (err, rows, fields) => {
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
                res.status(404).json({ error: 'Proyecto no encontrado' });
            }
        } else {
            console.log(err);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    });
});

router.post('/saveAssing', (req, res) => {
    const { idUsuario, idProyecto, rol } = req.body;
    const insertQuery = `INSERT INTO asignaciones (idUsuario, idProyecto, rol) VALUES (?, ?, ?)`;
    mysqlConnection.query(insertQuery, [idUsuario, idProyecto, rol], (err, rows, fields) => {
        if (!err) {
            res.json({ status: 'Guardado correctamente ...', id_status: 1 });
        } else {
            console.log(err)
            res.status(500).json({ status: 'Error al guardar', id_status: 0 });
        }
    })
});

router.post('/getAssignProject', (req, res) => {
    const { idProyecto } = req.body;
    const insertQuery = `SELECT asi.*,pg.*,c.nombre as nombre_categoria,u.nombre as nombre_docente,es.nombreEstado as nombre_estado FROM asignaciones asi 
    LEFT JOIN proyectosdegrado pg ON pg.idProyecto = asi.idProyecto 
    LEFT JOIN categorias c ON pg.idCategoria = c.idCategoria 
    LEFT JOIN usuarios u ON asi.idUsuario = u.idUsuario 
    LEFT JOIN estadosasignacion es ON pg.estado = es.idEstado where pg.idProyecto=?`;
    mysqlConnection.query(insertQuery,
        [idProyecto],
        (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    res.json(rows[0]);
                } else {
                    res.json('No se encontro información requerida');
                }
            } else {
                console.log(err)
            }
        })
});

router.post('/getDocumentsProject', (req, res) => {
    const { idProyecto } = req.body;
    const insertQuery = `SELECT * FROM documentos doc 
    LEFT JOIN proyectosdegrado pg ON pg.idProyecto = doc.idProyecto 
    where pg.idProyecto=?`;
    mysqlConnection.query(insertQuery,
        [idProyecto],
        (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    res.json(rows);
                } else {
                    res.json('No se encontro información requerida');
                }
            } else {
                console.log(err)
            }
        })
});

router.post('/saveDocumentProject', (req, res) => {
    const { idProyecto, nombreArchivo, tipo,tamano,rutaArchivo } = req.body;
    const insertQuery = `INSERT INTO documentos (idProyecto, nombreArchivo, tipo, tamano, rutaArchivo) VALUES (?, ?, ?, ?, ?)`;
    mysqlConnection.query(insertQuery, [idProyecto, nombreArchivo, tipo,tamano,rutaArchivo], (err, rows, fields) => {
        if (!err) {
            res.json({ status: 'Guardado correctamente ...', id_status: 1 });
        } else {
            console.log(err)
            res.status(500).json({ status: 'Error al guardar', id_status: 0 });
        }
    })
});

router.post('/getRevisionesDocumento', (req, res) => {
    const { idDocumento } = req.body;
    const insertQuery = `SELECT * FROM revisiones WHERE idDocumento =?`;
    mysqlConnection.query(insertQuery,
        [idDocumento],
        (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    res.json(rows);
                } else {
                    res.json('No se encontro información requerida');
                }
            } else {
                console.log(err)
            }
        })
});


router.post('/saveComentarioDocumento', (req, res) => {
    const { idDocumento, idRevisor, fechaRevision,comentarios} = req.body;
    const insertQuery = `INSERT INTO revisiones(idDocumento, idRevisor, fechaRevision, comentarios) VALUES (?, ?, ?, ?)`;
    mysqlConnection.query(insertQuery, [idDocumento, idRevisor, fechaRevision,comentarios], (err, rows, fields) => {
        if (!err) {
            res.json({ status: 'Guardado correctamente ...', id_status: 1 });
        } else {
            console.log(err)
            res.status(500).json({ status: 'Error al guardar', id_status: 0 });
        }
    })
});

router.get('/download/:fileName', (req, res) => {
    const { fileName } = req.params; // Captura el nombre del archivo desde la URL
    const uploadPath = path.join(__dirname, '/uploads/', fileName); // Ruta completa del archivo

    // Verifica si el archivo existe
    if (fs.existsSync(uploadPath)) {
        res.download(uploadPath, fileName, (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                res.status(500).json({ status: 'Error al descargar el archivo', id_status: 0 });
            }
        });
    } else {
        res.status(404).json({ status: 'Archivo no encontrado', id_status: 0 });
    }
});

router.get('/preview/:fileName', (req, res) => {
    const { fileName } = req.params; // Captura el nombre del archivo desde la URL
    const filePath = path.join(__dirname, '/uploads/', fileName); // Ruta completa al archivo

    // Verifica si el archivo existe
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath); // Envía el archivo al navegador
    } else {
        res.status(404).json({ status: 'Archivo no encontrado', id_status: 0 });
    }
});

module.exports = router;
