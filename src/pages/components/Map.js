import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet
const L = dynamic(() => import('leaflet'), { ssr: false });

// Import Leaflet CSS
if (typeof window !== 'undefined') {
  import('leaflet/dist/leaflet.css');
}

// Fix default icon paths
let defaultIconPatched = false;
const patchDefaultIcon = () => {
  if (defaultIconPatched) return;
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  defaultIconPatched = true;
};

const Map = ({ latitude, longitude, ipAddress, city, country }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard against SSR

    const initializeMap = async () => {
      const Leaflet = await L; // Dynamically imported Leaflet

      patchDefaultIcon();

      if (!mapRef.current) {
        const map = Leaflet.map('map').setView([latitude || 0, longitude || 0], 10);
        mapRef.current = map;

        Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        markerRef.current = Leaflet.marker([latitude, longitude]).addTo(map);
      } else {
        // Update the map
        mapRef.current.setView([latitude, longitude], 10);

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = Leaflet.marker([latitude, longitude]).addTo(mapRef.current);
        }
      }

      if (markerRef.current) {
        markerRef.current.bindPopup(`
          <strong>IP Address:</strong> ${ipAddress}<br>
          <strong>Location:</strong> ${city}, ${country}
        `).openPopup();
      }
    };

    initializeMap();
  }, [latitude, longitude, ipAddress, city, country]);

  return <div id="map" style={{ height: '100%', width: '100%', zIndex: 0 }} />;
};

export default Map;
