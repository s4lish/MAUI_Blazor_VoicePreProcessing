var mediaRecorder;
var chunks = [];
var base64data;

function getbase64data() {
    return base64data;
}

function startRecording() {
    var seconds = 0;
    var minutes = 0;
    var timer = setInterval(function () {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
        document.getElementById('timer').innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }, 1000);

    var canvas = document.getElementById('canvas');
    var canvasCtx = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);

            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var source = audioCtx.createMediaStreamSource(stream);
            var analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);

            source.connect(analyser);

            function draw() {
                var WIDTH = canvas.width;
                var HEIGHT = canvas.height;

                requestAnimationFrame(draw);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = 'rgb(255, 255, 255)';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

                canvasCtx.beginPath();

                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;

                for (var i = 0; i < bufferLength; i++) {

                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasCtx.lineTo(canvas.width, canvas.height / 2);
                canvasCtx.stroke();
            }

            draw();

            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = function (e) {
                clearInterval(timer);
                document.getElementById('timer').innerHTML = '00:00';

                var blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus', 'lastModified': new Date().getTime() });
                chunks = [];

                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    base64data = reader.result;
                    document.getElementById('audio').src = base64data;
                //    document.getElementById('inputFile').value = base64data;
                };
            };

            mediaRecorder.start();
        })
        .catch(function (err) {
            console.log('Error starting recording: ' + err);
        });
}
function stopRecording() {
    mediaRecorder.stop();
}

