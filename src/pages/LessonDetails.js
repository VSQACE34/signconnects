import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import * as ort from 'onnxruntime-web';  // ONNX Runtime for running the model
import { Camera } from '@mediapipe/camera_utils'; // Import Camera correctly from mediapipe
import { Holistic } from '@mediapipe/holistic'; // Mediapipe Holistic import
import { getCookie } from '../components/CookieManage';

const LessonDetails = () => {
  const { lesson_id } = useParams();
  const [auslanSigns, setAuslanSigns] = useState([]);
  const [selectedSign, setSelectedSign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [prediction, setPrediction] = useState('');
  const videoRef = useRef(null); // Camera video reference
  const sessionRef = useRef(null); // ONNX session reference
  const sequenceRef = useRef([]); // Sequence of keypoints for prediction
  const holisticInstance = useRef(null); // Ref for the holistic instance
  const cameraInstance = useRef(null); // Ref for the camera instance

  useEffect(() => {
    // Fetch Auslan signs using the lesson_id from the route params
    const fetchSigns = async () => {
      const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/get_lesson_details?lesson_id=${lesson_id}&user_id=${getCookie('userId')}`);
      // const response = await fetch(`http://localhost:8000/api/v1/lessons/get_lesson_details?lesson_id=${lesson_id}&user_id=${getCookie('userId')}`);
      const data = await response.json();
      setAuslanSigns(data);
      setSelectedSign(data[0]);
    };
    fetchSigns();
  }, [lesson_id]);

  // Find the first sign with status 'In Progress'
  const firstInProgressIndex = auslanSigns.findIndex(sign => sign.status === "In Progress");

  // Load the ONNX model//
  const loadONNXModel = async () => {
    try {
      const session = await ort.InferenceSession.create('https://the-boys-bucket.s3.ap-southeast-2.amazonaws.com/models/model.onnx'); // Adjust the path accordingly
      sessionRef.current = session;
      console.log("ONNX Model loaded successfully");
    } catch (err) {
      console.error('Failed to load the ONNX model:', err);
    }
  };

  // Start the camera and feed the live stream into the video element
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Holistic for Mediapipe
      const holistic = new Holistic({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults(onResults);
      holisticInstance.current = holistic; // Save Holistic instance to ref

      // Initialize and start the camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (holisticInstance.current && videoRef.current) {
            await holistic.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraInstance.current = camera;
      camera.start();
    } catch (error) {
      console.error('Error accessing the camera: ', error);
    }
  };

  // Process Mediapipe results and extract keypoints
  const onResults = (results) => {
    const keypoints = [];

    // Extract pose keypoints
    if (results.poseLandmarks) {
      results.poseLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z, landmark.visibility));
    }

    // Extract face keypoints
    if (results.faceLandmarks) {
      results.faceLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z));
    }

    // Extract left hand keypoints
    if (results.leftHandLandmarks) {
      results.leftHandLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z));
    }

    // Extract right hand keypoints
    if (results.rightHandLandmarks) {
      results.rightHandLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z));
    }

    // Add zeros if landmarks are missing
    while (keypoints.length < 1662) {
      keypoints.push(0); // Ensure length is always 1662 (consistent input size)
    }

    // Store keypoints
    sequenceRef.current.push(keypoints);
    if (sequenceRef.current.length > 30) {
      sequenceRef.current.shift(); // Keep only the last 30 frames
    }

    // Run prediction when we have 30 frames of keypoints
    if (sequenceRef.current.length === 30) {
      runPrediction();
    }
  };

  // Run the prediction using the ONNX model
  const runPrediction = async () => {
    if (!sessionRef.current) {
      console.error('ONNX Model not loaded yet');
      return;
    }

    // Flatten the sequence array and convert it to a Float32Array for ONNX model input
    const inputTensor = new ort.Tensor('float32', new Float32Array(sequenceRef.current.flat()), [1, 30, sequenceRef.current[0].length]);

    try {
      const results = await sessionRef.current.run({ [sessionRef.current.inputNames[0]]: inputTensor });
      const predictedLetter = interpretONNXOutput(results);
      if (predictedLetter) {
        setPrediction(predictedLetter);
      }
    } catch (error) {
      console.error('Error running ONNX model:', error);
    }
  };


  const interpretONNXOutput = (results) => {
    const outputTensor = results['output_0'];
    const outputData = outputTensor.data;
  
    const maxIndex = outputData.indexOf(Math.max(...outputData));
  
    // Assuming each object in auslanSigns contains an 'auslan_sign' property with the corresponding sign/letter
    const letters = auslanSigns.map(sign => sign.auslan_sign); // Dynamically extract signs
  
    return letters[maxIndex] || ''; // Return the letter or an empty string if undefined
  };

  // Handle the "Test" button click (open modal, start camera)
  const handleTest = async () => {
    setIsModalOpen(true);
    await loadONNXModel();
    await startCamera();
  };

  // Cleanup: stop camera and holistic instance when closing modal
  const closeModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (holisticInstance.current) {
      holisticInstance.current = null; // Clear holistic instance
    }
    if (cameraInstance.current) {
      cameraInstance.current.stop(); // Stop the camera properly
      cameraInstance.current = null;
    }
    setIsModalOpen(false);
  };

  if (!auslanSigns.length) {
    return <div>Loading...</div>;
  }

  // const handleContinueLesson = (lessonId) => {
  //   // Directly navigate to the lesson details page
  //   navigate(`/lesson/${lessonId}`);
  // };

  return (
    <>
      <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24" id='lessonDetails'>
        <div>
          <NavBar />
        </div>

        <div className="container mx-auto">
          {/* Display clickable list of all Auslan signs */}
          <div className="mb-4">
            <h2 className="text-2xl mb-2 font-bold">Choose a Sign:</h2>
            <ul className="flex space-x-4">
              {auslanSigns.map((sign, index) => (
                <li
                  key={index}
                  className={`cursor-pointer px-4 py-2 border ${selectedSign?.auslan_sign === sign.auslan_sign ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => {
                    if (index <= firstInProgressIndex) {
                      setSelectedSign(sign);
                    }
                  }}
                  style={{
                    opacity: index > firstInProgressIndex ? 0.5 : 1,  // Gray out the buttons after the first 'In Progress'
                    pointerEvents: index > firstInProgressIndex ? 'none' : 'auto' // Disable interaction for grayed-out buttons
                  }}
                >
                  {sign.auslan_sign}
                </li>
              ))}
            </ul>
          </div>

          {/* Display the selected sign's details */}
          {selectedSign && (
            <div>
              <div className="flex items-center justify-between mb-4">
                {/* Image on the left */}
                <div className="w-1/2">
                  <img src={selectedSign.image_url} alt={selectedSign.auslan_sign} className="w-full mb-4" />
                </div>

                {/* Video on the right */}
                <div className="w-1/2">
                  <video key={selectedSign.auslan_sign} controls className="w-full">
                    <source src={selectedSign.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* "Test" button */}
              <div className="flex justify-end">
                <button
                  onClick={handleTest}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Camera Feed and Prediction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg relative">
            <h2 className="text-2xl mb-2 font-bold">Sign Language Prediction</h2>
            <p>Allow access to camera for prediction.</p>
            <video ref={videoRef} autoPlay muted className="w-full h-auto mb-4"></video>
            <p>Prediction: {prediction}</p>
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default LessonDetails;



// const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/get_lesson_details?lesson_id=${lesson_id}`);