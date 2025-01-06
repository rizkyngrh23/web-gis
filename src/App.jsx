import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import SideMenu from './components/SideMenu';
import MarkerList from './components/MarkerList';
import { refreshAccessToken } from './utils/auth';

function App() {
  const [basemapUrl, setBasemapUrl] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const [markers, setMarkers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [uploadedLayers, setUploadedLayers] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const accessToken = localStorage.getItem('accessToken');
    if (userData && accessToken) {
      setProfileName(userData.name);
      setProfileEmail(userData.email);
      setProfilePicture(userData.profilePicture || '');
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch (err) {
        console.error('Failed to refresh access token:', err);
        handleLogout();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBasemapChange = (url) => {
    console.log('Changing basemap to:', url);
    setBasemapUrl(url);
  };

  const handleMarkersChange = (newMarkers) => {
    setMarkers(newMarkers);
  };

  const handleMarkerNameChange = (index, newName) => {
    const updatedMarkers = markers.map((marker, i) => (i === index ? { ...marker, name: newName } : marker));
    setMarkers(updatedMarkers);
  };

  const handleLogin = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setProfileName(userData.name);
      setProfileEmail(userData.email);
      setProfilePicture(userData.profilePicture || '');
      setLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setLoggedIn(false);
    setProfileName('');
    setProfileEmail('');
    setProfilePicture('');
  };

  const handleFileUpload = (layer) => {
    setUploadedLayers((prevLayers) => [...prevLayers, layer]);
  };

  const toggleLayerVisibility = (index) => {
    setUploadedLayers((prevLayers) => {
      const newLayers = [...prevLayers];
      newLayers[index].visible = !newLayers[index].visible;
      return newLayers;
    });
  };

  const handleChangeLayerColor = (index, color) => {
    setUploadedLayers((prevLayers) => {
      const newLayers = [...prevLayers];
      newLayers[index].color = color;
      return newLayers;
    });
  };

  return (
    <div className="App" style={{ display: 'flex' }}>
      <SideMenu
        onBasemapChange={handleBasemapChange}
        loggedIn={loggedIn}
        profileName={profileName}
        profileEmail={profileEmail}
        profilePicture={profilePicture}
        onLogin={handleLogin}
        onLogout={handleLogout}
        setProfileName={setProfileName}
        setProfileEmail={setProfileEmail}
        setProfilePicture={setProfilePicture}
        uploadedLayers={uploadedLayers}
        toggleLayerVisibility={toggleLayerVisibility}
        handleFileUpload={handleFileUpload}
        handleChangeLayerColor={handleChangeLayerColor}
      />
      <Map basemapUrl={basemapUrl} onMarkersChange={handleMarkersChange} uploadedLayers={uploadedLayers} handleChangeLayerColor={handleChangeLayerColor} />
      <MarkerList markers={markers} onMarkerNameChange={handleMarkerNameChange} />
    </div>
  );
}

export default App;