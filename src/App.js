import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import './App.css';

function App() {
  const [ledStatus, setLedStatus] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Firebase configuration - replace with your own config
    const firebaseConfig = {
      apiKey: "AIzaSyDjspOheSa9WmBbH88MbS56XJoouop0UpA",
      authDomain: "home-automation-66846.firebaseapp.com",
      projectId: "home-automation-66846",
      storageBucket: "home-automation-66846.firebasestorage.app",
      messagingSenderId: "740225547064",
      appId: "1:740225547064:web:208b52dffd76e0c86cdfcd",
      measurementId: "G-EKFSJTZTLC"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const ledRef = ref(database, 'led');

    // Listen for changes to the LED status in Firebase
    onValue(ledRef, (snapshot) => {
      const data = snapshot.val();
      setLedStatus(data === true);
      setIsConnected(true);
    }, (error) => {
      console.error("Firebase connection error:", error);
      setIsConnected(false);
    });
  }, []);

  // Toggle LED status in Firebase
  const toggleLed = () => {
    const database = getDatabase();
    const ledRef = ref(database, 'led');
    set(ledRef, !ledStatus);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>LED Remote Control</h1>
        
        <div className="status-container">
          <div className={`led ${ledStatus ? 'led-on' : 'led-off'}`}></div>
          <p className="status-text">LED is {ledStatus ? 'ON' : 'OFF'}</p>
        </div>
        
        <button 
          className={`toggle-button ${ledStatus ? 'on' : 'off'}`} 
          onClick={toggleLed}
          disabled={!isConnected}
        >
          {ledStatus ? 'Turn OFF' : 'Turn ON'}
        </button>
        
        <div className="connection-status">
          <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <p>Firebase: {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>
    </div>
  );
}

export default App;