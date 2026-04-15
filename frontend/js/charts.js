const CHART_DEFAULTS = {
  font: { family: "'IBM Plex Sans', system-ui, sans-serif", size: 12 },
  color: "#c6c6c6" // IBM muted-foreground
};

Chart.defaults.font = CHART_DEFAULTS.font;
Chart.defaults.color = CHART_DEFAULTS.color;

// IBM-like clean tooltips
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(22, 22, 22, 0.95)';
Chart.defaults.plugins.tooltip.titleColor = '#f4f4f4';
Chart.defaults.plugins.tooltip.bodyColor = '#c6c6c6';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 4;
Chart.defaults.plugins.tooltip.boxPadding = 6;

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

const gridConfig = { color: "rgba(0, 0, 0, 0.04)" };

// ── Timeline ──────────────────────────────────────────
async function loadTimeline() {
  const data = await fetchJSON("/timeline", activeFilters);
  destroyChart("timeline");
  const dates = [...new Set(data.map(d => d.date))].sort();
  const techData    = dates.map(d => (data.find(r => r.date===d && r.category==="technical")?.post_count) || 0);
  const nonTechData = dates.map(d => (data.find(r => r.date===d && r.category==="non_technical")?.post_count) || 0);
  const unknownData = dates.map(d => (data.find(r => r.date===d && r.category==="unknown")?.post_count) || 0);
  
  chartInstances.timeline = new Chart(document.getElementById("chart-timeline"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        { label: "Technical",     data: techData,    borderColor: "#0f62fe", backgroundColor: "rgba(15, 98, 254, 0.08)",  fill: true, tension: 0.4, pointRadius: 3 },
        { label: "Non-Technical", data: nonTechData, borderColor: "#da1e28", backgroundColor: "rgba(218, 30, 40, 0.05)", fill: true, tension: 0.4, pointRadius: 3 },
        { label: "Unknown",       data: unknownData, borderColor: "#8d8d8d", backgroundColor: "rgba(141, 141, 141, 0.05)", fill: true, tension: 0.4, pointRadius: 3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { usePointStyle: true, pointStyleWidth: 10 } },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: { grid: gridConfig, ticks: { maxRotation: 45 } },
        y: { grid: gridConfig, beginAtZero: true, title: { display: true, text: "Posts", color: "#71717a" } }
      }
    }
  });
}

// ── Top Universities ───────────────────────────────────
async function loadTopUnisChart() {
  const data = await fetchJSON("/analytics/top-universities", { ...activeFilters, limit: 10 });
  destroyChart("topUnis");
  const labels = data.map(d => d.university.replace("University of ", "Uni. of ").replace("University ", ""));
  const values = data.map(d => d.post_count);
  const colors = data.map(d =>
    d.category === "technical" ? "#0f62fe" : d.category === "non_technical" ? "#da1e28" : "#8d8d8d"
  );
  
  chartInstances.topUnis = new Chart(document.getElementById("chart-top-unis"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Posts", data: values,
        backgroundColor: colors, borderRadius: 4, borderSkipped: false
      }]
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: gridConfig },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

// ── Keywords ───────────────────────────────────────────
async function loadKeywordsChart() {
  const data = await fetchJSON("/analytics/keywords", { category: "technical" });
  destroyChart("keywords");
  chartInstances.keywords = new Chart(document.getElementById("chart-keywords"), {
    type: "bar",
    data: {
      labels: data.map(d => d.keyword),
      datasets: [{
        label: "Frequency", data: data.map(d => d.count),
        backgroundColor: data.map((_, i) => `rgba(15, 98, 254, ${1 - i * 0.08})`),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: gridConfig },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

// ── Sentiment ──────────────────────────────────────────
async function loadSentimentChart() {
  const data = await fetchJSON("/analytics/sentiment-summary");
  destroyChart("sentiment");
  
  // IBM Carbon status colors
  const colorMap = { positive: "#24a148", neutral: "#8d8d8d", negative: "#da1e28" };
  
  chartInstances.sentiment = new Chart(document.getElementById("chart-sentiment"), {
    type: "doughnut",
    data: {
      labels: data.map(d => d.label.replace(/\b\w/g, c => c.toUpperCase())),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: data.map(d => colorMap[d.label] || "#a1a1aa"),
        borderWidth: 0, hoverOffset: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "75%",
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, pointStyleWidth: 10, padding: 20 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? Math.round(ctx.parsed / total * 100) : 0;
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

async function loadAnalytics() {
  await Promise.all([loadKeywordsChart(), loadSentimentChart()]);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTimeline();
  loadAnalytics();
});