'use strict';

// Service Worker Registration

window.addEventListener('load', event => {
	registerSW();
})

async function registerSW() {
	if ('serviceWorker' in navigator) {
		try {
			await navigator.serviceWorker.register('/white-tomato/sw.js');
		} catch (error) {
			alert('ServiceWorker registration failed:' + error);
		}
	}
}

// Database setup and initial options

initializeDatabase();
readData();

function initializeDatabase() {

	// check for support
	if (!('indexedDB' in window)) {
	  console.log('This browser does not support IndexedDB');
	}
	var dbRequest = openDatabase('appdb', 1);

	// Will trigger if database does not exist
	dbRequest.onupgradeneeded = function(event) {
		var db = event.target.result;
		db.createObjectStore("sounds",
			{ keyPath: "color" }
		);
		var transaction = event.target.transaction;
		transaction.oncomplete = function(event) {
			var soundData = [
				{ "color": "white", "selected": true },
				{ "color": "pink", "selected": false },
				{ "color": "brown", "selected": false }
			];
			var soundTransaction = db.transaction("sounds", "readwrite");
			soundTransaction.onerror = function(event) {
				console.log("Error :", event.target.error);
			};
			var soundStore = soundTransaction.objectStore("sounds");
			for (var i = 0; i< soundData.length; i++) {
				soundStore.add(soundData[i]);
			}
			console.log('Database :', db);
			console.log('Object store names: ', db.objectStoreNames);
		};
	};
}

// Read database

function readData() {
	var dbRequest = openDatabase('appdb', 1);

	dbRequest.onsuccess = function(event) {
		var db = event.target.result;
		var soundTransaction = db.transaction("sounds");

		soundTransaction.onerror = function(event) {
			console.log("Error :", event.target.error);
		};

		var soundStore = soundTransaction.objectStore("sounds");
		var soundCursor = soundStore.openCursor();

		soundCursor.onsuccess = function(event) {
			var cursor = event.target.result;
			if (!cursor) { return; }
			var sound = cursor.value;
			if (sound.selected) {
				console.log(sound.color, "sound is selected");
				document.getElementById("colorNoiseSelect").value = sound.color;
				return;
			}
			cursor.continue();
		};
	};
}

// Write to database

function writeData(noiseChoice) {
	var dbRequest = openDatabase('appdb', 1);

	dbRequest.onsuccess = function(event) {
		var db = event.target.result;
		var soundTransaction = db.transaction("sounds", "readwrite");

		soundTransaction.onerror = function(event) {
			console.log("Error :", event.target.error);
		};

		var soundStore = soundTransaction.objectStore("sounds");
		var soundCursor = soundStore.openCursor();

		soundCursor.onsuccess = function(event) {
			var cursor = event.target.result;
			if (!cursor) { return; }
			var sound = cursor.value;
			if (sound.color == noiseChoice) {
				sound.selected = true;
				cursor.update(sound);
			} else {
				sound.selected = false;
				cursor.update(sound);
			}
			cursor.continue();
		};
	};
}

function openDatabase(name, version) {
	var dbRequest = window.indexedDB.open(name, version);
	dbRequest.onerror = function(event) {
		console.log('Database error: ', event.target.error);
	};
	return dbRequest;
}

// Timer

let counter = {};
let pomoButton = document.getElementById("start");
let timerDuration = pomoButton.attributes['value'].value;

pomoButton.onclick = function() {
	if (pomoButton.innerHTML === 'Start') {
		pomoButton.innerHTML = 'Reset';
		createNoise();
		playNoise();
		countDownTimer(timerDuration);
	}
	else if (pomoButton.innerHTML === 'Reset') {
		pomoButton.innerHTML = 'Start';
		stopNoise();
		resetTimer();
	}
};

function countDownTimer(minutes) {

	counter.end = minutes * 60;
	counter.min = document.getElementById("minutes");
	counter.sec = document.getElementById("seconds");

	if (counter.end > 0) {

		counter.ticker = setInterval(function() {
			counter.end--;
			if (counter.end <=0) {
				clearInterval(counter.ticker);
				counter.end = 0;
				stopNoise();
			}

			let secs = counter.end;
			let mins = Math.floor(secs / 60);
			secs = secs % 60;

			counter.min.innerHTML = mins.toString().padStart(2, "0");
			counter.sec.innerHTML = secs.toString().padStart(2, "0");
		}, 1000);

	}
}

function resetTimer() {
	clearInterval(counter.ticker);
	counter.end = 0;
	counter.min.innerHTML = timerDuration;
	counter.sec.innerHTML = '00';
}

// Audio Player

let context;
let noise;

function createNoise() {
	try {
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		context = new AudioContext;
	}
	catch(error) {
		alert('Web Audio API is not supported in this browser.');
	}
}

function playNoise() {
	
	let noiseColor = document.getElementById("colorNoiseSelect").value;
	switch (noiseColor) {
		case "white":
			noise = context.createWhiteNoise();
			break;
		case "pink":
			noise = context.createPinkNoise();
			break;
		case "brown":
			noise = context.createBrownNoise();
			break;
	}
	noise.connect(context.destination);
	console.log("Playing", noiseColor, "...");
}

function stopNoise() {
	noise.disconnect(0);
}

// Options

let saveChanges = document.getElementById("save");

saveChanges.onclick = function() {
	let noiseColor = document.getElementById("colorNoiseSelect").value;
	writeData(noiseColor);
	console.log("Changes saved...", noiseColor);
	if (counter.end) {
		stopNoise();
		playNoise();
	}
}
