
'use strict';
const sqlite3 = require('sqlite3').verbose()

const getCoords = async function (postcode) {
  let db = new sqlite3.Database('./pcs.db');
  let sql = `SELECT long, lat FROM postcodes WHERE code='${postcode}'`;

  db.each(sql, [], (err, row) => {
    if (err) {
      throw err;
    }
  return await row;
});
  
  // close the database connection
  db.close();
  }

  getCoords('ME15 6')






