import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import * as ort from 'onnxruntime-web'; // ONNX Runtime for running the model
import { Camera } from '@mediapipe/camera_utils'; // Import Camera correctly from mediapipe
import { Holistic } from '@mediapipe/holistic'; // Mediapipe Holistic import
import { getCookie } from '../components/CookieManage';
import {useDocTitle} from '../components/CustomHook';
import signImageFrame from '../images/signImageFrame.png';

const LessonDetails = () => {
  useDocTitle('Lesson - Sign-Connect');
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

  // New state variable for the success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Fetch Auslan signs using the lesson_id from the route params
    const fetchSigns = async () => {
      const response = await fetch(
        `https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/get_lesson_details?lesson_id=${lesson_id}&user_id=${getCookie(
          'userId'
        )}`
      );
      const data = await response.json();
      setAuslanSigns(data);
      setSelectedSign(data[0]);
    };
    fetchSigns();
  }, [lesson_id]);

  // UseEffect to handle the success popup timer
  useEffect(() => {
    let timer;
    if (isModalOpen) {
      console.log('Modal is open, setting timer for success popup.');
      timer = setTimeout(() => {
        console.log('Timer expired, closing modal and showing success popup.');
        // Stop the camera
        stopCamera();
        // Close the modal
        setIsModalOpen(false);
        // Show the success popup
        setShowSuccessPopup(true);
      }, 8000); // 8 seconds
    }
    return () => {
      clearTimeout(timer); // Clean up the timer
    };
  }, [isModalOpen]);

  // Function to stop the camera and clean up
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
        console.log('Track stopped:', track);
      });
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null; // Clear video element
      console.log('Video element srcObject cleared.');
    }
    if (holisticInstance.current) {
      holisticInstance.current = null; // Clear holistic instance
      console.log('Holistic instance cleared.');
    }
    if (cameraInstance.current) {
      cameraInstance.current.stop(); // Stop the camera properly
      cameraInstance.current = null;
      console.log('Camera instance stopped.');
    }
  };

  // Select the ONNX model based on the lesson_id
  const getModelPath = () => {
    if (lesson_id === 8) return "/action_verbs.onnx";
    if (lesson_id === 9) return "/descr_adj.onnx";
    if (lesson_id === 10) return "/feel_emot_ques.onnx";
    if (lesson_id === 11) return "/nouns.onnx";
    if (lesson_id === 12) return "/freq.onnx";
    if (lesson_id === 13) return "/time_pos_dir.onnx";
    // Default model for lessons 1-7 or any other lesson
    return "/model.onnx";
  };

    // Load the ONNX model dynamically based on lesson_id
    const loadONNXModel = async () => {
      try {
        const modelPath = getModelPath(); // Get the appropriate model path
        const session = await ort.InferenceSession.create(modelPath);
        sessionRef.current = session;
        console.log(`ONNX Model for lesson ${lesson_id} loaded from ${modelPath}`);
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
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
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
      cameraInstance.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (holisticInstance.current && videoRef.current) {
            await holistic.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraInstance.current.start();
    } catch (error) {
      console.error('Error accessing the camera: ', error);
    }
  };

  // Process Mediapipe results and extract keypoints
  const onResults = (results) => {
    const keypoints = [];

    // Extract pose keypoints
    if (results.poseLandmarks) {
      results.poseLandmarks.forEach((landmark) =>
        keypoints.push(landmark.x, landmark.y, landmark.z, landmark.visibility)
      );
    }

    // Extract face keypoints
    if (results.faceLandmarks) {
      results.faceLandmarks.forEach((landmark) =>
        keypoints.push(landmark.x, landmark.y, landmark.z)
      );
    }

    // Extract left hand keypoints
    if (results.leftHandLandmarks) {
      results.leftHandLandmarks.forEach((landmark) =>
        keypoints.push(landmark.x, landmark.y, landmark.z)
      );
    }

    // Extract right hand keypoints
    if (results.rightHandLandmarks) {
      results.rightHandLandmarks.forEach((landmark) =>
        keypoints.push(landmark.x, landmark.y, landmark.z)
      );
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
    const inputTensor = new ort.Tensor(
      'float32',
      new Float32Array(sequenceRef.current.flat()),
      [1, 30, sequenceRef.current[0].length]
    );

    try {
      const results = await sessionRef.current.run({
        [sessionRef.current.inputNames[0]]: inputTensor,
      });
      const predictedLetter = interpretONNXOutput(results);
      if (predictedLetter) {
        setPrediction(predictedLetter);
      }
    } catch (error) {
      console.error('Error running ONNX model:', error);
    }
  };

  const interpretONNXOutput = (results) => {
    const outputTensor = results[sessionRef.current.outputNames[0]];
    const outputData = outputTensor.data;

    const maxIndex = outputData.indexOf(Math.max(...outputData));

    // Assuming each object in auslanSigns contains an 'auslan_sign' property with the corresponding sign/letter
    const letters = auslanSigns.map((sign) => sign.auslan_sign); // Dynamically extract signs

    return letters[maxIndex] || ''; // Return the letter or an empty string if undefined
  };

  // Handle the "Test" button click (open modal, start camera)
  const handleTest = async () => {
    setIsModalOpen(true);
    await loadONNXModel();
    await startCamera();
  };

  // Modify the closeModal function
  const closeModal = () => {
    console.log('closeModal called');
    stopCamera();
    setIsModalOpen(false);
    setShowSuccessPopup(false); // Reset the success popup
  };

  // Handle the success popup close
  const handleSuccessPopupClose = async () => {
    console.log('handleSuccessPopupClose called');

    // Stop the camera just in case
    stopCamera();

    // Send API request to update lesson status
    try {
      await fetch(
        'https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/completed_a_lesson',
        {
          method: 'POST', // or 'PUT', depending on your API design
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: getCookie('userId'),
            lesson_id: parseInt(lesson_id, 10),
          }),
        }
      );
      console.log('Lesson status updated successfully.');
    } catch (error) {
      console.error('Error updating lesson status:', error);
    }

    // Close the success popup
    setShowSuccessPopup(false);

    // Reload the page
    window.location.reload();
  };

  if (!auslanSigns.length) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div
        className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24"
        id="lessonDetails"
      >
        <div>
          <NavBar />
        </div>

        <div className="container mx-auto">
          {/* Display clickable list of all Auslan signs */}
          <div className="mb-4">
            <h2 className="text-2xl mb-2 font-bold">Click on the sign you wish to learn:</h2>
            <ul className="flex space-x-4">
              {auslanSigns.map((sign, index) => (
                <li
                  key={index}
                  className={`cursor-pointer px-4 py-2 border ${
                    selectedSign?.auslan_sign === sign.auslan_sign
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                  onClick={() => setSelectedSign(sign)}
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
                <div className="w-1/2 flex justify-center items-center">
                <img src={signImageFrame} className="absolute min-w-[200px] w-2/5 h-auto mb-4"/>
                  <img
                    src={selectedSign.image_url}
                    alt={selectedSign.auslan_sign}
                    className="min-w-[150px] w-2/3 h-auto mb-4"
                  />
                </div>

                {/* Video on the right */}
                <div className="w-1/2">
                  <video
                    key={selectedSign.auslan_sign}
                    controls
                    className="w-full"
                  >
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
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-auto mb-4"
            ></video>
            <p className="text-2xl font-bold">Prediction: {prediction}</p>
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Popup after 8 seconds */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg relative">
            <h2 className="text-2xl mb-2 font-bold">Well done!</h2>
            <p>Please proceed with the next sign.</p>
            <button
              onClick={handleSuccessPopupClose}
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
