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
    
    const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN9 ', ' TN10 ', ' TN11 ', ' TN12 ', ' TN14 ',  ' TN15 ',' TN17 ',' TN18 ',' TN19 ',' TN23 ',' TN24 ',
    ' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ', ' ME4 ', ' ME5 ',
    ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',' ME11 ',' ME12 ',' ME13 ',
    ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',' ME19 ',' ME20 ',' CT1 ',  
    ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ', ' RH7 ', ' RH19 ', ' RH1 ', ' RH2 ', ' RH6 ', ' BN8 ', ' TN16 ', ' BR5 ', ' BR3 ']
    
    // browser.sleep(50000)
    // let loop = setInterval(timer, (40000 + Math.random() * 10000))
   
    
    // function timer() {
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
                  let time = lines[0]
                  let pickup = lines[1].split(',').at(-1).trim()
                  let dropoff = lines[2]
                  if (dropoff.toLowerCase().includes('gatwick')) {
                    dropoff = 'RH6 0NP'
                    } else {
                    dropoff = dropoff.split(',').at(-1).trim()
                  }
                  let booking = new Array
                  booking.push(pickup.slice(0, -2).trim()) && booking.push(dropoff.slice(0, -2).trim()) && booking.push(time)
                  console.log(booking);
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
                          }
                        }
                       ) 
                      // .then(function (result) {
                      //   console.log(result)
                      //   if (result > 30) {
                      //     execSync(`espeak "${result} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)
                      //   }
                      // })
                    })
                  }
                  //////////////////////////////////////////
                  fillBooking(booking)
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
    // } //closing curly for timer
  })
  function measureDistance(data) {
    // console.log('measureDistance');
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
            db.run(`INSERT INTO distances (Pick_up, Drop_off, Distance) VALUES ("${data[2]}", "${data[5]}", "${Math.round(distanceInMiles)}")`)
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
      let sql = `SELECT code, long, lat FROM postcodes WHERE code="${postcode1}" OR code="${postcode2}"`
      
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
    return new Promise((resolve) => {
    // console.log(data);
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');
    let sql = `SELECT distance FROM distances WHERE 
              Pick_up ="${data[2]}" AND 
              Drop_off="${data[5]}"`

    db.get(sql, [], (error, row) => {
      // console.log('checking db');
      if (row) {
        // console.log('found a row');
        // console.log(row.Distance);
         resolve (row.Distance)
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
 
        // CREATE TABLE distances (
        //   DistanceID int AUTO_INCREMENT,
        //   Pick_up varchar(255) NOT NULL,
        //   Drop_off varchar(255) NOT NULL,
        //   Distance int NOT NULL,
        //   PRIMARY KEY (DistanceID)
        // );
