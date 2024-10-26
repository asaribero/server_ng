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
    mysqlConnection.query(`select pg.*,asi.idAsignacion from ${name_table} pg LEFT JOIN asignaciones asi ON pg.idProyecto = asi.idProyecto`, (err, rows, fields) => {
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

router.post('/getProject', (req, res) => {
    const { idProyecto } = req.body;
    const insertQuery = `select * from ${name_table} where idProyecto=?`;
    mysqlConnection.query(insertQuery,
        [idProyecto],
        (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    res.json(rows[0]);
                } else {
                    res.json('No se encontro el proyecto');
                }
            } else {
                console.log(err)
            }
        })
});

router.post('/saveAssing', (req, res) => {
    const { idUsuario, idProyecto, rol } = req.body;
    const insertQuery = `INSERT INTO asignaciosnes (idUsuario, idProyecto, rol) VALUES (?, ?, ?)`;
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

module.exports = router;
