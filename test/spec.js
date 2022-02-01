describe('Protractor Demo App', function() {
    it('should have a title', function() {
      browser.get('http://juliemr.github.io/protractor-demo/');
  
      expect(browser.getTitle()).toEqual('Super Calculator');
    });
  });

  describe('Protractor Demo App', function() {
    it('should add one and two', function() {
      browser.get('https://www.addleedrivers.co.uk/drp/driver/sign-in');
      element(by.css('[placeholder = "PL Number"]')).sendKeys('12357');
      element(by.css('[placeholder = "Password"]')).sendKeys('Password1');
      element(by.css('[type = "submit"]')).click();
      browser.sleep(1000)  
      const execSync = require('child_process').execSync;

      const postcodes = [' TN1 ',  ' TN2 ', ' TN3 ', ' TN4 ', ' TN10 ',' TN11 ',' TN12 ',
      ' TN15 ', ' TN17 ',' TN18 ',' TN19 ',' TN23 ',' TN24 ',
      ' TN25 ', ' TN26 ',' TN27 ',' ME1 ', ' ME2 ', ' ME3 ', ' ME4 ', ' ME5 ',
      ' ME6 ',  ' ME7 ', ' ME8 ', ' ME9 ', ' ME10 ',' ME11 ',' ME12 ',' ME13 ',
      ' ME14 ', ' ME15 ',' ME16 ',' ME17 ',' ME18 ',' ME19 ',' ME20 ',' CT1 ',
      ' CT2 ',  ' CT3 ', ' CT4 ', ' CT21 ']
  
      let findings = []
      let result = '';
      let i = 0;
      do {
        i += 1;
        result += i + ' ';
      }
      while (i > 0 && i < 5);
// Despite i == 0 this will still loop as it starts off without the test

console.log(result);
    });
  });