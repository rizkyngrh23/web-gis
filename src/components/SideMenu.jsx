import React, { useState } from 'react';
import { Button, Menu, MenuItem, Divider, Avatar, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Checkbox } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import EditIcon from '@mui/icons-material/Edit';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { LoginDialog, RegisterDialog } from './Auth';
import LayerPropertiesDialog from './LayerPropertiesDialog';

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.toUpperCase();
};

function SideMenu({ onBasemapChange, loggedIn, profileName, profileEmail, profilePicture, onLogin, onLogout, setProfileName, setProfileEmail, setProfilePicture, clearAllMarkers, uploadedLayers, toggleLayerVisibility, handleFileUpload, handleChangeLayerColor }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [profileInfoOpen, setProfileInfoOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleRegisterOpen = () => {
    setRegisterOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false);
  };

  const handleProfileInfoOpen = () => {
    setProfileInfoOpen(true);
  };

  const handleProfileInfoClose = () => {
    setProfileInfoOpen(false);
  };

  const handleEditProfileOpen = () => {
    setEditProfileOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };

  const handleSaveProfile = () => {
    const updatedUser = { name: profileName, email: profileEmail, profilePicture };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setEditProfileOpen(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLayerRightClick = (event, layer, index) => {
    event.preventDefault();
    setSelectedLayer({ ...layer, index });
    setPropertiesDialogOpen(true);
  };

  const handleFileUploadInternal = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target.result);

        if (!geojson || !geojson.type || (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature')) {
          throw new Error('Invalid GeoJSON object');
        }

        handleFileUpload({ name: file.name, geojson, visible: true });
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
      }
    };

    reader.readAsText(file);
    event.target.value = null; 
  };

  const basemaps = [
    { name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', preview: 'https://a.tile.openstreetmap.org/0/0/0.png' },
    { name: 'Satellite', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', preview: 'https://tiles.opentopomap.org/0/0/0.png' },
    { name: 'Esri WorldStreetMap', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', preview: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/0/0/0' },
    { name: 'Esri WorldImagery', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', preview: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/0/0/0' },
    { name: 'CartoDB Positron', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', preview: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/0/0/0.png' },
    { name: 'CartoDB Dark Matter', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', preview: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/0/0/0.png' }
  ];

  const profileInitials = getInitials(profileName);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '250px' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Button
          aria-controls="basemap-menu"
          aria-haspopup="true"
          onClick={handleClick}
          startIcon={<MapIcon />}
          variant="contained"
          color="primary"
          style={{ width: '100%', height: '50px' }}
        >
          Change Basemap
        </Button>
        <Menu
          id="basemap-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {basemaps.map((basemap, index) => (
            <MenuItem key={index} onClick={() => { onBasemapChange(basemap.url); handleClose(); }}>
              <img src={basemap.preview} alt={`${basemap.name} preview`} style={{ width: '50px', height: '50px', marginRight: '8px' }} />
              {basemap.name}
            </MenuItem>
          ))}
        </Menu>
        <Button
          onClick={clearAllMarkers}
          startIcon={<ClearAllIcon />}
          variant="contained"
          color="secondary"
          style={{ width: '100%', height: '50px', marginTop: '16px' }}
        >
          Clear All Markers
        </Button>
        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6">Layers</Typography>
        <List>
          {uploadedLayers.map((layer, index) => (
            <ListItem key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onContextMenu={(event) => handleLayerRightClick(event, layer, index)}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Checkbox checked={layer.visible} onClick={() => toggleLayerVisibility(index)} />
                <ListItemText primary={layer.name} />
              </div>
            </ListItem>
          ))}
        </List>
        <input
          accept=".geojson,.zip"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileUploadInternal}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" color="primary" component="span" style={{ width: '100%', marginTop: '16px' }}>
            Upload File
          </Button>
        </label>
      </div>
      <Divider />
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', marginBottom: '32px', cursor: 'pointer' }} onClick={loggedIn ? handleProfileInfoOpen : handleProfileOpen}>
        <Avatar alt="Profile Picture" src={loggedIn ? profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}` : ''}>
          {!loggedIn && profileInitials}
        </Avatar>
        <div style={{ marginLeft: '16px', whiteSpace: 'nowrap' }}>
          {loggedIn ? (
            <>
              <Typography variant="h6" noWrap>{profileName}</Typography>
              <Typography variant="body2" color="textSecondary" noWrap>{profileEmail}</Typography>
              <Button onClick={onLogout} color="secondary">Logout</Button>
            </>
          ) : (
            <>
              <Button onClick={handleProfileOpen} color="primary">Login</Button>
              <Button onClick={handleRegisterOpen} color="primary">Register</Button>
            </>
          )}
        </div>
      </div>
      <LoginDialog
        open={profileOpen}
        onClose={handleProfileClose}
        onLogin={onLogin}
        profileEmail={profileEmail}
        setProfileEmail={setProfileEmail}
      />
      <RegisterDialog
        open={registerOpen}
        onClose={handleRegisterClose}
        onRegister={onLogin}
        profileName={profileName}
        setProfileName={setProfileName}
        profileEmail={profileEmail}
        setProfileEmail={setProfileEmail}
      />
      <Dialog open={profileInfoOpen} onClose={handleProfileInfoClose}>
        <DialogTitle>Profile Information</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar alt="Profile Picture" src={profilePicture} style={{ width: '100px', height: '100px', marginBottom: '16px' }} />
            <Typography variant="h6">{profileName}</Typography>
            <Typography variant="body2" color="textSecondary">{profileEmail}</Typography>
            <Button onClick={handleEditProfileOpen} color="primary" startIcon={<EditIcon />}>Edit Profile</Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileInfoClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editProfileOpen} onClose={handleEditProfileClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-picture-upload"
            type="file"
            onChange={handleProfilePictureChange}
          />
          <label htmlFor="profile-picture-upload">
            <Button variant="contained" color="primary" component="span">
              Upload Profile Picture
            </Button>
          </label>
          {profilePicture && <img src={profilePicture} alt="Profile" style={{ marginTop: '16px', width: '100px', height: '100px', borderRadius: '50%' }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditProfileClose} color="primary">Cancel</Button>
          <Button onClick={handleSaveProfile} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      {selectedLayer && (
        <LayerPropertiesDialog
          open={propertiesDialogOpen}
          onClose={() => setPropertiesDialogOpen(false)}
          layer={selectedLayer}
          onChangeColor={handleChangeLayerColor}
        />
      )}
    </div>
  );
}

export default SideMenu;
