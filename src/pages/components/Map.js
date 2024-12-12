import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Patch the default Leaflet icon paths (fix for default marker icons not appearing)
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

const Map = ({ latitude, longitude, ipAddress, city, country }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!mapRef.current) {
            // Initialize the map
            const map = L.map('map').setView([latitude || 0, longitude || 0], 10);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            markerRef.current = L.marker([latitude, longitude]).addTo(map);
        } else if (mapRef.current) {
            // Update map and marker positions
            mapRef.current.setView([latitude, longitude], 10);
            if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
            } else {
                markerRef.current = L.marker([latitude, longitude]).addTo(map);
            }
        }

        if (markerRef.current) {
            markerRef.current.bindPopup(`
                <strong>IP Address:</strong> ${ipAddress}<br>
                <strong>Location:</strong> ${city}, ${country}
            `).openPopup();
        }
    }, [latitude, longitude, ipAddress, city, country]);

    return <div id="map" style={{ height: '100%', width: '100%', zIndex: 0 }} />;
};

export default dynamic(() => Promise.resolve(Map), { ssr: false });
