const express = require('express');
const router = express.Router();
const mysqlConnection = require('../connection/connection');
const jwt = require('jsonwebtoken');

router.get('/all',(req,res)=>{
    mysqlConnection.query("select * from categorias", (err,rows,fields) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err)
        }
    })
});

module.exports = router;
