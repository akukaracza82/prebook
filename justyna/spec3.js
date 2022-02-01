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

  // const bannedPostcodes = ['CM', 'IG', 'RM']

  const current_user = accounts.artur

  it('should find jobs', async function() {
    await browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in#/driver/login')
    await element(by.css('[placeholder = "PL Number"]')).sendKeys(`${current_user.login}`)
    await element(by.css('[placeholder = "Password"]')).sendKeys(`${current_user.password}`)
    await element(by.css('[type = "submit"]')).click()
    await openIfPrebooksLoaded()
    let startTime = performance.now()
    let tabelki = await $$('.table__tbody')

    let rowCount = tabelki.length
    console.log(rowCount);
    let bestJobs = []
    let timeRange = ['06:00', '09:40']
    let minimumDistance = 5
    let bookings = []
    let qualifyingBookings = []
    let listOfJobs = []

    await createListOfJobs(tabelki, timeRange)
    console.log(listOfJobs);
    // await createABooking(listOfJobs, bookings)
    // await calculateBookingDistance(bookings)
    // await filterJobs(bookings, minimumDistance)
    // await createListOf3Jobs(qualifyingBookings, bestJobs)
    // await pickAJob(bestJobs)
    // await extractBestJobWebElement(bestJob, objectKody)
    await browser.sleep(10000)
  })

  async function openIfPrebooksLoaded() {
    await browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
    if (await browser.element(by.cssContainingText('.prebook__notifications', 'offered')).isPresent()) {
      await openIfPrebooksLoaded()
    } else {
      await browser.wait(EC.presenceOf($('.prebook__address')), 50000)
    }
  }

  function createListOfJobs(tabelki, timeRange) {
    Promise.all(tabelki.map(async function(el) {
      let job = [el, await el.getText()]
      let jobLines = job[1].split('\n')

      console.log((jobLines[0] > `${timeRange[0]}`) && (jobLines[0] < `${timeRange[1]}`));
      if ((jobLines[0] > `${timeRange[0]}`) && (jobLines[0] < `${timeRange[1]}`)) {
        browser.sleep(50)

        await listOfJobs.push(job)
      }
    }))
  }
})


//   function extractPostcode(line) {
//     const match = Object.keys(kody).find(key => String(line).toLowerCase().includes(key))
//     if (match) {
//       return kody[match].toUpperCase()
//     } else {
//       let code = line.split(',').at(-1).trim()
//       return (code.length > 4) ? code.slice(0, -4) : code
//     }
//   }

//   async function createABooking(listOfJobs, bookings) {
//     await listOfJobs.map(async function(el) {
//       console.log(el[1]);
//       let booking = {}
//       booking.time = el[1][0]
//       booking.Type = el[1][4] === '6 SEATER' ? 'MPV' : 'ST'
//       booking.pick = extractPostcode(el[1][1])
//       booking.drop = extractPostcode(el[1][2])
//       await bookings.push(booking)
//       console.log(bookings);
//     })
//   }


//   function measureDistance(data) {
//     const https = require('https')
//     const sqlite3 = require("sqlite3").verbose();
//     let db = new sqlite3.Database('../conf/pcs.db');


//     return new Promise((resolve) => {
//       let url = `https://api.tomtom.com/routing/1/calculateRoute/${Math.round(data[0] * 100) /100}%2C${Math.round(data[1] * 100) /100}%3A${Math.round(data[3] * 100) /100}%2C${Math.round(data[4] * 100) /100}/json?routeType=shortest&avoid=unpavedRoads&key=uwbU08nKLNQTyNrOrrQs5SsRXtdm4CXM`
//       https.get(url, res => {
//         let body = '';

//         res.on('data', chunk => {
//           body += chunk;
//         });

//         res.on("end", () => {

//           try {
//             let json = JSON.parse(body);
//             let distanceInMiles = Math.round(json.routes[0].summary.lengthInMeters / 1600);
//             db.run(`INSERT INTO distances (up, off, dist) VALUES ("${data[2]}", "${data[5]}", "${Math.round(distanceInMiles)}")`)
//             resolve(distanceInMiles)
//           } catch (error) {
//             console.error(error.message);
//           };
//         }).on("error", (error) => {
//           console.error(error.message);
//         });
//       })

//     })
//   }

//   async function getDistance(dataFromDbCheck) {
//     if (typeof dataFromDbCheck === 'number') {
//       return await dataFromDbCheck
//     } else {
//       return await measureDistance(dataFromDbCheck)
//     }
//   }

//   function getCoords(postcode1, postcode2) {
//     const sqlite3 = require("sqlite3").verbose();
//     return new Promise((resolve) => {
//       let db = new sqlite3.Database('../conf/pcs.db');
//       let sql = `SELECT code, long, lat FROM outs WHERE code="${postcode1}" OR code="${postcode2}"`

