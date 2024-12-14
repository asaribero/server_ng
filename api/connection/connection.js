const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: '172.179.241.129',
    user: 'projects',
    password: 'projects2024',
    database: 'project_cide',
})

mysqlConnection.connect( err => {
    if(err){
        console.log('Error en la bd',err)
        return
    }else{
        console.log('ok connection')
    }
});

module.exports = mysqlConnection;