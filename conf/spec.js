// const { browser } = require("protractor");

'use strict'

describe('Prebooks app', function() {
  it('should find jobs', function() {
    browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in');
    browser.driver.findElement(by.css('[placeholder = "PL Number"]')).sendKeys('12357');
    browser.driver.findElement(by.css('[placeholder = "Password"]')).sendKeys('Password1');
    browser.driver.findElement(by.css('[type = "submit"]')).click();
    const execSync = require('child_process').execSync;
    browser.sleep(3000)
    
    const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN10 ',' TN11 ',' TN12 ',
    ' TN15 ', ' TN17 ',' TN18 ',' TN19 ',' TN23 ',' TN24 ',
    ' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ', ' ME4 ', ' ME5 ',
    ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',' ME11 ',' ME12 ',' ME13 ',
    ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',' ME19 ',' ME20 ',' CT1 ',
    ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ', ' BR6 ']

    loop();
    browser.sleep(3000)

    function loop() {
      setInterval(timer, 5000)
    }
    browser.sleep(3000)

    function timer() {
      browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
      let postcode = []
      browser.getPageSource().then(function(pageSource){
      browser.sleep(7000)
        for ( postcode of postcodes) {
          if (pageSource.includes(postcode)) {
            execSync(`espeak ${postcode}`)
          }
        }
      })
    }
  })
}) 
