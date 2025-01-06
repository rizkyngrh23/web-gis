import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, TextField, Button, Card, CardContent, CardActions } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function MarkerList({ markers, onMarkerNameChange, onDeleteAllMarkers }) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState('');

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleEditClick = (index, currentName) => {
    setEditingIndex(index);
    setNewName(currentName);
  };

  const handleSaveClick = (index) => {
    onMarkerNameChange(index, newName);
    setEditingIndex(null);
    setNewName('');
  };

  return (
    <div>
      <IconButton onClick={toggleDrawer} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={toggleDrawer}>
        <List style={{ width: '250px' }}>
          {markers.map((marker, index) => (
            <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
              {editingIndex === index ? (
                <Card style={{ width: '100%' }}>
                  <CardContent>
                    <TextField
                      label="Marker Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" color="primary" onClick={() => handleSaveClick(index)}>
                      Save
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <>
                  <ListItemText
                    primary={marker.name || `Marker ${index + 1}`}
                    secondary={`Lat: ${marker.lat.toFixed(4)}, Lng: ${marker.lng.toFixed(4)}`}
                  />
                  <IconButton onClick={() => handleEditClick(index, marker.name || `Marker ${index + 1}`)}>
                    <EditIcon />
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onClick={onDeleteAllMarkers}
          style={{ margin: '16px' }}
        >
          Delete All Markers
        </Button>
      </Drawer>
    </div>
  );
}

export default MarkerList;
