'use strict'

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
    
    const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN10 ', ' TN11 ', ' TN12 ', ' TN14 ',  ' TN15 ',' TN17 ',' TN18 ',' TN19 ',' TN23 ',' TN24 ',
    ' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ', ' ME4 ', ' ME5 ',
    ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',' ME11 ',' ME12 ',' ME13 ',
    ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',' ME19 ',' ME20 ',' CT1 ',  
    ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ', ' RH7 ', ' RH19 ', ' RH1 ', ' RH2 ', ' RH6 ', ' BN8 ', ' TN16 ', ' DA16 ']
    
    browser.sleep(50000)
    let loop = setInterval(timer, (40000 + Math.random() * 10000))
   
    
    function timer() {
      browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')

      browser.sleep(1000)
      browser.getPageSource().then(function(pageSource){

        browser.sleep(1000)
        for ( let postcode of postcodes) {
          if (pageSource.includes(postcode)) {
            let tabelki = browser.element.all(by.css('.table__tbody'))
            // browser.sleep(1000)
            // let eldo = browser.driver.findElement(by.cssContainingText ('[placeholder = "PL Number"]')).sendKeys('27489');
            
            tabelki.map(function(el){
              el.getText().then(function(d){
                if (d.includes(`${postcode}`)) {
                  let lines = d.split('\n')
                  console.log(lines);
                  let pickup = lines[1].substr(lines[1].length -8, 8)
                  console.log(pickup)
                  let dropoff = lines[2].substr(lines[2].length -8, 8)
                  console.log(dropoff)
                  let booking = new Array
                  // browser.actions().mouseDown(eldo).mouseMove({x: 500, y: 0}).click().perform()
                    function fillBooking() {
                    booking.push(pickup.slice(0, -2).trim()) && booking.push(dropoff.slice(0, -2).trim())
                    console.log(booking);
                    getCoords(booking[0], booking[1]).then(measureDistance).then(result => console.log(Math.round(result/1600)) && execSync(`espeak "lala"`))
                  }
                  fillBooking()
                  browser.sleep(2000)
                }
              })
            })
          } 
          // else if (pageSource.includes("SIGN IN")) {
          //   execSync(`espeak "shutting down"`)
          //   clearInterval(loop)
          // }
        }
    browser.sleep(46000)
      })
    }
  })
  function measureDistance(data) {
    const https = require('https')
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');


    return new Promise((resolve) => {

      let dataCheck = checkDb(data)
      if (dataCheck) {
        resolve(dataCheck)
      } else {
  
      let url =  `https://api.tomtom.com/routing/1/calculateRoute/${data[0]}%2C${data[1]}%3A${data[2]}%2C${data[3]}/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM`
      https.get(url, res => {
        let body = '';
  
        res.on('data', chunk => {
          body += chunk;
        });
        
        res.on("end", () => {
          try {
            let json = JSON.parse(body);
            let distanceInMeters = json.routes[0].summary.lengthInMeters;
            db.run(`INSERT INTO prebookCodes(lat, long, distance) 
                    SELECT * FROM (SELECT ${data[0].toString().substr(0, 4).trim()} AS lat, ${data[1].toString()
                      .substr(0, 3).trim()} AS long, ${distanceInMeters} AS distance) AS temp
                      WHERE NOT EXISTS (
                        SELECT lat FROM prebookCodes WHERE lat = ${data[0].toString().substr(0, 4).trim()} and long = ${data[1].toString()
                          .substr(0, 3).trim()}
                      ) LIMIT 1`)
                      resolve(distanceInMeters)
                    } catch (error) {
                      console.error(error.message);
                    };
                  }).on("error", (error) => {
          console.error(error.message);
        });
      })
    }
    })
  }

  function getCoords(postcode1, postcode2) {
    const sqlite3 = require("sqlite3").verbose();
    return new Promise((resolve) => {
      
      let db = new sqlite3.Database('./pcs.db');
      let sql = `SELECT long, lat FROM postcodes WHERE code='${postcode1}' OR code='${postcode2}'`;
      
      db.all(sql, [], (err, rows) => {
        let innerCoords = []
        rows.forEach(row => innerCoords.push(parseFloat(row.lat), parseFloat(row.long)))
        resolve(innerCoords);
      });
      
      // close the database connection
      db.close();
    })
  } 
  function checkDb(data) {
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');
    let sql = `SELECT distance FROM prebookCodes WHERE lat=${data[0].toString().substr(0, 5).trim()} AND long=${data[1].toString().substr(0, 5).trim()}`

    db.get(sql, [], (error, row) => {
      if (row) {
         return (row.distance)
        }
    })
    db.close()
  }
})

            // browser.actions().doubleClick(element(job)).doubleClick().perform()
            // browser.actions().
            // doubleClick(element(by.cssContainingText('.prebook__address', `${postcode}`))).perform
            // mouseMove({x: 150, y: 0}).
            // doubleClick().
            // perform();
            
    
            //   VALUES(${data[0].toString().substr(0, 5).trim()}, ${data[1].toString()
            //  .substr(0, 5).trim()}, ${distanceInMeters})`)