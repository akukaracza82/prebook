'use strict'

// const { performance } = require('perf_hooks')

describe('Prebooks app', function() {

  it('should find jobs', async function() {
    let b = 'lulu'
    await browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in#/driver/login')
    await element(by.css('[placeholder = "PL Number"]')).sendKeys('12357')
    await element(by.css('[placeholder = "Password"]')).sendKeys('Password1')
    let text = await $('.sign-in__header').getText()
    console.log(text);
    console.log(b);
    await element(by.css('[type = "submit"]')).click();
    await browser.get('https://www.addleedrivers.co.uk/drp/driver/prebook')
    let message = await $('.notifications__notification_warning').getText()
    console.log(message);
    browser.sleep(10000)
  }) 
}) 