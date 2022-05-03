/*database.js
Simple demonstration of using async/await syntax to connect to a mongodb
instance.
Note: For this to work, you NEED to have the mongo daemon running in the 
background. If you don't run it as a service, please remember to start it
up before you run this code.  You also need a copy of the practiceDB.

This could be easily connected to any local db by changing the desired name.*/
var mongoClient = require("mongodb").MongoClient;
var authent = require("authent");

var url = "mongodb://127.0.0.1:27017/"

const client = new mongoClient(url,{ useUnifiedTopology: true });

//turn this function into an async function so it returns a promise
async function run(){
    try{
	//We await for the connection to be established
	await client.connect();
	//if we use await we don't have to pass a callback into connect
	//Everything after this line will run on the fulfilled promise value
       const projectDB = client.db("projectDB");
       const login = projectDB.collection("login");
  //notice how the query is exactly the same as if it were in the Mongoshell
	const query = { user: { $exists: true }} //, distance: {$gte: 4} };


	//Here we use a projection to turn off the object ID in the returned
	//document
       const cursor = login.find(query, {
	       projection: {username: 1, email: 1, password: 1}});
	//the projection determines what properities exist in each object 

	
       //Querying the mongodb in modern code returns a "cursor" object
       if (( await cursor.count())== 0){
	   console.log("No docs found!");
       }
       
       //cursors contain all of the results, and can be iterated over
       await cursor.forEach(item =>{ 
	       let current = new authent(item.username, item.email, item.password);       
	       console.log(`${item.user} burned calories by! `);
	   });
    } finally{
	//no matter what we want to close the connection when finished
	await client.close();
    }

}
//catch any errors (this is necessary to prevent "unhandled Promise rejection"
// errors)
run().catch(console.dir);
