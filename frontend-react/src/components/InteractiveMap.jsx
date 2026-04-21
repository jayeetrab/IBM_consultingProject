import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

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
        const res = await api.get(url);
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

        {geoData.map((pt, i) => {
          const color = pt.engagement_type === 'technical' ? '#0f62fe' :
            pt.engagement_type === 'non_technical' ? '#fa4d56' : '#8d8d8d';

          return pt.latitude && pt.longitude && (
            <CircleMarker
              key={i}
              center={[pt.latitude, pt.longitude]}
              radius={Math.max(10, Math.min(pt.post_count / 10, 40))}
              fillColor={color}
              color="white"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
              eventHandlers={{
                click: () => onMarkerClick(pt.university),
              }}
            >
              <Popup className="apple-popup">
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '1rem', color: '#1d1d1f' }}>{pt.university}</strong>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: `${color}20`, color: color, textTransform: 'uppercase' }}>
                      {pt.engagement_type || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#86868b', marginTop: '4px' }}>
                    Region: {pt.region}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Volume:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pt.post_count} posts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trend:</span>
                      <span style={{ fontSize: '0.8rem', color: pt.avg_sentiment === 'positive' ? '#34c759' : '#fa4d56' }}>
                        {(pt.avg_sentiment || 'neutral').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick(pt.university);
                    }}
                    style={{
                      marginTop: '12px',
                      background: color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '100%',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Drill into Posts
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
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

      {/* Modern Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        zIndex: 1000,
        border: '1px solid rgba(255,255,255,0.4)',
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Engagement Taxonomy
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f62fe' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1d1d1f' }}>Technical Engagement</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fa4d56' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1d1d1f' }}>Non-Technical / Outreach</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8d8d8d' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1d1d1f' }}>General / Unknown</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
