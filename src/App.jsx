import React, { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import Routing from "./Routing";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";

// ---------------- DATA ---------------- //
const STOPS = [
  { id: 1, time: "08:40", name: "Arrive – 34 St–Penn Station (NJ Transit)", type: "station", lat: 40.7506, lng: -73.9935, note: "Arrive from Princeton Junction on NJ Transit Northeast Corridor." },
  { id: 2, time: "09:00", name: "Empire State Building", type: "landmark", lat: 40.7484, lng: -73.9857, note: "Photos outside are free. Observatory optional (~$44, skip for budget)." },
  { id: 3, time: "09:45", name: "Times Square (Broadway & 42nd)", type: "landmark", lat: 40.758, lng: -73.9855, note: "Window shopping: Disney Store, M&M's, Hershey's. Great photo spot." },
  { id: 4, time: "10:30", name: "59 St–Columbus Circle (Central Park South)", type: "station", lat: 40.7681, lng: -73.9819, note: "Enter Central Park at the south entrance. Benches & musicians." },
  { id: 5, time: "11:45", name: "Rockefeller Center", type: "landmark", lat: 40.7587, lng: -73.9787, note: "Walk to St. Patrick’s Cathedral next door. Window shop on 5th Ave." },
  { id: 6, time: "12:30", name: "Lunch – Slice shop / food cart (budget $7–10)", type: "food", lat: 40.7585, lng: -73.976, note: "Grab a cheap slice on 6th/7th Ave or a cart nearby." },
  { id: 7, time: "13:15", name: "Grand Central Terminal", type: "landmark", lat: 40.7527, lng: -73.9772, note: "Ceiling mural, main concourse. Coffee & bakeries in the Market." },
  { id: 8, time: "14:00", name: "Fulton St Station (for 9/11 Memorial)", type: "station", lat: 40.7094, lng: -74.0094, note: "Take 4/5 downtown from Grand Central to Fulton St ($2.90)." },
  { id: 9, time: "14:05", name: "9/11 Memorial & Oculus", type: "landmark", lat: 40.7115, lng: -74.0134, note: "Outdoor pools are free. Museum optional (~$28)." },
  { id: 10, time: "15:00", name: "Charging Bull (Bowling Green)", type: "landmark", lat: 40.7056, lng: -74.0134, note: "Photo stop; Fearless Girl nearby." },
  { id: 11, time: "15:30", name: "Whitehall Terminal – Staten Island Ferry", type: "ferry", lat: 40.7017, lng: -74.0131, note: "FREE ferry every ~30 min. Round trip ~1 hr. Statue of Liberty views." },
  { id: 12, time: "16:45", name: "Brooklyn Bridge – Pedestrian Entrance (City Hall side)", type: "landmark", lat: 40.713, lng: -74.003, note: "Walk halfway for skyline shots; return toward City Hall." },
  { id: 13, time: "17:45", name: "Brooklyn Bridge–City Hall (2/3 uptown)", type: "station", lat: 40.7133, lng: -74.0041, note: "Ride 2/3 uptown to 34 St–Penn Station ($2.90)." },
  { id: 14, time: "18:15", name: "Return – 34 St–Penn Station", type: "station", lat: 40.7506, lng: -73.9935, note: "Optional dinner in Koreatown (32nd St)." },
];

const SUBWAY_STEPS = [
  {
    id: "midtown-to-park",
    title: "Times Sq → 59 St/Columbus Circle",
    lines: "N/R/W (uptown)",
    fare: 2.90,
    details: "From Times Sq–42 St, follow yellow circle signs (N/R/W) uptown to 59 St–Columbus Circle. Ride ~2 stops (≈6–8 min).",
  },
  {
    id: "gct-to-fulton",
    title: "Grand Central → Fulton St (Downtown)",
    lines: "4/5 (downtown)",
    fare: 2.90,
    details: "From Grand Central–42 St, take the 4 or 5 downtown to Fulton St. Ride ≈15 min. Exit toward Oculus/9–11 Memorial.",
  },
  {
    id: "bridge-to-penn",
    title: "Brooklyn Bridge–City Hall → 34 St–Penn",
    lines: "2/3 (uptown)",
    fare: 2.90,
    details: "Enter at City Hall/Chambers. Take 2 or 3 uptown to 34 St–Penn Station. Ride ≈20 min.",
  },
];

// Leaflet icon helper (uses CDN images so Vite bundling “missing icon” bug is avoided)
function iconByType(type) {
  const color = type === "station" ? "blue" : type === "ferry" ? "green" : type === "food" ? "orange" : "red";
  return new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: `leaflet-marker-${color}`,
  });
}

