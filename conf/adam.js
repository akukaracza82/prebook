'use strict'

const { performance } = require('perf_hooks')

describe('Prebooks app', function() {
  
  const kody = {
    heathrow: 'tw6',
    gatwick: 'rh6',
    'city airport': 'e16',
    '101 wood lane': 'w12',
  }

  it('should find jobs', function() {
    browser.ignoreSynchronization=true
    browser.sleep(1000)
    browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[placeholder = "PL Number"]')).sendKeys('12747');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[placeholder = "Password"]')).sendKeys('Albert12');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[type = "submit"]')).click();
    const execSync = require('child_process').execSync;
    browser.sleep(1000)
    
    const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN9 ', ' TN10 ',
      ' TN11 ', ' TN12 ', ' TN14 ', ' TN15 ',' TN17 ',' TN18 ',' TN19 ',
      ' TN23 ',' TN24 ',' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ',
      ' ME4 ', ' ME5 ', ' BR6 ', ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',
      ' ME11 ',' ME12 ',' ME13 ', ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',
      ' ME19 ',' ME20 ',' CT1 ', ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ', ' RH7 ',
      ' RH19 ', ' RH1 ', ' RH2 ', ' RH6 ', ' RH8 ', ' BN8 ', ' TN16 ', ' BR5 ',
      ' BR3 ', ' IG11 ', ' TN8 ', ' EC4M ']
    

    // browser.sleep(70000)
    // let loop = setInterval(timer, (60000 + Math.random() * 10000))
   
    
    // function timer() {
      browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
      let today = new Date()
      let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
      browser.sleep(2000)
      browser.getPageSource().then(function(pageSource){
        console.log(`jobs at ${currentTime}`);
        
        browser.sleep(100)
          let tabelki = browser.element.all(by.css('.table__tbody'))
          let startTime = performance.now()
          tabelki.map(function(el){
            el.getText().then(function(d){

                  let lines = d.split('\n')
                  console.log(lines);
                  let time = lines[0]
                  let serviceType = lines[4] === '6 SEATER' ? 'MPV' : 'STANDARD'
                  let pickup = extractPostcode(lines[1])
                  console.log(pickup);
                  let dropoff = extractPostcode(lines[2])
                  console.log(dropoff);
                  if(pickup === dropoff) { return }
                  
                  let booking = new Array
                  booking.push(pickup, dropoff, time, serviceType)
                  console.log(booking);
                  function fillBooking(booking) {
                    getCoords(booking[0], booking[1])
                    .then(checkDb)
                    .then(function (data) {
                      return new Promise((resolve) => {
                        if (typeof data === 'number') {
                          resolve(data)
                        } else {
                          resolve(measureDistance(data))
                        }
                      }) 
                      .then(function (distance) {
                        if (distance > 5) {
                          console.log(booking, distance + ' miles');
                          // execSync(`espeak -s 140 "${distance} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)
                          let endTime = performance.now()
                          console.log(Math.round(endTime - startTime) + 'ms');
                        }
                      })
                    })
                  }
                  fillBooking(booking)
                  browser.sleep(100)
            })
          })
    browser.sleep(66000)
  })
// } //timer
  })
  
  function checkIfAnyJobsExist(sourceCode, postcodes) {
    return postcodes.some(postcode => sourceCode.includes(postcode))
  }
  
  function extractPostcode(line) {
    if (Object.keys(kody).some(key => String(line).toLowerCase().includes(key))) {
      const kodzik = Object.keys(kody).filter(kod => line.toLowerCase().includes(kod))
      return kody[kodzik].toUpperCase()
    } else {
      return line.split(',').at(-1).trim().slice(0, -4)
    }
  }

  function measureDistance(data) {
    const https = require('https')
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');
    
    
    return new Promise((resolve) => {

      let url =  `https://api.tomtom.com/routing/1/calculateRoute/${data[0]}%2C${data[1]}%3A${data[3]}%2C${data[4]}/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM`
      https.get(url, res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        
        res.on("end", () => {
          try {
            let json = JSON.parse(body);
            let distanceInMiles = Math.round(json.routes[0].summary.lengthInMeters / 1600);
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
    const sqlite3 = require("sqlite3").verbose();
    return new Promise((resolve) => {
      let db = new sqlite3.Database('./pcs.db');
      let sql = `SELECT code, long, lat FROM outs WHERE code="${postcode1}" OR code="${postcode2}"`
      db.all(sql, [], (err, rows) => {
        let innerCoords = []
        rows.forEach(row => innerCoords.push(parseFloat(row.lat), parseFloat(row.long), row.code))
        resolve(innerCoords);
      });
      db.close();
    })
  } 
   
  function checkDb(data) {
    return new Promise((resolve) => {
      const sqlite3 = require("sqlite3").verbose();
      let db = new sqlite3.Database('./pcs.db');
      let sql = `SELECT dist FROM distances WHERE 
      (up ="${data[2]}" AND off="${data[5]}") OR 
      (up ="${data[5]}" AND off="${data[2]}")`
      db.get(sql, [], (error, row) => {
        if (row) {
          resolve (row.dist)
        } else {
          resolve(data)
        }
      })
    db.close()
  })
}
})