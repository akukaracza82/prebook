function checkDb(data) {
  const sqlite3 = require("sqlite3").verbose();
  let db = new sqlite3.Database('./pcs.db');
  let sql = `SELECT distance FROM prebookCodes WHERE lat=${data[0].toString().substr(0, 5).trim()} AND long=${data[1].toString().substr(0, 5).trim()}`

  db.get(sql, [], (error, row) => {
    if (row) {
      console.log(row.distance);
       return (row.distance)
    }
  })
  db.close()
}


a = [ 51.396911, -0.077483, 51.129205, -0.019132 ]

checkDb(a)
// getCoords(a)
// .then(checkDb(data))
// .catch(function(error) {
//   console.log(error);
//   return (data)
// })
// .then(measureDistance)
// .then(result => (result/1600) > 30 && execSync(`espeak "${booking[0]} to ${booking[1]} ${Math.round(result/1600)} miles"`) )







// function measureDistance(data) {
//   const https = require('https')

//   return new Promise((resolve) => {

//     let url =  `https://api.tomtom.com/routing/1/calculateRoute/${data[0]}%2C${data[1]}%3A${data[2]}%2C${data[3]}/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM`
//     https.get(url, res => {
//       let body = '';

//       res.on('data', chunk => {
//         body += chunk;
//       });
      
//       res.on("end", () => {
//         try {
//           let json = JSON.parse(body);
//           let distanceInMeters = json.routes[0].summary.lengthInMeters;
//           resolve(distanceInMeters)
//         } catch (error) {
//           console.error(error.message);
//         };
//       }).on("error", (error) => {
//         console.error(error.message);
//       });
//     })
//   })
// }


// let sql = `SELECT long, lat FROM postcodes WHERE code='${postcode1}' OR code='${postcode2}'`;
