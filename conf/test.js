'use strict'
const sqlite3 = require('sqlite3').verbose()
const https = require('https')

const getCoords = function (postcode1, postcode2) {
  return new Promise((resolve, reject) => {

    let db = new sqlite3.Database('./pcs.db');
    let sql = `SELECT long, lat FROM postcodes WHERE code='${postcode1}' OR code='${postcode2}'`;
    
    db.all(sql, [], (err, rows) => {
      let innerCoords = []
      rows.forEach(row => innerCoords.push(parseFloat(row.lata), parseFloat(row.long)))
      // console.log(innerCoords);
      resolve(innerCoords);
      reject(postcode1);
    });
    
    // close the database connection
    db.close();
  })
}



getCoords('ME15 6', 'SM4 4').catch(console.log).then(console.log)