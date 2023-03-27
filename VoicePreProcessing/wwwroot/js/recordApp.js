//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");
var timer;
var seconds = 0;
var minutes = 0;

function startRecording() {

	seconds = 0;
    minutes = 0;
     timer = setInterval(function () {
		seconds++;
		if (seconds === 60) {
			minutes++;
			seconds = 0;
		}
		document.getElementById('timer').innerHTML = (minutes < 10 ? '0':'') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	}, 1000);

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
	var constraints = { audio: true, video: false };


	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();
		

		//update the format 
		document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input, { numChannels: 2 })

		//start the recording process
		rec.record()

		console.log("Recording started");

		init();

		// wait for remote media stream

	}).catch(function (err) {
		//enable the record button if getUserMedia() fails
		console.log(err);
		recordButton.disabled = false;
		stopButton.disabled = true;
		pauseButton.disabled = true
	});
}

function pauseRecording() {

	if (rec.recording) {
		//pause
		rec.stop();
		clearInterval(timer);
	} else {
		//resume
		rec.record()

		timer = setInterval(function () {
			seconds++;
			if (seconds === 60) {
				minutes++;
				seconds = 0;
			}
			document.getElementById('timer').innerHTML = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
		}, 1000);
	}
}

function stopRecording() {
	clearInterval(timer);
	//disable the stop button, enable the record too allow for new recordings


	//reset button just in case the recording is stopped while paused
	//pauseButton.innerHTML = "توقف";
	document.getElementById("main").innerHTML = "";
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');


	var filename = new Date().toISOString();


	//name of .wav file to use during upload and download (without extendion)

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	link.href = url;
	link.download = filename + ".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = "ذخیره";

	getImgURL(url, (blob) => {
		// Load img blob to input
		// WIP: UTF8 character error
		let file = new File([blob], link.download, { type: "audio/wav", lastModified: new Date().getTime() });
		let container = new DataTransfer();
		container.items.add(file);
		document.querySelector('#voiceFile').files = container.files;
		document.getElementById('voiceFile').dispatchEvent(new Event('change'));
	})


	//add the new audio element to li
	li.appendChild(au);

	//add the filename to the li
	//li.appendChild(document.createTextNode(filename + ".wav "))

	//add the save to disk link to li
	//li.appendChild(link);


	//li.appendChild(document.createTextNode(" "))//add a space in between
	//li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.innerHTML = "";
	recordingsList.appendChild(li);
}


// xmlHTTP return blob respond
function getImgURL(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		callback(xhr.response);
	};
	xhr.open('GET', url);
	xhr.responseType = 'blob';
	xhr.send();
}

class AudioVisualizer {
	constructor(audioContext, processFrame, processError) {
		this.audioContext = audioContext;
		this.processFrame = processFrame;
		this.connectStream = this.connectStream.bind(this);
		navigator.mediaDevices.getUserMedia({ audio: true, video: false })
			.then(this.connectStream)
			.catch((error) => {
				if (processError) {
					processError(error);
				}
			});
	}

	connectStream(stream) {
		this.analyser = this.audioContext.createAnalyser();
		const source = this.audioContext.createMediaStreamSource(stream);
		source.connect(this.analyser);
		this.analyser.smoothingTimeConstant = 0.5;
		this.analyser.fftSize = 32;

		this.initRenderLoop(this.analyser);
	}

	initRenderLoop() {
		const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
		const processFrame = this.processFrame || (() => { });

		const renderFrame = () => {
			this.analyser.getByteFrequencyData(frequencyData);
			processFrame(frequencyData);

			requestAnimationFrame(renderFrame);
		};
		requestAnimationFrame(renderFrame);
	}
}

const visualMainElement = document.querySelector('main');
const visualValueCount = 16;
let visualElements;
const createDOMElements = () => {
	let i;
	for (i = 0; i < visualValueCount; ++i) {
		const elm = document.createElement('div');
		visualMainElement.appendChild(elm);
	}

	visualElements = document.querySelectorAll('main div');
};
createDOMElements();

const init = () => {
	// Creating initial DOM elements
	//const audioContext2 = new AudioContext();
	console.log("visualizee....");
	const initDOM = () => {
		visualMainElement.innerHTML = '';
		createDOMElements();
	};
	initDOM();

	// Swapping values around for a better visual effect
	const dataMap = { 0: 15, 1: 10, 2: 8, 3: 9, 4: 6, 5: 5, 6: 2, 7: 1, 8: 0, 9: 4, 10: 3, 11: 7, 12: 11, 13: 12, 14: 13, 15: 14 };
	const processFrame = (data) => {
		const values = Object.values(data);
		let i;
		for (i = 0; i < visualValueCount; ++i) {
			const value = values[dataMap[i]] / 255;
			const elmStyles = visualElements[i].style;
			elmStyles.transform = `scaleY( ${value} )`;
			elmStyles.opacity = Math.max(.25, value);
		}
	};

	const processError = () => {
		visualMainElement.classList.add('error');
		visualMainElement.innerText = 'Please allow access to your microphone in order to see this demo.\nNothing bad is going to happen... hopefully :P';
	}

	const a = new AudioVisualizer(audioContext, processFrame, processError);
};