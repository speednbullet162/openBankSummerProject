const baseURL = 'https://apisandbox.openbankproject.com';
const apiVersion = 'v4.0.0';
var token;

function userlogin(username, password, key) {
	tempURL = baseURL + '/my/logins/direct';
	document.getElementById('currentUser').innerHTML = '';
	document.getElementById('currentUser').append('Current User: ' + username);
	tempHeader = JSON.stringify(`username="${username}",password="${password}",consumer_key="${key}"`);
	const obp = new XMLHttpRequest();

	obp.onreadystatechange = function () {
		if (obp.readyState == 4) {
			if (obp.status == 201) {
				var re = JSON.parse(this.response);
				document.getElementById('currentUser').innerHTML += `<br><p>Session Token: ${re['token']}</p>`;
				token = re['token'];
				console.log('token: ' + token);
				document.getElementById('currentUser').innerHTML += `<button onClick="getCurrentUser()">Current User</button>`;
			} else {
				document.getElementById('currentUser').innerHTML = `<br><p>Error occurred: ${this.responseText}</p>`;
			}
		}
	};

	obp.open('POST', tempURL, true);
	obp.setRequestHeader('content-type', 'application/json');
	obp.setRequestHeader('Authorization', `DirectLogin username="${username}",password="${password}",consumer_key="${key}"`);
	obp.send();
	obp.onload = function () {
		// console.log('on load' + this.response);
	};
}

function findATM(input) {
	const xhr = new XMLHttpRequest();
	const tempURL = baseURL + '/obp/' + apiVersion + '/banks/' + input + '/atms';

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var temp = JSON.parse(xhr.responseText);
				var atmout = document.getElementById('atmOutput');
				atmout.style.visibility = 'visible';
				// console.log('response: ' + xhr.response);
				atmout.innerHTML = `<tr>
						<th>Name</th>
						<th>ID</th>
						<th>Location</th>
					</tr>`;
				for (var i in temp.atms) {
					var tempAddress = '';
					for (var j in temp.atms[i]['address']) {
						// console.log('address: ' + temp.atms[i]['address'][j]);
						if (temp.atms[i]['address'][j] != 'NA') {
							tempAddress += ' ' + temp.atms[i]['address'][j];
						}
					}
					// console.log('temp address: ' + tempAddress);
					atmout.innerHTML += `
						<tr><td>${temp.atms[i]['name']}</td>
							<td>${temp.atms[i]['id']}</td>
							<td>${tempAddress}</td></tr>
					`;
					// console.log(temp.atms[i]['id']);
				}
			} else {
				document.getElementById('atmOutput').innerHTML = `${this.responseText}`;
			}
		}
	};

	xhr.open('GET', tempURL, true);
	xhr.send();
}

function getCurrentUser() {
	const tempURL = baseURL + '/obp/' + apiVersion + '/users/current';
	const raw = document.getElementById('rawOutput');
	const form = document.getElementById('formattedOutput');
	var r;

	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				// console.log('this response is good');
				raw.innerHTML = this.response;
				r = JSON.parse(this.response);
				form.innerHTML = `
					<table>
						<tr>
							<th>Label</th>
							<th>Information</th>
						</tr>
						<tr>
							<td>User ID</td>
							<td>${r['user_id']}</td>
						</tr>
						<tr>
							<td>Email</td>
							<td>${r['email']}</td>
						</tr>
						<tr>
							<td>Provider ID</td>
							<td>${r['provider_id']}</td>
						</tr>
						<tr>
							<td>Username</td>
							<td>${r['username']}</td>
						</tr>
					</table>
					<br />
					<table id="account">
						<tr>
							<th>Bank ID</th>
							<th>Account ID</th>
							<th>Privilege</th>
						</tr>
					</table>
				`;
				var acc = document.getElementById('account');
				for (var i in r['views']['list']) {
					acc.innerHTML += `
						<tr>
							<td>${r['views']['list'][i]['bank_id']}</td>
							<td>${r['views']['list'][i]['account_id']}</td>
							<td>${r['views']['list'][i]['view_id']}</td>
						</tr>
					`;
				}
			}
		}
	};

	xhr.open('get', tempURL, true);
	xhr.setRequestHeader('Authorization', 'DirectLogin token="' + token + '"');
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.send();
	xhr.onload = function () {
		// console.log('on load' + this.response);
	};
}

function testing(x) {
	console.log('given bank: ' + x);
}
