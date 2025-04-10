import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyXXXXX",
  authDomain: "home-automation-66846.firebaseapp.com",
  databaseURL: "https://home-automation-66846-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "home-automation-66846",
  storageBucket: "home-automation-66846.appspot.com",
  messagingSenderId: "740225547064",
  appId: "1:740225547064:web:208b52dffd76e0c86cdfcd"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const imgRef = useRef(null);

  useEffect(() => {
    const fileRef = ref(database, "file_list");
    const urlRef = ref(database, "stream_url");
    const streamTriggerRef = ref(database, "stream_trigger");

    const unsubFiles = onValue(fileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allFiles = data.split("|").filter(Boolean);
        const imgs = allFiles.filter(f => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png"));
        const vids = allFiles.filter(f => f.endsWith(".mp4") || f.endsWith(".mov") || f.endsWith(".webm"));
        setImages(imgs);
        setVideos(vids);
        setIsConnected(true);
      } else {
        setImages([]);
        setVideos([]);
        setIsConnected(false);
      }
    });

    const unsubUrl = onValue(urlRef, (snapshot) => {
      const url = snapshot.val();
      setStreamUrl(url || "");
      if (url) {
        setStreamKey(prev => prev + 1);
      }
    });

    const unsubTrigger = onValue(streamTriggerRef, (snapshot) => {
      const triggerValue = snapshot.val();
      setIsStreaming(triggerValue === 1);
    });

    return () => {
      unsubFiles();
      unsubUrl();
      unsubTrigger();
    };
  }, []);

  const toggleStream = () => {
    const streamTriggerRef = ref(database, "stream_trigger");
    set(streamTriggerRef, isStreaming ? 0 : 1);
  };

  const refreshStream = () => {
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = '';
      setTimeout(() => {
        imgRef.current.src = currentSrc.includes('?') 
          ? `${currentSrc}&t=${Date.now()}` 
          : `${currentSrc}?t=${Date.now()}`;
      }, 100);
    }
    setStreamKey(prev => prev + 1);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800 font-sans">
      <h1 className="text-3xl font-bold mb-4">📁 Home Automation</h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <p className="text-sm">Firebase: {isConnected ? "Connected" : "Disconnected"}</p>
      </div>

      {/* === Stream Section === */}
      <div className="mb-8 p-4 bg-white rounded-2xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">🎥 Live Stream</h2>
          <div className="flex space-x-2">
            <button
              onClick={refreshStream}
              className="px-3 py-2 rounded-xl text-white font-medium shadow transition bg-blue-500 hover:bg-blue-600"
            >
              🔄 Refresh
            </button>
            <button
              onClick={toggleStream}
              className={`px-4 py-2 rounded-xl text-white font-medium shadow transition ${
                isStreaming ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isStreaming ? "Stop Stream" : "Start Stream"}
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden">
          {isStreaming && streamUrl ? (
            <>
              <div className="relative w-full bg-black rounded-xl overflow-hidden">
                <iframe
                  key={`stream-${streamKey}`}
                  src={streamUrl}
                  title="Live MJPEG Stream"
                  allow="autoplay"
                  className="w-full h-[400px] rounded-xl border-0"
                  frameBorder="0"
                  onError={() => {
                    setTimeout(refreshStream, 2000);
                  }}
                ></iframe>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Stream URL: <a href={streamUrl} target="_blank" rel="noopener noreferrer" className="underline">{streamUrl}</a>
              </div>
            </>
          ) : (
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Stream is currently inactive.</p>
                {!isStreaming && (
                  <button
                    onClick={toggleStream}
                    className="px-4 py-2 rounded-xl text-white font-medium shadow transition bg-green-500 hover:bg-green-600"
                  >
                    Start Stream
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === Image Gallery === */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🖼️ Image Gallery</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-2 transition hover:shadow-md">
                <div className="relative pt-[75%] overflow-hidden rounded-lg">
                  <img 
                    src={img} 
                    alt={`img-${index}`} 
                    className="absolute top-0 left-0 w-full h-full object-cover" 
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {img.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">No images captured yet.</p>
          </div>
        )}
      </div>

      {/* === Video Gallery === */}
      <div>
        <h2 className="text-xl font-semibold mb-2">📹 Video Gallery</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-3 transition hover:shadow-md">
                <video 
                  controls 
                  className="w-full rounded-lg bg-black"
                  poster={`${vid.substring(0, vid.lastIndexOf('.'))}.jpg`}
                >
                  <source src={vid} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-sm text-gray-500 truncate">
                  {vid.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">No videos recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
