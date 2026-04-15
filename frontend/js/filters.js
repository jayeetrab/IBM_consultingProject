function switchTab(tabName, btn) {
  // Hide all tabs and remove active class from buttons
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  
  // Show target tab and highlight button
  document.getElementById(`tab-${tabName}`).classList.add("active");
  btn.classList.add("active");
  
  // Lazy load data for newly activated tabs
  if (tabName === "timeline") loadTimeline();
  if (tabName === "analytics") loadAnalytics();
}

async function applyFilters() {
  activeFilters = {
    category:  document.getElementById("filter-category").value,
    region:    document.getElementById("filter-region").value,
    date_from: document.getElementById("date-from").value,
    date_to:   document.getElementById("date-to").value,
    sentiment: document.getElementById("filter-sentiment").value,
  };
  showToast("Applying filters...");
  await Promise.all([loadMap(), loadTimeline(), loadAnalytics()]);
}

// NEW: Guided Explore Logic
async function runGuidedExplore(objective) {
  // 1. Reset all DOM filters first
  document.getElementById("filter-category").value = "";
  document.getElementById("filter-region").value = "";
  document.getElementById("filter-sentiment").value = "";
  document.getElementById("date-from").value = "";
  document.getElementById("date-to").value = "";

  // 2. Apply specific rules based on the chosen objective
  if (objective === "tech-hubs") {
    document.getElementById("filter-category").value = "technical";
    document.getElementById("filter-sentiment").value = "positive";
    switchTab("map", document.getElementById("btn-tab-map"));
    showToast("🔍 Finding Top Tech Hubs...");
  } 
  else if (objective === "sentiment-risk") {
    document.getElementById("filter-sentiment").value = "negative";
    switchTab("analytics", document.getElementById("btn-tab-analytics"));
    showToast("⚠ Analyzing Negative Sentiment Risks...");
  } 
  else if (objective === "recent-activity") {
    // Assuming you want the last 30 days, we could set dates here if needed.
    switchTab("timeline", document.getElementById("btn-tab-timeline"));
    showToast("⏱ Viewing Recent Timeline Activity...");
  }
  else if (objective === "reset") {
    document.getElementById("guided-explore").value = "";
    showToast("Filters reset.");
  }

  // 3. Fire off the API call with the new filter settings
  await applyFilters();
}