
var names = [


	{
		"username" : "Matt",
		"password" : "Dad"
	}
]





function getInfo() {
	var username = document.getElementById('username').value
	var password = document.getElementById('password').value

	for(var i = 0; i < names.length; i++) {
		// check is user input matches username and password of a current index of the objPeople array
		if(username == names[i].username && password == names[i].password) {
			console.log(username + " is logged in!!!")
			// stop the function if this is found to be true
			return
		}
	}
	console.log("incorrect username or password")
}



let accounts = [];

const accountAdd = (ev)=>{
	ev.preventDefault();

	let account =
	 {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	 }


accounts.push(account);
document.forms[0].reset();


console.warn('added' , {accounts} );
let pre = document.querySelector('#msg pre');
pre.textContent = '\n' + JSON.stringify(accounts, '\t', 2);

localStorage.setItem('accountsList', JSON.stringify(accounts) );
}

document.addEventListener('DOMContentLoaded', ()=>{
document.getElementById('btn').addEventListener('click', accountAdd);
});

