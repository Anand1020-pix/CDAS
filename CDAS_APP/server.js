const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Route for serving videos
app.get('/detection', (req, res) => {
  const detectionDirectory = path.join(__dirname, 'detection');
  const videoFiles = getVideoFiles(detectionDirectory);
  res.json(videoFiles);
});

// Route for serving individual videos
app.get('/detection/:video', (req, res) => {
  const videoName = req.params.video;
  const videoPath = path.join(__dirname, 'detection', videoName);

  // Check if the video file exists
  if (fs.existsSync(videoPath)) {
    // Set content type to video/mp4
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    // Create read stream for the video file and pipe it to response
    fs.createReadStream(videoPath).pipe(res);
  } else {
    res.status(404).send('Video not found');
  }
});

// Route for serving React app
app.get('/', (req, res) => {
  res.send("WELCOME !")
});

// Start server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}/`);
});

// Function to get list of video files in a directory
function getVideoFiles(directory) {
  return fs.readdirSync(directory).filter(file => {
    return file.endsWith('.mp4');
  });
}
