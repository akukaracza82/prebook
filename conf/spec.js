'use strict'

describe('Prebooks app', function() {

  it('should find jobs', function() {
    browser.ignoreSynchronization=true
    browser.sleep(1000)
    browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in');
    browser.sleep(1000)
    browser.driver.findElement(by.css('[placeholder = "PL Number"]')).sendKeys('27489');
    browser.driver.findElement(by.css('[placeholder = "Password"]')).sendKeys('Tinusia11');
    browser.driver.findElement(by.css('[type = "submit"]')).click();
    const execSync = require('child_process').execSync;
    browser.sleep(1000)
    
    const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN10 ', ' TN11 ', ' TN12 ', ' TN14 ',  ' TN15 ',' TN17 ',' TN18 ',' TN19 ',' TN23 ',' TN24 ',
    ' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ', ' ME4 ', ' ME5 ',
    ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',' ME11 ',' ME12 ',' ME13 ',
    ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',' ME19 ',' ME20 ',' CT1 ',  
    ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ', ' RH7 ', ' RH19 ', ' RH1 ', ' RH2 ', ' RH6 ', ' BN8 ']
    
    browser.sleep(2000)
    setInterval(timer, 7000)
   
    
    function timer() {
      browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
      browser.sleep(2000)
      browser.getPageSource().then(function(pageSource){
        browser.sleep(3000)
        for ( let postcode of postcodes) {
          if (pageSource.includes(postcode)) {
            // const fs = require('fs')
            // const csv = fs.readFileSync('/home/artur/dev-works/addlee/ukpostcodes.csv', 'utf8')
            let tabelki = browser.element.all(by.css('.table__tbody'))
            browser.sleep(2000)
            
            tabelki.map(function(el){
              el.getText().then(function(d){
                if (d.includes(`${postcode}`)) {
                  let lines = d.split('\n')
                  let pickup = lines[1].substr(lines[1].length -8, 8)
                  let dropoff = lines[2].substr(lines[2].length -8, 8)
                  let booking = new Array
                  // browser.actions().mouseDown(eldo).mouseMove({x: 500, y: 0}).click().perform()
                  // browser.actions().mouseDown(eldo).doubleClick().perform()
                  // browser.actions().doubleClick(element(by.cssContainingText('.prebook__address', `${postcode}`))).mouseMove({x: 180, y: -30}).click().perform()
                  function fillBooking() {
                    booking.push(pickup.slice(0, -2).trim()) && booking.push(dropoff.slice(0, -2).trim())
                    getCoords(booking[0], booking[1]).then(measureDistance).then(result => (result/1600) > 30 && execSync(`espeak "${booking[0]} to ${booking[1]} ${Math.round(result/1600)} miles"`) )
                  }
                  fillBooking()
                  // execSync(`espeak "found something"`)
                  browser.sleep(1000)
                }
              })
            })
          } 
        }
    browser.sleep(3000)
      })
    }
  })
  function measureDistance(data) {
    const https = require('https')
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');


    return new Promise((resolve) => {

      checkDb(data)
  
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
                    VALUES(${data[0].toString().substr(0, 5).trim()}, ${data[1].toString()
                   .substr(0, 5).trim()}, ${distanceInMeters})`)
            resolve(distanceInMeters)
          } catch (error) {
            console.error(error.message);
          };
        }).on("error", (error) => {
          console.error(error.message);
        });
      })
    })
  }

  const getCoords = function (postcode1, postcode2) {
    const sqlite3 = require("sqlite3").verbose();
    return new Promise((resolve) => {
  
      let db = new sqlite3.Database('./pcs.db');
      let sql = `SELECT long, lat FROM postcodes WHERE code='${postcode1}' OR code='${postcode2}'`;
      
      db.all(sql, [], (err, rows) => {
        let innerCoords = []
        rows.forEach(row => innerCoords.push(parseFloat(row.lat), parseFloat(row.long)))
        // console.log(innerCoords);
        resolve(innerCoords);
      });
      
      // close the database connection
      db.close();
    })
  } 
  function checkDb(data) {
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('./pcs.db');
    let sql = `SELECT distance FROM ${data[0].toString().substr(0, 5).trim()} WHERE lat='${data[0].toString().substr(0, 5).trim()}' AND long='${data[1].toString().substr(0, 5).trim()}'`

    db.get(sql, [], (row) => {
      if (row) {
         return (row.distance)
      }
    })
    db.close()
  }
})

// const { clearInterval } = require('timers');

//   function get() {
  //   return  window.fetch('https://api.tomtom.com/routing/1/calculateRoute/57.221883%2C-2.273318%3A51.418966%2C-0.752996/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM').fetch('http://example.com/movies.json')
  // .then(response => response.json())
  // .then(data => console.log(data));
  
  // browser.executeScript(get).then(function(data){
    //   console.log(data);
    // })
    
    // job.then(function(el){
            //   el.map(function(ary){
              //     ary.getText().then(function(el){
                //       console.log(el);
            //     })
            //    })
            // })
            // ).then(response => response.json())
            // .then(data => console.log(data));
            // let button = job.map(function(el) {
              //   el.getText().then(function(d){
            //     if (d.includes(`Distance`)) {
              //       return el
            //     }
            //   })
            // })
            // job.getText().then(function(d) {
              //   console.log(d);
              // })
            // browser.actions().doubleClick(element(job)).doubleClick().perform()
            // browser.actions().
            // doubleClick(element(by.cssContainingText('.prebook__address', `${postcode}`))).perform
            // mouseMove({x: 150, y: 0}).
            // doubleClick().
            // perform();
            
            
            // const fs = require('fs')
            // const csv = fs.readFileSync('/home/artur/dev-works/addlee/ukpostcodes.csv', 'utf8')
            // let rows = csv.split(/\r?\n/)
            // let row = row.split(',')[1]
            // const result = rows.find( ({}))
            // // const Papa = require('papaparse')
            // // let parsed = Papa.parse('/home/artur/dev-works/addlee/ukpostcodes.csv')
            // // console.log(parsed.data[0].value);