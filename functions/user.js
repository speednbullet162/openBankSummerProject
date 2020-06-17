const baseURL = 'https://apisandbox.openbankproject.com';
const apiVersion = 'v4.0.0';
const raw = document.getElementById('rawOutput');
const form = document.getElementById('formattedOutput');
var token, r;

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
				// document.getElementById('currentUser').innerHTML += `<button onClick="getCurrentUser()">Current User</button>`;
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
				// console.log('atm response: ' + temp);
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

function getCards() {
	const url = baseURL + '/obp/' + apiVersion + '/cards';
	const xhr = new XMLHttpRequest();

	xhr.onreadystatechange = () => {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var temp = JSON.parse(xhr.responseText);
				raw.innerHTML = JSON.stringify(temp.cards);
				form.innerHTML = `
					<table id='cardTable'>
						<tr>
							<th>Card Number</th>
							<th>Account ID</th>
							<th>Bank ID</th>
							<th>Name on Card</th>
							<th>Expires</th>
						</tr>
					</table>
				`;
				const ct = document.getElementById('cardTable');
				for (var i in temp.cards) {
					console.log(`card ${i}` + JSON.stringify(temp.cards[i]));
					ct.innerHTML += `
						<tr>
							<td>${temp.cards[i]['bank_card_number']}</td>
							<td>${temp.cards[i]['account']['id']}</td>
							<td>${temp.cards[i]['bank_id']}</td>
							<td>${temp.cards[i]['name_on_card']}</td>
							<td>${temp.cards[i]['expires_date']}</td>
						</tr>
					`;
				}
			}
		}
	};

	xhr.open('get', url, true);
	xhr.setRequestHeader('Authorization', 'DirectLogin token="' + token + '"');
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.send();
	xhr.onload = () => {
		console.log('on load: ' + this.responseJSON);
	};
}

function transactions() {
	const bank = document.getElementById('userBank').value;
	const account = document.getElementById('userAccount').value;
	const url = baseURL + '/obp/' + apiVersion + '/banks/' + bank + '/accounts/' + account + '/owner/transactions';

	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				r = JSON.parse(xhr.responseText);
				console.log('r: ' + JSON.stringify(r.transactions));
				raw.innerHTML = JSON.stringify(r.transactions);
				form.innerHTML = `
					<h3>Account: ${r.transactions[0]['this_account']['id']}</h3>
					<table id='ttable'>
						<tr>
							<th>Transaction ID</th>
							<th>Counter Account</th>
							<th>Counter Name</th>
							<th>Description</th>
							<th>Amount</th>
							<th>Currency</th>
						</tr>
					</table>
				`;
				const tt = document.getElementById('ttable');
				for (var i in r.transactions) {
					tt.innerHTML += `
						<tr>
							<td>${r.transactions[i]['id']}</td>
							<td>${r.transactions[i]['other_account']['id']}</td>
							<td>${r.transactions[i]['other_account']['holder']['name']}</td>
							<td>${r.transactions[i]['details']['description']}</td>
							<td>${r.transactions[i]['details']['value']['amount']}</td>
							<td>${r.transactions[i]['details']['value']['currency']}</td>
						</tr>
					`;
				}
			}
		}
	};
	xhr.open('get', url, true);
	xhr.setRequestHeader('Authorization', 'DirectLogin token="' + token + '"');
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.send();
	xhr.onload = () => {
		// console.log(JSON.parse(this.response));
	};
}

function testing(x) {
	console.log('given bank: ' + x);
}
