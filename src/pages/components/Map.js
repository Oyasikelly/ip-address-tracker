import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

let L; // Declare Leaflet variable

if (typeof window !== 'undefined') {
  L = require('leaflet'); // Dynamically require Leaflet only on the client
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const Map = ({ latitude, longitude, ipAddress, city, country }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapInstanceRef.current === null) {
      // Initialize the map only once
      const map = L.map('map').setView([latitude || 0, longitude || 0], 10);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(` 
          <strong>IP Address:</strong> ${ipAddress}<br>
          <strong>Location:</strong> ${city}, ${country}
        `)
        .openPopup();
    } else if (mapInstanceRef.current) {
      // Update the map when props change
      const map = mapInstanceRef.current;

      map.setView([latitude || 0, longitude || 0], 10);

      if (mapRef.current) {
        map.removeLayer(mapRef.current); // Remove the old marker
      }

      mapRef.current = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`
          <strong>IP Address:</strong> ${ipAddress}<br>
          <strong>Location:</strong> ${city}, ${country}
        `)
        .openPopup();
    }
  }, [latitude, longitude, ipAddress, city, country]);

  return <div id="map" style={{ height: '100%', width: '100%', zIndex: '0' }} />;
};

export default Map;
