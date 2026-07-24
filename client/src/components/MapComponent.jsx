import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Custom Map Bounds Fit component
function ChangeBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

export default function MapComponent({ 
  center = { lat: 28.6519, lng: 77.2315 }, // default Delhi
  zoom = 13, 
  restaurants = [], 
  ngos = [], 
  listings = [],
  activeRoute = null // { origin: {lat, lng}, destination: {lat, lng} }
}) {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (activeRoute && activeRoute.origin && activeRoute.destination) {
      const fetchOSRMRoute = async () => {
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${activeRoute.origin.lng},${activeRoute.origin.lat};${activeRoute.destination.lng},${activeRoute.destination.lat}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // Convert OSRM's [lng, lat] coordinate points to Leaflet's [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRouteCoords(coords);
          } else {
            // Fallback
            setRouteCoords([
              [activeRoute.origin.lat, activeRoute.origin.lng],
              [activeRoute.destination.lat, activeRoute.destination.lng]
            ]);
          }
        } catch (err) {
          console.error("OSRM street routing failed, falling back to straight line: ", err);
          setRouteCoords([
            [activeRoute.origin.lat, activeRoute.origin.lng],
            [activeRoute.destination.lat, activeRoute.destination.lng]
          ]);
        }
      };
      fetchOSRMRoute();
    } else {
      setRouteCoords([]);
    }
  }, [activeRoute]);

  // SVG-based DivIcons for custom marker aesthetics
  const createCustomIcon = (color, htmlSvg) => {
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 border-white" style="background-color: ${color};">
          <span class="text-white">${htmlSvg}</span>
          <div class="absolute bottom-[-6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]" style="border-t-color: ${color};"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 38],
      popupAnchor: [0, -32]
    });
  };

  const restaurantIcon = createCustomIcon('#16A34A', `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18"></path>
      <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1H3"></path>
      <path d="M19 10v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
    </svg>
  `);

  const ngoIcon = createCustomIcon('#F59E0B', `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
    </svg>
  `);

  const listingIcon = createCustomIcon('#EF4444', `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <box x="4" y="4" width="16" height="16" rx="2"></box>
      <path d="M12 8v8M8 12h8"></path>
    </svg>
  `);

  // Gather points to fit bounds
  const points = [];
  restaurants.forEach(r => points.push(r.location || r));
  ngos.forEach(n => points.push(n.location || n));
  listings.forEach(l => {
    if (l.restaurantLocation) points.push(l.restaurantLocation);
  });
  if (activeRoute) {
    points.push(activeRoute.origin);
    points.push(activeRoute.destination);
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurants */}
        {restaurants.map((rest, idx) => {
          const loc = rest.location || rest;
          if (!loc?.lat || !loc?.lng) return null;
          return (
            <Marker key={`rest-${idx}`} position={[loc.lat, loc.lng]} icon={restaurantIcon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 text-sm">{rest.name || rest.restaurantName}</h4>
                  <p className="text-xs text-slate-500 mt-1">{rest.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* NGOs */}
        {ngos.map((ngo, idx) => {
          const loc = ngo.location || ngo;
          if (!loc?.lat || !loc?.lng) return null;
          return (
            <Marker key={`ngo-${idx}`} position={[loc.lat, loc.lng]} icon={ngoIcon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 text-sm">{ngo.name || ngo.ngoName}</h4>
                  <p className="text-xs text-slate-500 mt-1">Capacity: {ngo.capacity || ngo.capacityKg} kg</p>
                  <p className="text-xs text-slate-500">{ngo.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Route Draw */}
        {activeRoute && activeRoute.origin && activeRoute.destination && (
          <>
            <Marker position={[activeRoute.origin.lat, activeRoute.origin.lng]} icon={restaurantIcon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 text-sm">Pickup Point (Restaurant)</h4>
                </div>
              </Popup>
            </Marker>
            <Marker position={[activeRoute.destination.lat, activeRoute.destination.lng]} icon={ngoIcon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 text-sm">Drop-off Point (NGO)</h4>
                </div>
              </Popup>
            </Marker>
            <Polyline 
              positions={routeCoords.length > 0 ? routeCoords : [
                [activeRoute.origin.lat, activeRoute.origin.lng],
                [activeRoute.destination.lat, activeRoute.destination.lng]
              ]} 
              color="#2563EB" 
              weight={5}
              opacity={0.85}
            />
          </>
        )}

        <ChangeBounds points={points} />
      </MapContainer>
    </div>
  );
}
