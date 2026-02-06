
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Stay } from '../types';

interface MapProps {
    stays: Stay[];
}

const Map: React.FC<MapProps> = ({ stays }) => {
    // Center of Tasmania
    const center: [number, number] = [-42.0409, 146.8087];

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '100%' }}>
            <MapContainer
                center={center}
                zoom={7}
                style={{ height: '100%', width: '100%', background: '#1F1D1B' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {stays.map((stay) => (
                    <CircleMarker
                        key={stay.id}
                        center={stay.coordinates}
                        pathOptions={{
                            color: '#D4A03D',
                            fillColor: '#D4A03D',
                            fillOpacity: 0.8,
                            weight: 2,
                            radius: 8
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                            <span style={{ fontWeight: 'bold' }}>{stay.name}</span>
                        </Tooltip>
                        <Popup>
                            <div style={{ color: '#1F1D1B', textAlign: 'center' }}>
                                <strong>{stay.name}</strong><br />
                                {stay.location}<br />
                                <span style={{ fontSize: '0.8em', color: '#666' }}>{stay.type}</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
