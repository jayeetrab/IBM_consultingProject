const API_BASE = "/api";

let activeFilters = {
  category: "", region: "", date_from: "", date_to: "", sentiment: ""
};

async function fetchJSON(endpoint, params = {}) {
  const url = new URL(API_BASE + endpoint, window.location.origin);
  Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    showToast(`⚠ API error: ${err.message}`);
    return [];
  }
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

async function triggerIngest() {
  showToast("⚡ Ingestion started — this runs in the background.");
  try {
    const res = await fetch(`${API_BASE}/ingest/trigger`, { method: "POST" });
    const data = await res.json();
    showToast(`✅ ${data.message}`);
  } catch (e) {
    showToast("❌ Ingestion trigger failed.");
  }
}