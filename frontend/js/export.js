function exportData(format) {
  const params = new URLSearchParams();
  Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const url = `/api/export/${format}?${params.toString()}`;
  const a = document.createElement("a");
  a.href = url; a.download = ""; a.click();
  showToast(`⬇ Downloading ${format.toUpperCase()} report...`);
}