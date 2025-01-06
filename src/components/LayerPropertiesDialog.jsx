import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { SketchPicker } from 'react-color';

function LayerPropertiesDialog({ open, onClose, layer, onChangeColor }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Layer Properties</DialogTitle>
      <DialogContent>
        <SketchPicker
          color={layer.color || '#000000'}
          onChangeComplete={(color) => onChangeColor(layer.index, color.hex)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LayerPropertiesDialog;
