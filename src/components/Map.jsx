import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, GeoJSON, useMap, useMapEvents, FeatureGroup, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { TextField, Autocomplete, IconButton, Card, CardContent, Typography, Slider, Popover, Box, Button } from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import StraightenIcon from '@mui/icons-material/Straighten';
import PanToolIcon from '@mui/icons-material/PanTool';
import OpacityIcon from '@mui/icons-material/Opacity';
import SearchIcon from '@mui/icons-material/Search';
import L from 'leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import debounce from 'lodash/debounce';

// Define marker icon
const markerIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41]
});

function Map({ basemapUrl, onMarkersChange, uploadedLayers, handleChangeLayerColor }) {
  const position = [-2.5489, 118.0149];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addingMarker, setAddingMarker] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [distance, setDistance] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [zoomCoords, setZoomCoords] = useState(null);
  const [layerOpacities, setLayerOpacities] = useState(uploadedLayers.map(() => 1));
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Fetch search results from API
  const fetchResults = async (query) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const results = await response.json();
    setSearchResults(results);
  };

  const debouncedFetchResults = debounce((query) => {
    fetchResults(query);
  }, 300);

  useEffect(() => {
    if (searchQuery.length > 2) {
      debouncedFetchResults(searchQuery);
    }
  }, [searchQuery, debouncedFetchResults]);

  useEffect(() => {
    onMarkersChange(markers);
  }, [markers, onMarkersChange]);

  const handleSelect = (event, value) => {
    if (value) {
      setSelectedResult(value);
      setZoomCoords({ lat: value.lat, lon: value.lon });
    }
  };

  const handleSearch = () => {
    const coordinateMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordinateMatch) {
      const [lat, lon] = [parseFloat(coordinateMatch[1]), parseFloat(coordinateMatch[3])];
      lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
        ? setSelectedResult({ lat, lon })
        : console.error("Coordinates are out of range!");
    } else {
      fetchResults(searchQuery);
    }
  };  

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleAddingMarker = () => {
    setAddingMarker((prev) => !prev);
    if (!addingMarker) {
      setMeasuring(false);
      setDragging(false);
    }
  };

  const toggleMeasuring = () => {
    setMeasuring((prev) => !prev);
    if (!measuring) {
      setMeasurePoints([]);
      setDistance(0);
      setAddingMarker(false);
      setDragging(false);
    }
  };

  const toggleDragging = () => {
    setDragging((prev) => !prev);
    if (!dragging) {
      setAddingMarker(false);
      setMeasuring(false);
    }
  };

  const handleLayerOpacityChange = (index, newValue) => {
    setLayerOpacities((prevOpacities) => {
      const newOpacities = [...prevOpacities];
      newOpacities[index] = newValue;
      return newOpacities;
    });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const MapClickHandler = () => {
    const map = useMap();
    useMapEvents({
      click(event) {
        console.log('Map clicked', event.latlng);
        if (addingMarker) {
          const newMarkers = [...markers, { ...event.latlng, name: '' }];
          setMarkers(newMarkers);
        } else if (measuring) {
          setMeasurePoints((prevPoints) => [...prevPoints, event.latlng]);
          if (measurePoints.length > 0) {
            const lastPoint = measurePoints[measurePoints.length - 1];
            const newDistance = distance + map.distance(lastPoint, event.latlng) / 1000; // Convert to kilometers
            setDistance(newDistance);
          }
        }
      }
    });
    return null;
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedFeature({ ...feature, latlng: { lat, lng } });
      }
    });
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <Card style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, backgroundColor: 'white', padding: '8px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) => option.display_name}
          onChange={handleSelect}
          disableClearable
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search location or coordinates"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              style={{ width: '300px' }}
            />
          )}
        />
        <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={handleSearch}>
          Search
        </Button>
      </Card>
      <Card style={{ position: 'absolute', top: 100 , left: 10, zIndex: 1000, backgroundColor: 'white', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <IconButton color="primary" onClick={toggleAddingMarker} style={{ backgroundColor: addingMarker ? 'lightblue' : 'white' }} title="Add Marker">
          <AddLocationIcon />
        </IconButton>
        <IconButton color="primary" onClick={toggleMeasuring} style={{ backgroundColor: measuring ? 'lightblue' : 'white' }} title="Measure Distance">
          <StraightenIcon />
        </IconButton>
        <IconButton color="primary" onClick={toggleDragging} style={{ backgroundColor: dragging ? 'lightblue' : 'white' }} title="Drag Map">
          <PanToolIcon />
        </IconButton>
        <IconButton color="primary" onClick={handleClick} title="Adjust Opacity">
          <OpacityIcon />
        </IconButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box p={2}>
            <Typography gutterBottom>Layer Opacity</Typography>
            {uploadedLayers.map((layer, index) => (
              <div key={index}>
                <Typography>{layer.name}</Typography>
                <Slider
                  value={layerOpacities[index] || 1}
                  onChange={(event, newValue) => handleLayerOpacityChange(index, newValue)}
                  aria-labelledby={`layer-opacity-slider-${index}`}
                  step={0.1}
                  min={0}
                  max={1}
                  valueLabelDisplay="auto"
                  style={{ width: '200px' }}
                />
              </div>
            ))}
          </Box>
        </Popover>
      </Card>
      <MapContainer center={position} zoom={5} style={{ height: "100%", width: "100%", cursor: addingMarker ? 'pointer' : dragging ? 'grab' : 'default', border: '2px solid black' }}>
        <TileLayer
          url={basemapUrl}
          key={basemapUrl}
          opacity={1}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler />
        {selectedResult && (
          <Marker position={[selectedResult.lat, selectedResult.lon]} icon={markerIcon} />
        )}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} icon={markerIcon} />
        ))}
        {measurePoints.length > 1 && (
          <Polyline positions={measurePoints} color="blue" />
        )}
        {measuring && measurePoints.length > 1 && (
          <Card style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, backgroundColor: 'white', padding: '8px', borderRadius: '8px' }}>
            <CardContent>
              <Typography>Total Distance: {distance.toFixed(2)} km</Typography>
            </CardContent>
          </Card>
        )}
        <FeatureGroup>
          <EditControl
            position="bottomright"
            onCreated={(e) => {
              const { layerType, layer } = e;
              if (layerType === 'marker') {
                const { lat, lng } = layer.getLatLng();
                setMarkers([...markers, { lat, lng, name: '' }]);
              }
            }}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: true,
              polygon: true,
              marker: true,
            }}
          />
        </FeatureGroup>
        {uploadedLayers.map((layer, index) => (
          layer.visible && (
            <GeoJSON
              key={index}
              data={layer.geojson}
              style={{ color: layer.color || '#000000', opacity: layerOpacities[index] || 1 }}
              onEachFeature={onEachFeature}
            />
          )
        ))}
        {selectedFeature && (
          <Popup
            position={selectedFeature.latlng}
            onClose={() => setSelectedFeature(null)}
          >
            <div>
              <h3>Feature Information</h3>
              <pre>{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
            </div>
          </Popup>
        )}
        {zoomCoords && <ZoomToSelectedPlace lat={zoomCoords.lat} lon={zoomCoords.lon} />}
      </MapContainer>
    </div>
  );
}

// Component to zoom to selected place
const ZoomToSelectedPlace = ({ lat, lon }) => {
  useZoomToSelectedPlace(lat, lon);
  return null;
};

// Hook to zoom to selected place
const useZoomToSelectedPlace = (lat, lon) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 13);
    }
  }, [lat, lon, map]);
};

export default Map;
