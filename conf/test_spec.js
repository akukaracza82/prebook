'use strict'

const { performance } = require('perf_hooks')

describe('Prebooks app', function() {

  it('should find jobs', function() {
    browser.ignoreSynchronization=true
    browser.sleep(1000)
    browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[placeholder = "PL Number"]')).sendKeys('27489');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[placeholder = "Password"]')).sendKeys('Tinusia11');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[type = "submit"]')).click();
    const execSync = require('child_process').execSync;
    browser.sleep(1000)

    let kody = {
      'heathrow': 'tw6',
      'city': 'e16',
      'gatwick': 'rh6',
      '101 wood lane': 'w12'
      }
    
    const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN9 ', ' TN10 ', ' TN11 ', ' TN12 ', ' TN14 ',  ' TN15 ',' TN17 ',' TN18 ',' TN19 ',' TN23 ',' TN24 ',
    ' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ', ' ME4 ', ' ME5 ', ' BR6 ',
    ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',' ME11 ',' ME12 ',' ME13 ',
    ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',' ME19 ',' ME20 ',' CT1 ',  
    ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ', ' RH7 ', ' RH19 ', ' RH1 ', ' RH2 ', ' RH6 ', ' RH8 ', ' BN8 ', ' TN16 ', ' BR5 ', ' BR3 ', ' IG11 ', ' TN8 ']
    
    let checkIfAnyJobsExist = function(sourceCode, postcodes) {
      return postcodes.some(postcode => sourceCode.includes(postcode))
    }
    // browser.sleep(70000)
    // let loop = setInterval(timer, (60000 + Math.random() * 10000))
   

    // function timer() {
      console.log('timer started #29');
      browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
      // console.log('page loaded #31');
      let today = new Date()
      let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
      browser.sleep(2000)
      browser.getPageSource().then(function(pageSource){
        console.log(`jobs at ${currentTime}`);
        
          if (checkIfAnyJobsExist(pageSource, postcodes)) {
            let tabelki = browser.element.all(by.css('.table__tbody'))
            // browser.sleep(1000)
            // let eldo = browser.driver.findElement(by.cssContainingText ('[placeholder = "PL Number"]')).sendKeys('27489');
            
            let startTime = performance.now()
            tabelki.map(function(el){
              el.getText().then(function(d){
                for( let postcode of postcodes) {
                if (d.includes(`${postcode}`)) {
                  let time = lines[0]
                  let lines = d.split('\n')
                  let pickup = lines[1]
                    if (Object.keys(kody).some((key) => pickup.toLowerCase().includes(key))) {
<<<<<<< Updated upstream
                      Object.keys(kody).map(function(kod) {
                        if(lines[1].includes(kod)) {
                          pickup = kody[kod]
                        } else {
                      dropoff = lines[1].split(',').at(-1).trim().slice(0, -4)
                    } 

                    

                    let dropoff = lines[2]
                    if (Object.keys(kody).some((key) => dropoff.toLowerCase().includes(key))) {
                      Object.keys(kody).map(function(kod) {
                        if(lines[2].includes(kod)) {
                          dropoff = kody[kod]
                        } else {
=======
                      pickup = Object.values(kody)
                    } else {
                      pickup = lines[1].split(',').at(-1).trim().slice(0, -4)
                    } 

                    let dropoff = lines[2]
                    if (Object.keys(kody).some((key) => dropoff.toLowerCase().includes(key) && console.log(key.constructor))) {
                      dropoff = Object.values(kody)
                    } else {
>>>>>>> Stashed changes
                      dropoff = lines[1].split(',').at(-1).trim().slice(0, -4)
                    } 
                    if(pickup === dropoff) { return }
                  })
                  let booking = new Array
                  booking.push(pickup) && booking.push(dropoff) && booking.push(time)
                  // browser.actions().mouseDown(eldo).mouseMove({x: 500, y: 0}).click().perform()
                  ///////////////////////////////////////
                  function fillBooking(booking) {
                    getCoords(booking[0], booking[1])
                    .then(checkDb)
                    .then(function (data) {
                      return new Promise((resolve) => {
                        // console.log("checking data");
                        // console.log(data);
                        if (typeof data === 'number') {
                          // console.log('linijka 65 jesli data to numer');
                          resolve(data)
                        } else {
                          // console.log('to jest else od checking data');
                          // console.log(data);
                          resolve(measureDistance(data))
                          // browser.sleep(2000)
                        }
                      }) 
                      .then(function (distance) {
                        // console.log(result)
                        if (distance > 30) {
                          console.log(distance);
                          console.log(booking);
                          execSync(`espeak -s 140 "${distance} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)
                          let endTime = performance.now()
                          console.log(Math.round((endTime - startTime)/1000) + 'seconds');
                        }
                      })
                    })
                  }
                  //////////////////////////////////////////
                  fillBooking(booking)
                  browser.sleep(2000)
                }
                } // postcodes
              })
            })
          // } 
        }
        browser.sleep(66000)
      })
    // } //closing curly for timer
  })
  function measureDistance(data) {
    // console.log('measureDistance');
    const https = require('https')
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');
    

    return new Promise((resolve) => {
      // console.log('checking tomtom');
      // console.log(data);
      let url =  `https://api.tomtom.com/routing/1/calculateRoute/${data[0]}%2C${data[1]}%3A${data[3]}%2C${data[4]}/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM`
      https.get(url, res => {
        let body = '';
        
        res.on('data', chunk => {
          body += chunk;
        });
        
        res.on("end", () => {
          
          try {
            let json = JSON.parse(body);
            // console.log(json);
            let distanceInMiles = Math.round(json.routes[0].summary.lengthInMeters / 1600);
            // console.log(distanceInMiles);
            db.run(`INSERT INTO distances (up, off, dist) VALUES ("${data[2]}", "${data[5]}", "${Math.round(distanceInMiles)}")`)
            resolve(distanceInMiles)
              } catch (error) {
                console.error(error.message);
              };
            }).on("error", (error) => {
              console.error(error.message);
            });
          })
          
        })
  }

  function getCoords(postcode1, postcode2) {
    // console.log('getCoords');
    const sqlite3 = require("sqlite3").verbose();
    return new Promise((resolve) => {
      
      let db = new sqlite3.Database('./pcs.db');
      let sql = `SELECT code, long, lat FROM outs WHERE code="${postcode1}" OR code="${postcode2}"`
      
      db.all(sql, [], (err, rows) => {
        let innerCoords = []
        rows.forEach(row => innerCoords.push(parseFloat(row.lat), parseFloat(row.long), row.code))
        // console.log(innerCoords);
        resolve(innerCoords);
      });
      
      // close the database connection
      db.close();
    })
  } 
  function checkDb(data) {
    // console.log('checkDb');
    // console.log(data);
    return new Promise((resolve) => {
      // console.log(data);
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');
    let sql = `SELECT dist FROM distances WHERE 
    (up ="${data[2]}" AND 
              off="${data[5]}") OR (up ="${data[5]}" AND 
              off="${data[2]}")`

              db.get(sql, [], (error, row) => {
      // console.log('checking db');
      if (row) {
        // console.log('found a row');
        // console.log(row.Distance);
        resolve (row.dist)
      } else {
        // console.log("didn't find a row")
        // console.log(data);
        resolve(data)
      }
    })
    db.close()
  })
}
})
<<<<<<< Updated upstream

function extractPostcodes(line) { 
  if (Object.keys(kody).some((key) => line.toLowerCase().includes(key))) {
    Object.keys(kody).map(function(kod) {
      if(line.includes(kod)) {
        pickup = kody[kod]
      } else {
          pickup = lines[1].split(',').at(-1).trim().slice(0, -4)
      } 
    }
  }
}                                                  


function extractPostcodes(line) { 
  if ( Object.keys(kody).some((key) => String(line).toLowerCase().includes(key)) ) {
    // Object.keys(kody).map(function(kod) {
    //   if(line.includes(kod)) {
    //     return kody[kod]
    //   } else {
    //     return line.split(',').at(-1).trim().slice(0, -4)
    //   }
    // })
    console.log(true)
  } else {
    console.log(line);
    return line.split(',').at(-1).trim().slice(0, -4)
  }
  } 
// }
=======
>>>>>>> Stashed changes
