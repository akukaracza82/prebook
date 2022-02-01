'use strict'
const EC = protractor.ExpectedConditions;

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

  const bannedPostcodes = ['CM', 'IG', 'RM']

  const current_user = accounts.justyna

  it('should find jobs', async function() {
    await browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in#/driver/login')
    await element(by.css('[placeholder = "PL Number"]')).sendKeys(`${current_user.login}`)
    await element(by.css('[placeholder = "Password"]')).sendKeys(`${current_user.password}`)
    await element(by.css('[type = "submit"]')).click()
    await openIfPrebooksLoaded()
    let startTime = performance.now()
    let tabelki = await $$('.table__tbody')

    let jobCount = 0
    let rowCount = tabelki.length
    console.log(rowCount);
    let bestJob = []
    let emptyBookings = 0
    let listOfJobs = []
    let offTimeJobs = 0
    let timeRange = ['00:00', '20:40']
    let minimumDistance = 5


    await scanTables(tabelki, startTime, bestJob, jobCount, emptyBookings, rowCount, listOfJobs, offTimeJobs, timeRange, minimumDistance)
    await browser.sleep(10000)
  })


  function extractPostcode(line) {
    const match = Object.keys(kody).find(key => String(line).toLowerCase().includes(key))
    if (match) {
      return kody[match].toUpperCase()
    } else {
      let code = line.split(',').at(-1).trim()
      return (code.length > 4) ? code.slice(0, -4) : code
    }
  }

  function measureDistance(data) {
    const https = require('https')
    const sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database('../conf/pcs.db');


    return new Promise((resolve) => {
      let url = `https://api.tomtom.com/routing/1/calculateRoute/${Math.round(data[0] * 100) /100}%2C${Math.round(data[1] * 100) /100}%3A${Math.round(data[3] * 100) /100}%2C${Math.round(data[4] * 100) /100}/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM`
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

  async function scanTables(tabelki, startTime, bestJob, jobCount, emptyBookings, rowCount, listOfJobs, offTimeJobs, timeRange, minimumDistance) {
    await tabelki.map(async function(el) {
      let booking = {}
      let job = [el, await el.getText()]
      listOfJobs.push(job)
      let lines = job[1].split('\n')
      // let lines
      // if ((jobLines[0] > `${timeRange[0]}`) && (jobLines[0] < `${timeRange[1]}`)) {
      //   lines = jobLines
      // } else {
      //   return offTimeJobs += 1
      // }
      console.log(lines[1].split(',').at(-1));

      booking.time = lines[0]
      booking.Type = lines[4] === '6 SEATER' ? 'MPV' : 'ST'
      booking.pick = extractPostcode(lines[1])
      booking.drop = extractPostcode(lines[2])
      console.log(booking);

      await fillBooking(booking, bestJob, jobCount, emptyBookings, minimumDistance)
      jobCount += 1
        // console.log(jobCount);
      console.log('jobcount ' + jobCount)
      console.log('empty ' + emptyBookings);
      console.log('offtime ' + offTimeJobs);
      console.log('rowCount ' + rowCount);
      if (jobCount + emptyBookings + offTimeJobs >= rowCount / 2) {
        console.log(bestJob);
        if (bestJob.length > 0) {
          function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
          }
          let postcodeChecker = function(el) {
            Object.values(kody).includes(el) ? getKeyByValue(kody, `${el}`) : el
          }
          let best = await pickAJob(bestJob)
          if (best) {
            // console.log(afternoonJobs)
            let bestJobElement = (listOfJobs.find(el => el[1].includes(`${best.pick}`, postcodeChecker(best.drop))))[0]
            browser.executeScript('arguments[0].scrollIntoView({ block: "center" })', bestJobElement.getWebElement())

            // let jobButton = await bestJobElement.$('.button')
            // await browser.wait(EC.elementToBeClickable(jobButton), 5000)
            // jobButton.click()
            let endTime = performance.now()
            console.log(Math.round(endTime - startTime) + 'ms');

            // await $('.prebook-allocation-confirm__confirm').click()
            // await $('.prebook-another-allocation-confirm__confirm').click()
            await browser.sleep(20000)
          }
        }
      }
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
          resolve(row.dist)
        } else {
          resolve(data)
        }
      })
      db.close()
    })
  }

  async function getDistance(dataFromDbCheck) {
    if (typeof dataFromDbCheck === 'number') {
      return await dataFromDbCheck
    } else {
      return await measureDistance(dataFromDbCheck)
    }
  }

  async function fillBooking(booking, bestJob, jobCount, emptyBookings, minimumDistance) {
    if (booking.pick == booking.drop) {
      emptyBookings += 1
      return
    }
    let kordy = await getCoords(booking.pick, booking.drop)
    let dbChecked = await checkDb(kordy)
    let distance = await getDistance(dbChecked)
      // console.log(booking);
      // console.log(jobCount + 1)
    await filterJobs(distance, booking, bestJob, minimumDistance)
      // console.log(booking);
  }

  async function filterJobs(distance, booking, bestJob, minimumDistance) {
    if (distance > `${minimumDistance}`) {
      booking.dist = parseInt(distance + ' miles')
      await updateBestJob(bestJob, booking)
        // execSync(`espeak -s 140 "${distance} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)
    }
  }

  async function updateBestJob(best, job) {
    if (best.length < 3) {
      await best.push(job)
    } else {
      await best.sort((a, b) => (parseInt(a.dist) > parseInt(b.dist)) ? -1 : 1)
      await parseInt(job.dist) < (parseInt(best[2].dist)) ? best[2] : (best[2] = job)
      await best.sort((a, b) => (parseInt(a.dist) > parseInt(b.dist)) ? -1 : 1)
    }
  }
})

async function pickAJob(job) {
  // console.log(job);
  const londonPostcodes = ['SE', 'CR', 'BR', 'RM', 'IG']
  let picksUpFromLondon = await

  function(job) {
    londonPostcodes.some(code => job.pick.includes(code))
  }
  if (
    (job[0] && !picksUpFromLondon(job[0])) ||
    (job[0].dist > 60 &&
      job[0].dist >= 1.3 * job[1].dist &&
      picksUpFromLondon(job[0]))
  ) {
    console.log(`best job  ${job[0].pick} to ${job[0].drop} - ${job[0].dist} miles`)
    return job[0]
  } else if (
    job[0].dist < 1.3 * job[1].dist &&
    picksUpFromLondon(job[0]) &&
    !picksUpFromLondon(job[1])
  ) {
    console.log(`best job  ${job[1].pick} to ${job[1].drop} ${job[1].dist} miles`)
    return job[1]
  }
}

async function openIfPrebooksLoaded() {
  await browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
  if (await browser.element(by.cssContainingText('.prebook__notifications', 'offered')).isPresent()) {
    await openIfPrebooksLoaded()
  } else {
    await browser.wait(EC.presenceOf($('.prebook__address')), 50000)
  }
}

async function refreshIfNoJobFound() {
  if (bestJob.length == 0) {
    await browser.sleep(10000)
    await openIfPrebooksLoaded()
  }
}