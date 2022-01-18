'use strict'

const { performance } = require('perf_hooks')

describe('Prebooks app', function() {
  
  const kody = {
    heathrow: 'tw6',
    gatwick: 'rh6',
    'city airport': 'e16'
  }

  const accounts = {
    artur: {
      login: '12357',
      password: 'Password1'
    },
    adam: {
      login: '12747',
      password: 'Albert12'
    },
    justyna: {
      login: '27489',
      password: 'Tinusia11'
    }
  }

  const current_user = accounts.artur

  it('should find jobs', function() {
    browser.ignoreSynchronization=true
    const EC = protractor.ExpectedConditions;
    browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in');
    browser.wait(EC.presenceOf($('[placeholder = "PL Number"]')), 5000)
    browser.sleep(500)
    element(by.css('[placeholder = "PL Number"]')).sendKeys(current_user.login);
    browser.sleep(100)
    element(by.css('[placeholder = "Password"]')).sendKeys(current_user.password);
    browser.sleep(100)
    element(by.css('[type = "submit"]')).click();
    const execSync = require('child_process').execSync;
    // browser.sleep(1000)
    browser.wait(EC.presenceOf($('.desktop')), 5000)
    // browser.sleep(70000)
    // let loop = setInterval(timer, (60000 + Math.random() * 10000))
   
    
    // function timer() {
      browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
      browser.wait(EC.presenceOf($('.table__tbody')), 30000)
      let today = new Date()
      let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
      // browser.sleep(2000)
      browser.getPageSource().then(function(pageSource){
        console.log(`jobs at ${currentTime}`);
        
        // if (checkIfAnyJobsExist(pageSource, postcodes)) {
          let tabelki = browser.element.all(by.css('.table__tbody'))
          let bestJob = [ 'E14', 'E2', '16:00', 'MPV', '3 miles' ]
          let startTime = performance.now()
          tabelki.map(function(el){
            el.getText().then(function(d){
              // for ( let postcode of postcodes) {
                // if (d.includes(`${postcode}`)) {
                  let lines = d.split('\n')
                  let time = lines[0]
                  let serviceType = lines[4] === '6 SEATER' ? 'MPV' : 'STANDARD'
                  let pickup = extractPostcode(lines[1])
                  let dropoff = extractPostcode(lines[2])
                  if(pickup === dropoff) { return }
                  
                  let booking = new Array
                  booking.push(pickup, dropoff, time, serviceType)
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
                        if (distance > 1) {
                          booking.push(distance + ' miles')
                          parseInt(bestJob[4]) > parseInt(booking[4]) ? bestJob : bestJob = booking
                          console.log(booking);
                          // execSync(`espeak -s 140 "${distance} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)
                          let endTime = performance.now()
                          console.log(Math.round(endTime - startTime) + 'ms');
                          console.log(bestJob);
                          browser.sleep(1000)
                        }
                      })
                    })
                  }
                  fillBooking(booking)
                  browser.sleep(100)
                // } // postcodes
              // }//for
            })
          })
     // } 
      // } // checkifExist
      // browser.sleep(66000)

  })
  // } //closing curly for timer
  })
  
  function checkIfAnyJobsExist(sourceCode, postcodes) {
    return postcodes.some(postcode => sourceCode.includes(postcode))
  }
  
  function extractPostcode(line) {
    const match = Object.keys(kody).find(key => String(line).toLowerCase().includes(key))
    if (match) {
      return kody[match].toUpperCase()
    } else {
      let code = line.split(',').at(-1).trim()
      return ( code.length > 4 ) ? code.slice(0, -4) : code
    }
  }

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
      (up ="${data[2]}" AND off="${data[5]}") OR 
      (up ="${data[5]}" AND off="${data[2]}")`
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

// browser.actions().doubleClick(element(job)).doubleClick().perform()
// browser.actions().
// doubleClick(element(by.cssContainingText('.prebook__address', `${postcode}`))).perform
// mouseMove({x: 150, y: 0}).
// doubleClick().
// perform();

//  CREATE TABLE outs (
  //     id int AUTO_INCREMENT,
  //     code varchar(255) NOT NULL,
  //    lat varchar(255) NOT NULL,
  //    long varchar(255) NOT NULL,
  //    PRIMARY KEY (id)
  //  );
  
        // else if (pageSource.includes("SIGN IN")) {
          //   execSync(`espeak "shutting down"`)
          //   clearInterval(loop)
          // browser.sleep(1000)
          // let eldo = browser.driver.findElement(by.cssContainingText ('[placeholder = "PL Number"]')).sendKeys('27489');
          // browser.actions().mouseDown(eldo).mouseMove({x: 500, y: 0}).click().perform()