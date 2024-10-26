const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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