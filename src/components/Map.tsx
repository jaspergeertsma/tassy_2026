
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Stay } from '../types';

// Fix Leaflet icon issue in Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    stays: Stay[];
}

const Map: React.FC<MapProps> = ({ stays }) => {
    const position: [number, number] = [-42.0, 147.0]; // Center Tasmania approx

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '400px' }}>
            <MapContainer center={position} zoom={7} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {stays.map((stay) => (
                    <Marker
                        key={stay.id}
                        position={stay.coordinates}
                    >
                        <Popup>
                            <strong>{stay.name}</strong><br />
                            {stay.location}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