//       db.all(sql, [], (err, rows) => {
//         let innerCoords = []
//         rows.forEach(row => innerCoords.push(parseFloat(row.lat), parseFloat(row.long), row.code))
//         resolve(innerCoords);
//       });
//       db.close();
//     })
//   }

//   function checkDb(data) {
//     return new Promise((resolve) => {
//       const sqlite3 = require("sqlite3").verbose();
//       let db = new sqlite3.Database('../conf/pcs.db');
//       let sql = `SELECT dist FROM distances WHERE 
//           (up ="${data[2]}" AND off="${data[5]}") OR 
//           (up ="${data[5]}" AND off="${data[2]}")`
//       db.get(sql, [], (error, row) => {
//         if (row) {
//           resolve(row.dist)
//         } else {
//           resolve(data)
//         }
//       })
//       db.close()
//     })
//   }

//   async function calculateBookingDistance(bookings) {
//     await bookings.map(async function(el) {

//       if (el.pick == el.drop) {
//         emptyBookings += 1
//         return
//       }
//       let kordy = await getCoords(el.pick, el.drop)
//       let dbChecked = await checkDb(kordy)
//       let distance = await getDistance(dbChecked)
//       el.dist = distance
//     })
//   }

//   async function filterJobs(bookings, minimumDistance) {
//     await bookings.map(async function(el) {
//       if (el.dist > `${minimumDistance}`) {
//         qualifyingBookings.push(el)
//       }
//     })
//   }

//   async function createListOf3Jobs(qualifyingBookings, bestJobs) {
//     await qualifyingBookings.map(async function(el) {
//       if (bestJobs.length < 3) {
//         await bestJobs.push(el)
//       } else {
//         await bestJobs.sort((a, b) => (parseInt(a.dist) > parseInt(b.dist)) ? -1 : 1)
//         await parseInt(el.dist) < (parseInt(bestJobs[2].dist)) ? bestJobs[2] : (bestJobs[2] = el)
//         await bestJobs.sort((a, b) => (parseInt(a.dist) > parseInt(b.dist)) ? -1 : 1)
//       }
//     })
//   }

//   async function pickAJob(bestJobs) {
//     // console.log(job);
//     const londonPostcodes = ['SE', 'CR', 'BR', 'RM', 'IG']
//     let picksUpFromLondon = await

//     function(job) {
//       londonPostcodes.some(code => job.pick.includes(code))
//     }
//     if (
//       (bestJobs[0] && !picksUpFromLondon(bestJobs[0])) ||
//       (bestJobs[0].dist > 60 &&
//         bestJobs[0].dist >= 1.3 * bestJobs[1].dist &&
//         picksUpFromLondon(bestJobs[0]))
//     ) {
//       console.log(`best job  ${bestJobs[0].pick} to ${bestJobs[0].drop} - ${bestJobs[0].dist} miles`)
//       return bestJobs[0]
//     } else if (
//       bestJobs[0].dist < 1.3 * bestJobs[1].dist &&
//       picksUpFromLondon(bestJobs[0]) &&
//       !picksUpFromLondon(bestJobs[1])
//     ) {
//       console.log(`best job  ${bestJobs[1].pick} to ${bestJobs[1].drop} ${bestJobs[1].dist} miles`)
//       return bestJobs[1]
//     }
//   }

//   async function extractBestJobWebElement(bestJob, objectKody) {
//     if (bestJob.length > 0) {
//       let getKeyByValue = function(object, value) {
//         return Object.keys(object).find(key => object[key] === value);
//       }
//       let postcodeChecker = function(el) {
//         Object.values(objectKody).includes(el) ? getKeyByValue(objectKody, `${el}`) : el
//       }
//       let best = await pickAJob(bestJobs)
//       if (best) {
//         console.log(best);
//         // console.log(afternoonJobs)
//         let bestJobElement = (listOfJobs.find(el => el[1].includes(`${best.pick}`, postcodeChecker(best.drop))))[0]
//         browser.executeScript('arguments[0].scrollIntoView({ block: "center" })', bestJobElement.getWebElement())
//           // let jobButton = await bestJobElement.$('.button')
//           // await browser.wait(EC.elementToBeClickable(jobButton), 5000)
//           // jobButton.click()
//         let endTime = performance.now()
//         console.log(Math.round(endTime - startTime) + 'ms');

//         // await $('.prebook-allocation-confirm__confirm').click()
//         // await $('.prebook-another-allocation-confirm__confirm').click()
//         await browser.sleep(20000)
//       }
//     }
//   }
// })



// async function refreshIfNoJobFound() {
//   if (bestJob.length == 0) {
//     await browser.sleep(10000)
//     await openIfPrebooksLoaded()
//   }
// }
// // execSync(`espeak -s 140 "${distance} miles from ${booking[0]} to ${booking[1]} at ${booking[2]}"`)