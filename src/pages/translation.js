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
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Added state variables for unique words and translations
  const [uniqueWords, setUniqueWords] = useState(new Set());
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Set the camera status to on
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing the camera: ', error);
    }
  };

  // Stop the camera
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
    // Set camera status to off
    setIsCameraOn(false);
  };

  // Process Mediapipe results and extract keypoints
  const onResults = (results) => {
    console.log('Mediapipe Results:', results); // Debug
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

    const inputTensor = new ort.Tensor(
      'float32',
      new Float32Array(sequenceRef.current.flat()),
      [1, 30, sequenceRef.current[0].length]
    );

    try {
      const results = await sessionRef.current.run({
        [sessionRef.current.inputNames[0]]: inputTensor
      });
      const predictedWord = interpretONNXOutput(results);
      console.log('Predicted Word:', predictedWord); // Debug
      if (predictedWord) {
        setPrediction(predictedWord); // Update prediction state
        addUniqueWord(predictedWord); // Aggregate unique words
      }
    } catch (error) {
      console.error('Error running ONNX model:', error);
    }
  };

  const interpretONNXOutput = (results) => {
    console.log('ONNX Results:', results); // Debug
    const outputTensor = results['output_0'];
    if (!outputTensor) {
      console.error('Output tensor "output_0" not found');
      return '';
    }
    const outputData = outputTensor.data;

    const maxIndex = outputData.indexOf(Math.max(...outputData));
    const words = ["because", "how_many", "idea", "laughter", "mind", "not_care", "or", "pain", "pity", "which", "why", "why-not", "word"]; // Ensure this matches your model's classes

    return words[maxIndex] || '';
  };

  // Add unique words and limit to 3-4 words before translating
  const addUniqueWord = (word) => {
    setUniqueWords((prevWords) => {
      const newWords = new Set(prevWords);
      newWords.add(word);

      console.log('Unique Words:', newWords); // Debug

      // Translate words when 3 or 4 unique words are collected
      if (newWords.size === 3 || newWords.size === 4) {
        const wordsToTranslate = [...newWords]; // Create a copy as an array
        translateWords(wordsToTranslate); // Pass the copied array
        newWords.clear(); // Clear the original set after copying
      }

      return newWords;
    });
  };

  // Call OpenAI's API to translate unique words into a meaningful sentence
  const translateWords = async (wordsArray) => {
    console.log('Translating Words:', wordsArray); // Debug
    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`,  // Ensure correct format
        },
        body: JSON.stringify({
          model: 'gpt-4',  // Or 'gpt-4' for GPT-4
          messages: [
            {
              "role": "system",
              "content": "You are a helpful assistant that creates meaningful sentences from a list of words."
            },
            {
              "role": "user",
              "content": `Here are the unique words recognized by the sign language recognition model: ${wordsArray.join(', ')}. Make them into a meaningful sentence as if you were translating them into English.`,
            }
          ],
          max_tokens: 100,
        }),
      });

      console.log('OpenAI API Response Status:', response.status); // Debug

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenAI API Response Data:', data); // Debug

      // Check if the data has the expected structure
      if (data.choices && data.choices.length > 0) {
        setTranslatedText(data.choices[0].message.content.trim());  // Get the first response choice and display it
        console.log('Translated Text:', data.choices[0].message.content.trim()); // Debug
      } else {
        throw new Error('Unexpected response format from OpenAI API');
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle starting the camera and loading the ONNX model
  const handleTest = async () => {
    await loadONNXModel();
    await startCamera();
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
              <video controls autoPlay className="w-full">
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

            {/* Stop Camera Button (appears after the camera is started) */}
            {isCameraOn && (
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white px-6 py-3 rounded-lg ml-4"
                >
                  Stop Camera
              </button>
            )}

            <div className="mt-6">
              <video ref={videoRef} autoPlay muted className="mx-auto w-full max-w-lg h-auto"></video>
              <p className="mt-4 text-xl font-bold">Prediction: {prediction || 'Waiting for input...'}</p>

              {/* Loading Indicator */}
              {loading && (
                <p className="mt-4 text-xl font-bold">Translating...</p>
              )}

              {/* Display Translated Text */}
              {translatedText && (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold">Possible Translation:</h2>
                  <div className="p-4 bg-green-100 rounded">{translatedText}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TranslatorPage;
