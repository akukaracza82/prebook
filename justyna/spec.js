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

  const londonPostcodes = ['SE', 'CR', 'BR']
  const bannedPostcodes = ['CM', 'IG', 'RM']

  const current_user = accounts.justyna

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
    browser.wait(EC.presenceOf($('.desktop')), 5000)
    browser.sleep(1000)
    
    browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
    browser.wait(EC.presenceOf($('.table__tbody')), 30000)
    let today = new Date()
    let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    // browser.sleep(2000)
    browser.getPageSource().then(function(pageSource){
      let tabelki = browser.element.all(by.css('.table__tbody'))
      let rowCount = 0
      let identicalJobCount = 0
      tabelki.count().then(result => rowCount = result)
      // document.querySelectorAll('#main-div .table__tbody').length
      let jobs = []
      let bestJob = []
      let startTime = performance.now()

      tabelki.map(function(el){
        
        el.getText().then(function(d){
          let booking = {}
          let lines = d.split('\n')
          booking.time = lines[0]
          booking.Type = lines[4] === '6 SEATER' ? 'MPV' : 'ST'
          booking.pick = extractPostcode(lines[1])
          booking.drop = extractPostcode(lines[2])
          // console.log(`identical job count ${identicalJobCount}`);
          
          jobs.push(booking)
          if ( booking.pick === booking.drop ) { return }
          console.log(booking);
          function fillBooking(booking) {
            getCoords(booking.pick, booking.drop)
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
                // return new Promise((resolve) => {
                console.log(jobs.length + 'jobs');
                console.log(rowCount);
                if (distance > 3) {
                  booking.dist = parseInt(distance + ' miles')
                  updateBestJob(bestJob, booking)
                  console.log(booking);
                  // execSync(`espeak -s 140 "${distance} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)
                  let endTime = performance.now()
                  console.log(Math.round(endTime - startTime) + 'ms');
                  console.log(bestJob);
                  // jobs.length > 40 ? console.log(jobs) : console.log();
                  browser.sleep(1000)
                }
              // })
              })
            })
          }
          fillBooking(booking)
          browser.sleep(100)
        })
      })
    })
  })
  
  
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
    const https = require('https')
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('../conf/pcs.db');
    
    
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
      let db = new sqlite3.Database('../conf/pcs.db');
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
      let db = new sqlite3.Database('../conf/pcs.db');
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

  function updateBestJob(best, job) {
    if ( best.length < 3 ) {
      best.push(job)
    } else {
      best.sort((a, b) => (parseInt(a.distance) > parseInt(b.distance)) ? -1 : 1 )
      parseInt(job.distance) < parseInt(best[2].distance) ? best[2] : (best[2] = job )
      best.sort((a, b) => (parseInt(a.distance) > parseInt(b.distance)) ? -1 : 1 )
    }
  }
})

// function checkIfAnyJobsExist(sourceCode, postcodes) {
//   return postcodes.some(postcode => sourceCode.includes(postcode))
// }

function pickAJob(bestJobs) {
  let picksUpFromLondon = function(job) {
    londonPostcodes.some(code => job.pick.substr(0, 2).include(code))
  }
  bestJobs.map(function(job) {  
    if (
      ( job[0] && !picksUpFromLondon(job[0])) ||     
      ( job[0].distance > 60 && job[0].distance >= 1.3*job[1].distance && picksUpFromLondon(job[0]))
      ) { return job[0]}
    else if ( job[0].distance < 1.3*job[1] && picksUpFromLondon(job[0]) && !picksUpFromLondon(job[1])) { 
      return job[1] 
    }
  }) 
}