const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const watchedDirectory = path.join(__dirname, 'detection'); // Directory to watch for new videos
const convertedDirectory = path.join(__dirname, 'converted'); // Directory to store converted videos

// Ensure ffprobe and ffmpeg are in your PATH or specify the path to the executables
const ffmpegPath = 'ffmpeg';
const ffprobePath = 'ffprobe';

// Ensure the converted directory exists
if (!fs.existsSync(convertedDirectory)) {
    fs.mkdirSync(convertedDirectory, { recursive: true });
}

function convertVideoToX264(inputPath, outputPath, callback) {
    const command = `${ffmpegPath} -i "${inputPath}" -c:v libx264 -preset fast -c:a aac "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error converting video: ${error.message}`);
            return callback(error);
        }
        console.log('Video conversion complete:', outputPath);
        callback(null, outputPath);
    });
}

function validateVideoFile(filePath, callback) {
    exec(`${ffprobePath} -v error -show_entries format=filename -of default=noprint_wrappers=1 "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Validation failed for file: ${filePath}, ${stderr}`);
            callback(false);
        } else {
            console.log(`Validation successful for file: ${filePath}`);
            callback(true);
        }
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let fileQueue = [];

function processNextVideo() {
    if (fileQueue.length === 0) {
        return; // No files to process
    }

    const { filePath, filename } = fileQueue.shift(); // Dequeue the first file

    console.log(`Detected new video file: ${filename}`);
    rl.question('Do you want to process this video file? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            const outputFilename = filename.replace(path.extname(filename), '.mp4');
            const outputPath = path.join(convertedDirectory, outputFilename);

            validateVideoFile(filePath, isValid => {
                if (isValid) {
                    convertVideoToX264(filePath, outputPath, (error, convertedPath) => {
                        if (!error) {
                            console.log('Conversion succeeded, original file preserved:', filePath);
                        }
                        processNextVideo(); // Process the next video in the queue
                    });
                } else {
                    console.log('File validation failed, will not process:', filePath);
                    processNextVideo(); // Process the next video in the queue
                }
            });
        } else {
            console.log('Processing aborted by user:', filePath);
            processNextVideo(); // Process the next video in the queue
        }
    });
}

fs.watch(watchedDirectory, { encoding: 'utf8' }, (eventType, filename) => {
    if (!filename) return;
    const filePath = path.join(watchedDirectory, filename);
    if (eventType === 'rename' && fs.existsSync(filePath) && (filename.endsWith('.avi') || filename.endsWith('.mp4'))) {
        fileQueue.push({ filePath, filename }); // Enqueue the file
        if (fileQueue.length === 1) { // If this is the only file, start processing
            processNextVideo();
        }
    }
});

console.log(`Watching directory for new videos: ${watchedDirectory}`);
