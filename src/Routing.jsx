// src/Routing.jsx
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

export default function Routing({ from, to, color = "blue" }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !from || !to) return;

    // OSRM public demo (driving profile). Good enough to visualize streets for walking.
    const control = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      lineOptions: { styles: [{ color, weight: 4, opacity: 0.85 }] },
      show: false,             // hide the turn-by-turn panel
      addWaypoints: false,     // don't allow dragging to add waypoints
      routeWhileDragging: false,
      fitSelectedRoutes: false,
      createMarker: () => null // hide LRM default markers; we use our own
    }).addTo(map);

    return () => {
      try { map.removeControl(control); } catch {}
    };
  }, [map, from, to, color]);

  return null;
}
