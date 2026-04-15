import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A component to automatically fit the map bounds to our data
const MapBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const validPoints = points.filter(p => p.latitude && p.longitude);
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [points, map]);
  return null;
};

const InteractiveMap = ({ activeFilter, onMarkerClick }) => {
  // We manipulate this dummy data slightly to simulate the filter changes visually
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        let url = '/api/map/';
        if (activeFilter !== 'Overall Map') {
          url += `?category=${encodeURIComponent(activeFilter)}`;
        }
        const res = await axios.get(url);
        setGeoData(res.data);
      } catch (err) {
        console.error("Error fetching map data:", err);
      }
    };

    fetchMapData();
  }, [activeFilter]);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'inherit', overflow: 'hidden' }}>
      <MapContainer 
        center={[53.0, -2.0]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* We use a stunning minimalist, white-themed map tile layer (CartoDB Positron) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {geoData.map((pt, i) => (
          pt.latitude && pt.longitude && (
          <CircleMarker 
            key={i}
            center={[pt.latitude, pt.longitude]}
            radius={Math.max(10, Math.min(pt.post_count / 10, 40))}
            fillColor="#B80B0B"
            color="white"
            weight={2}
            opacity={1}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => onMarkerClick(pt.university),
            }}
          >
             <Popup
              className="apple-popup"
             >
               <div style={{ fontFamily: 'Inter, sans-serif' }}>
                 <strong style={{ fontSize: '1rem', color: '#1d1d1f' }}>{pt.university}</strong>
                 <div style={{ fontSize: '0.9rem', color: '#86868b', marginTop: '4px' }}>
                   Click marker to view posts
                 </div>
                 <div style={{ marginTop: '8px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(184, 11, 11, 0.1)', color: '#B80B0B', fontWeight: 600, display: 'inline-block' }}>
                   {pt.post_count} Engagements
                 </div>
                 <div style={{ marginTop: '12px' }}>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       onMarkerClick(pt.university);
                     }}
                     style={{
                       background: '#B80B0B',
                       color: 'white',
                       border: 'none',
                       borderRadius: '6px',
                       padding: '6px 12px',
                       fontSize: '0.9rem',
                       cursor: 'pointer',
                       width: '100%',
                       fontWeight: 500,
                       transition: 'background 0.2s'
                     }}
                     onMouseOver={(e) => e.target.style.background = '#8A0808'}
                     onMouseOut={(e) => e.target.style.background = '#B80B0B'}
                   >
                     View Activity
                   </button>
                 </div>
               </div>
              </Popup>
           </CircleMarker>
          )
        ))}
        <MapBounds points={geoData} />
      </MapContainer>

      {/* Inject small global CSS tweak for map popup to look premium */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .leaflet-popup-tip {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
      `}} />
    </div>
  );
};

export default InteractiveMap;
