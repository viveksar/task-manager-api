//this file is for the sending of email to the users
let mailin=require('mailin')
//require("../mailin.js");
	var client = new Mailin("https://api.sendinblue.com/v2.0","mvUgrhZw4VYqXzDW");
	data = { "to" : 'vivek.s525254@gmail.com',
		"from" : 'vivek.s525254@gmail.com',
		"subject" : "My subject",
		"html" : "This is the <h1>HTML</h1>",
		//"attachment" : ["https://domain.com/path-to-file/filename1.pdf", "https://domain.com/path-to-file/filename2.jpg"]
	}
 
	client.send_email(data).on('complete', function(data) {
		console.log(data);
    });
    

/*
    var sendinblue = require('sendinblue-api');
 
    var parameters = { "apiKey": "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", "timeout": 1000 };	//Optional parameter: Timeout in MS
    var sendinObj = new sendinblue(parameters);
 
    var input = {name:'vivek saroha'};
    sendinObj.get_account(input, function(err, response){
         console.log(response);
    });*/