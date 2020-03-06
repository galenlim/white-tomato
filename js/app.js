// Service Worker Registration
window.addEventListener('load', e => {
	registerSW();
})

async function registerSW() {
	if ('serviceWorker' in navigator) {
		try {
			await navigator.serviceWorker.register('./sw.js');
		} catch (e) {
			alert('ServiceWorker registration failed:' + e);
		}
	}
}

// Timer

let counter = {};
let pomoButton = document.getElementById("start");

pomoButton.onclick = function() {
	if (pomoButton.innerHTML === 'Start') {
		pomoButton.innerHTML = 'Reset';
		createWhiteNoise();
		playWhiteNoise();
		countDownTimer(pomoButton.attributes['value'].value);
	}
	else if (pomoButton.innerHTML === 'Reset') {
		pomoButton.innerHTML = 'Start';
		stopWhiteNoise();
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
				stopWhiteNoise();
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
	counter.min.innerHTML = '25';
	counter.sec.innerHTML = '00';
}
// Audio Player
let context;

function createWhiteNoise() {
	try {
		window.AudioContext = window.AudioContext||window.webskitAudioContext;
		context = new AudioContext;
	}
	catch(e) {
		alert('Web Audio API is not support in this browser');
	}
}

let whiteNoise;

function playWhiteNoise() {
	whiteNoise = context.createWhiteNoise();
	whiteNoise.connect(context.destination);
}

function stopWhiteNoise() {
	whiteNoise.disconnect(0);
}