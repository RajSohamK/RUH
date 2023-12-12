// Check if the Morse code dictionary is already defined
if (typeof morse_code_dict === 'undefined') {
    // Morse code dictionary
    var morse_code_dict = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        ' ': ' ', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
        ':': '---...', ';': '-.-.-.', '+': '.-.-.', '-': '-....-', '=': '-...-',
        '/': '-..-.', '"': '.-..-.', "'": '.----.', '(': '-.--.', ')': '-.--.-',
        '&': '.-...', '$': '...-..-', '@': '.--.-.'
    };
}

// Function to encode text to Morse code
function text_to_morse(text) {
    text = text.toUpperCase();
    let morse_code = '';
    for (let char of text) {
        if (char in morse_code_dict) {
            if (char === ' ') {
                morse_code += morse_code_dict[char];
            } else {
                morse_code += morse_code_dict[char] + ' ';
            }
        }
    }
    return morse_code.trim();
}

// Function to decode Morse code to text
function morse_to_text(morse_code) {
    morse_code = morse_code.split(' ');
    let text = '';
    for (let code of morse_code) {
        for (let char in morse_code_dict) {
            if (code === morse_code_dict[char]) {
                text += char;
                break;
            }
        }
        if (code === '') {
            text += ' ';
        }
    }
    return text;
}

// Function to start QR code scanner
function startScanner() {
    const video = document.getElementById('video');
    const qrOutput = document.getElementById('qrOutput');
    const switchCameraBtn = document.getElementById('switchCameraBtn');

    let currentCameraIndex = 0;
    let videoSources = [];

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            videoSources = devices.filter(device => device.kind === 'videoinput');

            if (videoSources.length === 0) {
                console.error('No video devices found.');
                return;
            }

            const backCamera = videoSources.find(device => device.label.toLowerCase().includes('back'));
            if (backCamera) {
                currentCameraIndex = videoSources.indexOf(backCamera);
            } else {
                console.error('No back camera found.');
            }

            if (videoSources.length > 1) {
                switchCameraBtn.style.display = 'inline-block';
            }

            // Start with the back camera if available
            startCamera(videoSources[currentCameraIndex].deviceId);
        })
        .catch(err => console.error('Error enumerating video devices:', err));

    switchCameraBtn.onclick = function () {
        // Check if there are available cameras
        if (videoSources.length > 1) {
            currentCameraIndex = (currentCameraIndex + 1) % videoSources.length;
            startCamera(videoSources[currentCameraIndex].deviceId);
        }
    };

    function startCamera(deviceId) {
        navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } }
        })
            .then((stream) => {
                video.srcObject = stream;

                const codeReader = new ZXing.BrowserQRCodeReader();
                codeReader.decodeFromVideoDevice(deviceId, 'video', (result, err) => {
                    if (result) {
                        const morseCodeResult = result.text.trim();
                        const decodedTextResult = morse_to_text(morseCodeResult);
                        qrOutput.innerHTML = "Decoded Text from QR: " + decodedTextResult;
                        // Close the camera after scanning
                        stream.getTracks().forEach(track => track.stop());
                    }
                    if (err) {
                        console.error(err);
                    }
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
