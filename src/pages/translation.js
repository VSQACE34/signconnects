import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import * as ort from 'onnxruntime-web';  // ONNX Runtime for running the model
import { Camera } from '@mediapipe/camera_utils'; // Import Camera correctly from mediapipe
import { Holistic } from '@mediapipe/holistic'; // Mediapipe Holistic import

import '../index.css'

const TranslatorPage = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [prediction, setPrediction] = useState('');
  const videoRef = useRef(null); // Camera video reference
  const sessionRef = useRef(null); // ONNX session reference
  const sequenceRef = useRef([]); // Sequence of keypoints for prediction
  const holisticInstance = useRef(null); // Ref for the holistic instance
  const cameraInstance = useRef(null); // Ref for the camera instance

  // Load the ONNX model
  const loadONNXModel = async () => {
    try {
      const session = await ort.InferenceSession.create('/feel_emot_ques.onnx');  // Model path for the demo
      sessionRef.current = session;
      setIsModelLoaded(true);
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

    if (results.poseLandmarks) {
      results.poseLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z, landmark.visibility));
    }
    if (results.faceLandmarks) {
      results.faceLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z));
    }
    if (results.leftHandLandmarks) {
      results.leftHandLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z));
    }
    if (results.rightHandLandmarks) {
      results.rightHandLandmarks.forEach(landmark => keypoints.push(landmark.x, landmark.y, landmark.z));
    }

    while (keypoints.length < 1662) {
      keypoints.push(0); // Ensure length is always 1662 (consistent input size)
    }

    sequenceRef.current.push(keypoints);
    if (sequenceRef.current.length > 30) {
      sequenceRef.current.shift(); // Keep only the last 30 frames
    }

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
    const letters = ['A', 'B', 'C', 'D']; // Replace with dynamic data if necessary

    return letters[maxIndex] || '';
  };

  const handleTest = async () => {
    await loadONNXModel();
    await startCamera();
  };

  // Cleanup: stop camera and holistic instance when closing modal
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (holisticInstance.current) {
      holisticInstance.current = null;
    }
    if (cameraInstance.current) {
      cameraInstance.current.stop();
      cameraInstance.current = null;
    }
  };

  return (
    <>
      <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24" id='translatorPage'>
        <div>
          <NavBar />
        </div>

        <div className="container mx-auto">
          {/* First section: Research and video */}
          <div className="flex flex-col md:flex-row mb-8">
            <div className="w-full md:w-2/3 pr-8">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Sign Language Translation Using AI</h2>
              <p className="text-lg mb-6 leading-relaxed">
                Recent advancements in AI and machine learning have led to significant improvements in sign language translation. 
                Current models are able to recognize individual signs, but the challenge remains in capturing the fluidity of sign language, 
                which includes facial expressions, hand gestures, and even body posture. Our current project aims to build on these advancements 
                to develop a translator that bridges the gap between signers and non-signers, making communication more accessible.
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <video controls className="w-full">
                <source src="/demo_video.mp4" type="video/mp4" />  {/* Placeholder video */}
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Second section: How it works now and future */}
          <div className="mt-8">
            <h3 className="text-3xl font-bold mb-4 underlined-shadow">How It Works Now</h3>
            <p className="text-lg mb-6">
              The current version of the translator uses a pre-trained ONNX model to recognize specific hand gestures associated with 
              emotions and feelings. The model uses real-time input from a camera to predict signs, but its capabilities are still limited 
              in translating complex phrases and sentences. Future iterations of this project will focus on improving contextual understanding 
              and translating full conversations in real time.
            </p>
          </div>

          {/* Third section: Interactive model */}
          <div className="mt-12 text-center">
            <h3 className="text-3xl font-bold mb-6">Try the Sign Language Translator</h3>
            <button
              onClick={handleTest}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200"
            >
              Start Camera and Test
            </button>

            <div className="mt-6">
              <video ref={videoRef} autoPlay muted className="mx-auto w-full max-w-lg h-auto"></video>
              <p className="mt-4 text-xl font-bold">Prediction: {prediction || 'Waiting for input...'}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TranslatorPage;
