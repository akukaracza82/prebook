'use strict'

const { performance } = require('perf_hooks')

describe('Prebooks app', function() {


  function getName()
  {
    // return new Promise ((resolve) => {
      let  a = browser.executeScript("prompt('whats your name')")
      browser.sleep(5000)
      return a
    // })
  }

  console.log(getName())
  // browser.executeScript("prompt('select time of job')").then(response => console.log(response))
  // browser.sleep(5000)
  // let response = browser.executeScript("var win = this.browserbot.getUserWindow(); return win.promptResponse")
  // browser.sleep(5000)
  // console.log(response);
  
  
  const kody = {
    heathrow: 'tw6',
    gatwick: 'rh6',
    'city airport': 'e16',
    '101 wood lane': 'w12',
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
    
    browser.sleep(25000)
    let loop = setInterval(timer, (15000 + Math.random() * 10000))
       
    function timer() {
    browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
    let today = new Date()
    let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    // browser.sleep(2000)
    console.log(`Jobs at ${currentTime}`);
    browser.getPageSource().then(function(pageSource){
      let jobCount = 0
     browser.wait(EC.presenceOf($('.table__tbody')), 30000)
    let tabelki = browser.element.all(by.css('.table__tbody'))
    let rowCount = 0
    
    
    tabelki.count().then(result => rowCount = result)
      let bestJob = []
      let startTime = performance.now()

      tabelki.map(function(el){
        el.getText().then(function(d){
          jobCount += 1
          let booking = {}
          let lines = d.split('\n')
          let jobsTimeFrame = {}
          jobsTimeFrame.threeTo4 = job.time < '4:00'
          jobsTimeFrame.fourTo5 = job.time > '4:00' && job.time < '5:00'
          jobsTimeFrame.fiveTo530 = job.time > '5:00' && job.time < '5:30'
          jobsTimeFrame.late = job.time > '7:30'
          jobsTimeFrame.lateEveniing = job.time > '18:00'
          let allOtherJobs = lines.filter(job => job.time > '4:00' && job.time < '5:30')
          booking.time = lines[0]
          booking.Type = lines[4] === '6 SEATER' ? 'MPV' : 'ST'
          booking.pick = extractPostcode(lines[1])
          booking.drop = extractPostcode(lines[2])
          booking.dist = lines[3] < 100 ? String(Math.round(lines[3])) : String(Math.round(lines[3] / 1600))
          if ( booking.pick === booking.drop ) 
          { 
            emptyBookings += 1
            return 
          }
          // console.log('liczba rzedow ' + rowCount)
          // console.log('liczba prac ' + jobCount)
          // console.log('liczba pustych prac ' + emptyBookings);
                  
          let endTime = performance.now()
          console.log(Math.round(endTime - startTime) + 'ms');
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
              .then(function (distance ) {
                if (distance > 25) {
                  booking.d = parseInt(distance + ' miles')
                  updateBestJob(bestJob, booking)
                  booking.d > 50 ? ( execSync(`espeak -s 140 "${distance} miles from ${booking.pick} to ${booking.drop} at ${booking.time}"`) ) : booking.d
                  browser.sleep(1000)
                }
                if (jobCount == rowCount ) {
                  console.log(bestJob)
                  let found = element(by.cssContainingText('.prebook__address',`${bestJob[0].pick}`))
                  browser.executeScript('arguments[0].scrollIntoView({ block: "center" })', found.getWebElement())   
                  browser.actions().mouseMove(found).mouseMove({x: 500, y: 0}).click().perform()
                  
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
    browser.sleep(25000)
  })
  } //closing curly for timer
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
      return ( code.length > 3 ) ? code.slice(0, -4) : code
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

function updateBestJob(best, job) {
  if ( best.length < 3 ) {
    best.push(job)
  } else {
    best.sort((a, b) => (parseInt(a.d) > parseInt(b.d)) ? -1 : 1 )
    parseInt(job.d) < parseInt(best[2].d) ? best[2] : (best[2] = job )
    best.sort((a, b) => (parseInt(a.d) > parseInt(b.d)) ? -1 : 1 )
  }
}
})

function pickAJob(bestJobs) {
  let picksUpFromLondon = function(job) {
    londonPostcodes.some(code => job.pick.substr(0, 2).include(code))
  }
  bestJobs.map(function(job) {  
    if (
      ( job[0] && !picksUpFromLondon(job[0])) ||     
      ( job[0].d > 60 && job[0].d >= 1.3*job[1].d && picksUpFromLondon(job[0]))
      ) { return job[0]}
    else if ( job[0].d < 1.3*job[1] && picksUpFromLondon(job[0]) && !picksUpFromLondon(job[1])) { 
      return job[1] 
    }
  }) 
  // element.all(by.cssContainingText('.table__tbody', 'SS3')).filter(function(elem) {
  //   return elem.getText().then(function(text){
  //     return text === 'Allocate'
  //   })
  // }).first().click()
  // .mouseMove({x: 500, y: 0}).
  
    // tabelki.getText().then(function(result) {
    //   return new Promise ((resolve) => {
    //   let job = result.find(tab => tab.includes('SE25' && 'CR9'))
    //   console.log(job);
    //   resolve(job)
    //   }).then(job => 
    // })
  
    // let job
  
    // tabelki.map(function(el){
    //   if (el.getText().then(res =>.includes('SE25' && 'CR9')) {
    //     job = el
    //   }
    // })
    // console.log(job);
    // job.element(by.css('[type = "button"]')).click()
}