export default function App() {
  const [empire, setEmpire] = useState(false);
  const [museum, setMuseum] = useState(false);

  const baseCost = 12 + 15; // subway (~$12) + food (~$15)
  const estTotal = (baseCost + (empire ? 44 : 0) + (museum ? 28 : 0)).toFixed(2);

  const center = [40.754, -73.985];
  const route = useMemo(() => STOPS.map((s) => [s.lat, s.lng]), []);

  return (
    <div className="container">
      <header className="header">
        <h1 className="h1">NYC One-Day Budget Trip</h1>
        <div>
          <Button onClick={() => window.print()}>Print / Save</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="map-wrap">
            <MapContainer center={center} zoom={13} scrollWheelZoom>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              {/* Pins */}
              {STOPS.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={iconByType(s.type)}>
                  <Popup>
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 700 }}>{s.time} – {s.name}</div>
                      <div style={{ fontSize: 13, color: "#374151" }}>{s.note}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Straight polyline showing overall order */}
              <Polyline positions={route} weight={2} opacity={0.35} />

              {/* Realistic street routes (walking/driving via OSRM demo) */}
              {/* Midtown walking-ish legs */}
              <Routing color="#2563eb" from={{ lat: 40.7506, lng: -73.9935 }} to={{ lat: 40.7484, lng: -73.9857 }} /> {/* Penn -> Empire */}
              <Routing color="#2563eb" from={{ lat: 40.7484, lng: -73.9857 }} to={{ lat: 40.7580, lng: -73.9855 }} /> {/* Empire -> Times Sq */}
              <Routing color="#2563eb" from={{ lat: 40.7580, lng: -73.9855 }} to={{ lat: 40.7681, lng: -73.9819 }} /> {/* Times Sq -> Columbus Circle */}
              <Routing color="#2563eb" from={{ lat: 40.7681, lng: -73.9819 }} to={{ lat: 40.7587, lng: -73.9787 }} /> {/* Columbus Circle -> Rockefeller */}
              <Routing color="#2563eb" from={{ lat: 40.7587, lng: -73.9787 }} to={{ lat: 40.7527, lng: -73.9772 }} /> {/* Rockefeller -> Grand Central */}

              {/* Downtown walking-ish legs */}
              <Routing color="#16a34a" from={{ lat: 40.7115, lng: -74.0134 }} to={{ lat: 40.7056, lng: -74.0134 }} /> {/* 9/11 -> Bull */}
              <Routing color="#16a34a" from={{ lat: 40.7056, lng: -74.0134 }} to={{ lat: 40.7017, lng: -74.0131 }} /> {/* Bull -> Ferry */}
              <Routing color="#16a34a" from={{ lat: 40.7017, lng: -74.0131 }} to={{ lat: 40.7130, lng: -74.0030 }} /> {/* Ferry -> Bridge */}

              {/* NOTE: Subway legs are not routed on map (different network). See text steps below. */}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hour-by-Hour Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid two">
            {STOPS.map((s) => (
              <li key={s.id} className="item">
                <div className="time">{s.time}</div>
                <div className="title">{s.name}</div>
                <div className="note">{s.note}</div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subway & Ferry Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion>
            {SUBWAY_STEPS.map((s, i) => (
              <AccordionItem key={s.id}>
                <AccordionTrigger>
                  <div>
                    {i + 1}. {s.title}
                    <span className="badge">{s.lines}</span>
                    <span className="badge">${s.fare.toFixed(2)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>{s.details}</AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem>
              <AccordionTrigger>
                <div>
                  Staten Island Ferry – Whitehall ⇄ St. George
                  <span className="badge" style={{ background: "#dcfce7" }}>FREE</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Runs roughly every 30 minutes, 24/7. Sit on the right side leaving Manhattan for Statue views; left side returning.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget Estimator</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Base includes subway (~$12) + food (~$15). Toggle extras below.</div>
          <div className="toggle-row">
            <Button variant={empire ? "solid" : "outline"} onClick={() => setEmpire((v) => !v)}>
              {empire ? "✓ " : ""}Empire State Observatory (+$44)
            </Button>
            <Button variant={museum ? "solid" : "outline"} onClick={() => setMuseum((v) => !v)}>
              {museum ? "✓ " : ""}9/11 Museum (+$28)
            </Button>
          </div>
          <div style={{ fontWeight: 700, marginTop: 6 }}>Estimated Total: ${estTotal}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Use OMNY: tap your debit/credit/phone at subway turnstiles ($2.90/ride). No MetroCard needed.</li>
            <li>5th Ave & Columbus Circle are perfect for window shopping; Grand Central Market for coffee/bakery.</li>
            <li>At night, choose busy cars and platforms; avoid empty cars.</li>
            <li>Koreatown (32nd St) near Penn Station is great for an affordable dinner.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="footer">Built for your NYC day trip • All times approximate • Have fun! 🗽</div>
    </div>
  );
}
