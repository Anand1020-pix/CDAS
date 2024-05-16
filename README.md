# CDAS - Crime Detection and Surveillance System

CDAS is a surveillance system leveraging YOLOv8 deep learning for real-time crime detection. It offers accurate object detection capabilities, facilitating seamless integration with a scalable cloud architecture for enhanced law enforcement proactive measures. By revolutionizing crime prevention and public safety, CDAS serves as a critical tool in safeguarding communities.

## Components

### 1. React App

The React App component provides a user interface for displaying detection videos.

### 2. Node.js Server and converter.js

The Node.js Server hosts the detection results locally through a local server and converter.js converts the detection video (mp4v => x264)

### 3. Python App - YOLO Detection

The Python app captures input from the camera, performs detection using the YOLO model, and records suspicious activities.

## Usage

To utilize CDAS, follow these steps:

1. Start the Node.js server and converter.js to host the detection results and convert the detection video.
2. Run the Python app for capturing and processing video streams.
3. Utilize the React App for real-time viewing of detection videos.

## Libraries Used

- React (for the user interface)
- Node.js (for server-side scripting)
- Express.js (for building the Node.js server)
- fs (for file system operations in Node.js)
- Python (for the detection app)
- OpenCV (for image and video processing)
- Ultralytics YOLO (for object detection)
- PIL (Python Imaging Library, for image processing)
- threading (for multi-threading in Python)

  ## Screenshots
  ![Alt text](CDAS_APP/screenshot/w_300/image2.png)
  
