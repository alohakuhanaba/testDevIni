// load the things needed
const serverConn = require('tedious').Connection;
const database = require('../config/database');
const request = require('tedious').Request;


const query = (sql, callback) => {

    let conn = new serverConn(database);

    conn.connect((err) => {
        if (err) return callback(err);

        const req = new request(sql, (err, rowCount, rows) => {
            conn.close();

          if (err) return callback(err);

          callback(null, {rowCount, rows});
        });

        conn.execSql(req);
    });
};

module.exports = query;