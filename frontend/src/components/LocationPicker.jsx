import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css'; 

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map center when position changes
// This is needed because just changing the Marker position doesn't move the map view.
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15); 
    }, [center, map]);
    return null;
}

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
            <Popup minWidth={90}><span>Selected Location</span></Popup>
        </Marker>
    )
}

const LocationPicker = ({ isOpen, onClose, onSelectLocation }) => {
    const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });
    
    //search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // function to handle search submit
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            // no money for google maps api :( 
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                setPosition({ 
                    lat: parseFloat(data[0].lat), 
                    lng: parseFloat(data[0].lon) 
                });
            } else {
                alert("Location not found. Please try a different spelling.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search location.");
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="location-modal-overlay">
            
            <div className="location-modal" style={{ width: '90vw', height: '85vh', maxWidth: '1000px', display: 'flex', flexDirection: 'column' }}>
                
                <div className="modal-header">
                    <h3>Select Delivery Location</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                    {/* Search Bar */}
                <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search area, building, or street (e.g., Banani, BUET)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
                        />
                        <button 
                            type="submit" 
                            style={{ padding: '12px 25px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>
                
                {/* map area */}
                <div className="map-container" style={{ flex: 1, width: '100%', minHeight: '0' }}>
                    <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <MapUpdater center={position} /> 
                        
                        <DraggableMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>

                <div className="modal-footer" style={{ marginTop: 'auto' }}>
                    <p className="coords-preview"> Selected: Drag pin to exact spot</p>
                    <button 
                        className="confirm-location-btn"
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