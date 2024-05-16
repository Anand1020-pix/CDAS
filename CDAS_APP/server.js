const express = require('express');
const path = require('path');
const fs = require('fs');
const Twilio = require('twilio');

const app = express();
const accountSid = 'AC171ebcc41190db25abe5fb21a6104fe2';
const authToken = '5d13c046a6d42545db06da86593906e7';
const client = new Twilio(accountSid, authToken);
const twilioPhoneNumber = '+13342768013';
const destinationPhoneNumber = '+916282266338';

let videoCount = 0;
let sendSmsTimeout = null;

const detectionDirectory = path.join(__dirname, 'converted');
fs.watch(detectionDirectory, { encoding: 'utf8' }, (eventType, filename) => {
  const filePath = path.join(detectionDirectory, filename);
  if (eventType === 'rename' && fs.existsSync(filePath)) {
    if (filename.endsWith('.avi')) {
      // Convert AVI to MP4
      const outputFilename = filename.replace('.avi', '.mp4');
      const outputPath = path.join(detectionDirectory, outputFilename);
      convertVideoToMp4(filePath, outputPath, () => {
        fs.unlink(filePath, err => { if (err) console.error('Failed to delete original file:', err); });
      });
    }

    if (filename.endsWith('.mp4')) {
      videoCount++;
      if (!sendSmsTimeout) {
        sendSmsTimeout = setTimeout(() => {
          client.messages.create({
            to: destinationPhoneNumber,
            from: twilioPhoneNumber,
            body: `New Suspicious activity detected: ${videoCount} `
          }).then(message => {
            console.log('SMS sent:', message.sid);
          }).catch(error => {
            console.error('Failed to send SMS:', error);
          });
          videoCount = 0;
          sendSmsTimeout = null;
        }, 5000);  // Debounce time to send SMS
      }
    }
  }
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/detection', (req, res) => {
  const videoFiles = getVideoFiles(detectionDirectory);
  res.json(videoFiles);
});

app.get('/detection/:video', (req, res) => {
  const videoName = req.params.video;
  const videoPath = path.join(detectionDirectory, videoName);
  if (fs.existsSync(videoPath)) {
    const contentType = videoName.endsWith('.mp4') ? 'video/mp4' : 'video/x-msvideo';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(videoPath).pipe(res);
  } else {
    res.status(404).send('Video not found');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}/`);
});

function getVideoFiles(directory) {
  return fs.readdirSync(directory).filter(file => file.endsWith('.mp4') || file.endsWith('.avi'));
}

