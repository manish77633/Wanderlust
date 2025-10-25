document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("listing-map");
  if (!mapContainer) return;

  // Correct lat-lon order (Leaflet uses [lat, lon])
  const lat = parseFloat(mapContainer.dataset.lat);
  const lon = parseFloat(mapContainer.dataset.lon);
  const label = mapContainer.dataset.label || "Selected Location";

  // Initialize map
  const map = L.map("listing-map").setView([lat, lon], 13);

  // ✅ Thunderforest Atlas tile layer (good street view)
  L.tileLayer("https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=563c44964c0a43579ac9c5163cf8db1b", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors | &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
    subdomains: ["a", "b", "c"],
    maxZoom: 22,
  }).addTo(map);

  // ✅ Marker
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(label)
    .openPopup();

  console.log("Map loaded → Lat:", lat, "Lon:", lon, "Label:", label);
});
