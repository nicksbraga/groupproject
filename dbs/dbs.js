
var http = require("http");
var qString = require("querystring");
//var mongoClient = require("mongodb").MongoClient;
//this calls the let db={}; and instantiates the db for us
let dbManager = require('./dbManager'); 
//local mongo instance
//var url = "mongodb://127.0.0.1:27017/"
//const client = new mongoClient(url);


//This will take a set of properties that are coming in from a "POST"
//And transform them into a document for inserting into the "activities"
// collection
function docifyActivity(params){
    let doc = { activity: { type: params.activity.toString().toLowerCase() }, weight: Number(params.weight), distance: Number(params.distance), time: Number(params.time), user: params.user};
    return doc;
}

//The same server response from the activity_server lab
//this time it is specifically used for db inserts
function servResp( calories, res){

    if (calories){
     page+='<div id="calories"><h3> Calories Burned: ' + calories + '</h3></div>';
    }
page+='<br><br><a href="./search">Search</a></body></html>';

res.end(page);
}
//This function is for searching. Because we want the page to finish
//generating before it is returned, this function is labeled async
//so that we can "await" the results of fulfillment for processing all items
async function searchResp(result, response){


    if (result){

	page+=`<h2>Activities for ${result.prop}: ${result[result.prop]}</h2>`
	let count = 0;
	//the await must be wrapped in a try/catch in case the promise rejects
	try{
	await result.data.forEach((item) =>{
		let curAct = new tracker(item.activity.type, item.weight, item.distance, item.time);
		page+=`Activity ${++count} ${item.user}: ${item.activity.type}, Distance: ${item.distance} | ${curAct.calculate()} Calories Burned <br>` ;
	    });
	} catch (e){
	    page+=e.message;
	}
    }
page+='<br><br><a href="/insert">home/insert</a></body></html>';
  
response.end(page);
}

http.createServer(
async  (req, res)=>{
    console.log(req.method);
    let baseURL = 'http://' + req.headers.host;
    var urlOBJ = new URL(req.url, baseURL );
    
    if (req.method == "POST"){
	
	var postData = '';
	req.on('data', (data) =>{
		postData+=data;
	    });
	//labeling a  callback as async will allow us to wait for promise
	//fulfillment inside the function
	req.on('end', async ()=>{
		console.log(postData);
		let calories;
		let proceed = true;
		var postParams = qString.parse(postData);
		//handle empty data
		for (property in postParams){
		    if (postParams[property].toString().trim() == ''){
			calories = "Error! All Fields must have Data";
			proceed = false;
		    }
		}
		if (proceed){
		    let col = dbManager.get().collection("activities");
		    //on the insert page
		    if (urlOBJ.pathname=="/insert"){
			
			try{
			    //if the data is bad, object creation throws an 
			    //error (as we have seen since Week 4).
			    //And no document will be inserted
			    var curTracker = new tracker(postParams.activity,
							 postParams.weight,
							 postParams.distance,
							 postParams.time);
			    calories = curTracker.calculate();
			  			 
			    //convert params to a document for Mongo
			    let curDoc = docifyActivity(postParams);

			    //insert the document into the db
			    let result = await col.insertOne(curDoc);
			    //return calories as response (Success)
			    servResp(calories, res);
			    console.log(result); //log result for viewing
			} catch (err){  
			    calories = "ERROR! Please enter appropriate data";
			    console.log(err.message);
			    servResp(calories, res);
			} 
		    } else if (urlOBJ.pathname == "/search") {
			var prop= postParams.prop;
			var val = postParams.value;
			if (prop != "user" && prop != "activity.type"){
			    val = Number(postParams.value);
			} 
			//simple equality search. using [] allows a variable
			//in the property name 
			let searchDoc = { [prop] : val };
			try{
			    let cursor = col.find(searchDoc,  {
				projection: { _id:0 , activity: 1, distance: 1, user: 1, time: 1, weight: 1}}).sort({distance: -1});
			    let resultOBJ={data: cursor, [prop]  : val, prop: prop};

			    searchResp(resultOBJ, res);//call the searchPage
			} catch (e){
			    console.log(e.message);
			    res.writeHead(404);
		res.write("<html><body><h1> ERROR 404. Page NOT FOUND</h1>");
			    res.end("<br>" + e.message + "<br></body></html>");
			}
		    } else {
			res.writeHead(404);
		res.end("<html><body><h1> ERROR 404. Page NOT FOUND</h1><br>");
		    }
		} else {
		    if (urlOBJ.pathname == "/insert"){
			//calories = Error! All Fields must have Data"
			servResp(calories, res);
		    } else if (urlOBJ.pathname == "/search"){
			//blank page, nothing found
			searchResp(null, res);
		    }
		}  
	    });
    } else { //GET
	
	if (urlOBJ.pathname == "/insert"){
	    //initial GET to insert returns  
	    servResp(null, res);
	}else if (urlOBJ.pathname == "/search"){
	    //Initial GET to search returns a blank page
	    searchResp(null, res);
	} else if (urlOBJ.pathname == "/"){
	    res.end('<html><body><br><br><a href="/insert">home/insert</a>&emsp;&emsp;<a href="/search">search Page</a></body></html>');
	}else {
	    res.writeHead(404);
	    res.end("<h1> ERROR 404. Page NOT FOUND</h1><br><br>");
	}
    }
}).on('end', async ()=>{
	console.log("Closing DB Connection");
	await dbManager.close();
    }).listen(3000, async ()=> {
	    //start and wait for the DB connection
	    try{
		await dbManager.get("practiceDB");
	    } catch (e){
		console.log(e.message);
	    }
	    
	    console.log("Server is running...");
	});

