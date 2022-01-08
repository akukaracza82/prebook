const papa = require('papaparse');
	const fs = require('fs');
	const file = fs.readFileSync('/home/artur/Documents/test.csv', 'utf8');

	papa.parse(file, {
		complete: (result) =>{
			console.log("@@@@@ Complete CSV file : "+result.data)
			console.log("###### row: "+result.data[0])
			console.log("****** value in a row: "+result.data[0][2])
            console.log("");

		}
	});