let leafletMap = null;
let markerLayer = null;

// IBM Carbon Palette for markers
const CATEGORY_COLORS = {
  technical:     "#0f62fe", // IBM Blue 60
  non_technical: "#da1e28", // IBM Red/Magenta
  unknown:       "#8d8d8d"  // IBM Gray
};

async function loadMap() {
  if (!leafletMap) {
    leafletMap = L.map("map", { zoomControl: true }).setView([54.2, -3.5], 6);
    
    // Clean, light basemap to match the glass UI
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; CARTO',
      maxZoom: 18
    }).addTo(leafletMap);
  }

  if (markerLayer) { markerLayer.clearLayers(); }
  else { markerLayer = L.layerGroup().addTo(leafletMap); }

  const data = await fetchJSON("/map", activeFilters);

  let totalPosts = 0, techCount = 0, posCount = 0;
  const unis = new Set();

  data.forEach(point => {
    const color = CATEGORY_COLORS[point.category] || "#a1a1aa";
    const radius = Math.min(7 + point.post_count * 2.5, 30);
    totalPosts += point.post_count;
    unis.add(point.university);
    if (point.category === "technical") techCount++;
    if (point.avg_sentiment === "positive") posCount++;

    L.circleMarker([point.lat, point.lon], {
      radius, fillColor: color, color: "#ffffff",
      weight: 2, opacity: 1, fillOpacity: 0.9
    })
    .bindPopup(`
      <div style="font-family:'IBM Plex Sans',sans-serif; min-width:200px; line-height:1.5;">
        <div style="font-size:1.1rem; font-weight:600; color:#f4f4f4; margin-bottom:2px">${point.university}</div>
        <div style="font-size:0.8rem; color:#c6c6c6; margin-bottom:8px">${point.region} &middot; ${point.country}</div>
        <hr style="border:none; border-top:1px solid rgba(255,255,255,0.15); margin:8px 0"/>
        <div style="font-size:0.85rem; color:#f4f4f4;">
          <b>Posts:</b> ${point.post_count}<br/>
          <b>Type:</b> ${point.category.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}<br/>
          <b>Sentiment:</b> ${point.avg_sentiment.replace(/\b\w/g,c=>c.toUpperCase())}
        </div>
      </div>
    `, { maxWidth: 260 })
    .addTo(markerLayer);
  });

  // Update KPI cards
  document.getElementById("kpi-total").textContent = totalPosts.toLocaleString();
  document.getElementById("kpi-unis").textContent = unis.size;
  document.getElementById("kpi-tech").textContent = techCount;
  document.getElementById("kpi-sentiment").textContent =
    data.length ? Math.round(posCount / data.length * 100) + "%" : "—";
    
  // Load top universities bar chart
  loadTopUnisChart();
}

document.addEventListener("DOMContentLoaded", loadMap);