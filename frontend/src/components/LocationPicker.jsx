import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle click events on the map
function DraggableMarker({ position, setPosition }) {
    const markerRef = useRef(null)
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return (
        <Marker
            draggable={true}
            eventHandlers={{
                dragend: () => {
                    const marker = markerRef.current
                    if (marker != null) {
                        setPosition(marker.getLatLng())
                    }
                },
            }}
            position={position}
            ref={markerRef}
        >
            <Popup minWidth={90}>
                <span>Selected Location</span>
            </Popup>
        </Marker>
    )
}

const LocationPicker = ({ isOpen, onClose, onSelectLocation }) => {
    // Default to Dhaka coordinates
    const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });

    if (!isOpen) return null;

    return (
        <div className="location-modal-overlay">
            <div className="location-modal">
                <div className="modal-header">
                    <h3>Select Delivery Location</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                
                <div className="map-container">
                    <MapContainer 
                        center={[23.8103, 90.4125]} 
                        zoom={13} 
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <DraggableMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>

                <div className="modal-footer">
                    <p>Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}</p>
                    <button 
                        className="confirm-btn"
                        onClick={() => {
                            onSelectLocation(position);
                            onClose();
                        }}
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;