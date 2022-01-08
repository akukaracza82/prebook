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
    
    browser.sleep(9000)
    setInterval(timer, 9000)
   
    
    function timer() {
      console.log('a')
      browser.sleep(10000)
    }
    })
  })