import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import "./App.css";

// ✅ Firebase Config
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
  const [ledStatus, setLedStatus] = useState("OFF");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ledRef = ref(database, "led");

    // ✅ Realtime Listener for LED Status
    const unsubscribe = onValue(ledRef, (snapshot) => {
      const data = snapshot.val();
      setLedStatus(data === "ON" ? "ON" : "OFF");
      setIsConnected(true);
    }, (error) => {
      console.error("Firebase connection error:", error);
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Toggle LED status and sync with Firebase
  const toggleLed = () => {
    const ledRef = ref(database, "led");
    set(ledRef, ledStatus === "ON" ? "OFF" : "ON");
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>LED Remote Control</h1>
        
        <div className="status-container">
          <div className={`led ${ledStatus === "ON" ? 'led-on' : 'led-off'}`}></div>
          <p className="status-text">LED is {ledStatus}</p>
        </div>
        
        <button
          className={`toggle-button ${ledStatus === "ON" ? 'on' : 'off'}`}
          onClick={toggleLed}
          disabled={!isConnected}
        >
          {ledStatus === "ON" ? "Turn OFF" : "Turn ON"}
        </button>
        
        <div className="connection-status">
          <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <p>Firebase: {isConnected ? "Connected" : "Disconnected"}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
