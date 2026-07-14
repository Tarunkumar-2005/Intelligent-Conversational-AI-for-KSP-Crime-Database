import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  MapPin, 
  Shield, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Navigation, 
  Folder 
} from 'lucide-react';
import { PageContainer, PageHeader, DashboardCard, StatCard } from '../components/LayoutComponents.jsx';
import { Button, Input, Badge } from '../components/UIPrimitives.jsx';
import api from '../services/api.js';
import { useUI } from '../context/UIContext.jsx';

// Leaflet default asset resolving logic for Vite bundling
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Leaflet View Change component
const MapViewHandler = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const { addToast } = useUI();

  // Maps Data States
  const [overview, setOverview] = useState({
    totalIncidents: 0,
    activeHotspotCount: 0,
    highRiskDistrict: 'N/A',
    topCategory: 'N/A'
  });
  const [hotspots, setHotspots] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Map Navigation Focus State
  const [mapCenter, setMapCenter] = useState([12.5218, 76.8973]); // Default Mandya district center
  const [mapZoom, setMapZoom] = useState(9);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    crimeCategory: '',
    district: '',
    crimeStatus: '',
    year: '',
    month: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGeospatialData = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      Object.keys(filters).forEach(k => {
        if (filters[k]) params[k] = filters[k];
      });

      const [overviewRes, hotspotsRes, markersRes] = await Promise.all([
        api.get('/maps/overview', { params }),
        api.get('/maps/hotspots', { params }),
        api.get('/maps/markers', { params })
      ]);

      setOverview(overviewRes.data.data);
      setHotspots(hotspotsRes.data.data);
      setMarkers(markersRes.data.data);

      // Dynamically re-center map if district filter is set
      const districtCenters = {
        Bengaluru: [12.9716, 77.5946],
        Mysuru: [12.2958, 76.6394],
        Mandya: [12.5218, 76.8973],
        Tumakuru: [13.3392, 77.1140]
      };
      if (filters.district && districtCenters[filters.district]) {
        setMapCenter(districtCenters[filters.district]);
        setMapZoom(11);
      }
    } catch (err) {
      console.error('Failed to load spatial data:', err);
      setError(true);
      addToast('Error retrieving geographic intelligence layers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeospatialData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      crimeCategory: '',
      district: '',
      crimeStatus: '',
      year: '',
      month: ''
    });
    setMapCenter([12.5218, 76.8973]);
    setMapZoom(9);
    setSelectedHotspot(null);
    addToast('Filters reset.', 'success');
  };

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/maps/search?query=${searchQuery}`);
      if (res.data.data && res.data.data.length > 0) {
        const firstMatch = res.data.data[0];
        const coords = firstMatch.coordinates?.coordinates;
        if (coords) {
          setMapCenter([coords[1], coords[0]]);
          setMapZoom(12);
          addToast(`Centered on location: ${firstMatch.locationName}`, 'info');
        }
      } else {
        addToast('No matching geographic places found.', 'info');
      }
    } catch (err) {
      console.error('Location search failed:', err);
      addToast('Error during spatial lookup.', 'error');
    }
  };

  const focusOnHotspot = (h) => {
    const lat = h.coordinates[1];
    const lng = h.coordinates[0];
    setMapCenter([lat, lng]);
    setMapZoom(13);
    setSelectedHotspot(h);
    addToast(`Locking coordinates: ${h.locationName}`, 'info');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Crime Hotspot Maps"
        description="Geographic analysis tracking case overlays, police station border densities, and threat levels."
        actions={
          <Button variant="secondary" onClick={handleResetFilters} className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Map
          </Button>
        }
      />

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Geo-Tagged Incidents" value={overview.totalIncidents} icon={<Folder className="w-5 h-5" />} color="blue" />
        <StatCard title="Active Hotspot Zones" value={overview.activeHotspotCount} icon={<MapPin className="w-5 h-5" />} color="red" />
        <StatCard title="Top Risk District" value={overview.highRiskDistrict} icon={<AlertTriangle className="w-5 h-5" />} color="yellow" />
        <StatCard title="Predominant Offence" value={overview.topCategory} icon={<Shield className="w-5 h-5" />} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Filters and Hotspots */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          
          {/* Spatial Search Card */}
          <DashboardCard title="Search Place / Location">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bengaluru, Mysuru..."
                className="flex-1 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <Button onClick={handleLocationSearch} className="px-3">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </DashboardCard>

          {/* Filtering Card */}
          <DashboardCard title="Map Filters">
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Crime Type</label>
                <select
                  name="crimeCategory"
                  value={filters.crimeCategory}
                  onChange={handleFilterChange}
                  className="w-full h-8 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Robbery">Robbery</option>
                  <option value="Theft">Theft</option>
                  <option value="Cyber Crime">Cyber Crime</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Assault">Assault</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">District</label>
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleFilterChange}
                  className="w-full h-8 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="">All Districts</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Mandya">Mandya</option>
                  <option value="Tumakuru">Tumakuru</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full h-8 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Case Status</label>
                <select
                  name="crimeStatus"
                  value={filters.crimeStatus}
                  onChange={handleFilterChange}
                  className="w-full h-8 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Registered">Registered</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </DashboardCard>

          {/* Active hotspots list */}
          <DashboardCard title="Geographic Hotspots">
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar">
              {hotspots.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => focusOnHotspot(h)}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition-all duration-150 ${selectedHotspot?.locationName === h.locationName ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/35 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{h.locationName}</span>
                    <Badge variant="danger">{h.count} Cases</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 capitalize">{h.district} district • {h.division}</p>
                </div>
              ))}
            </div>
          </DashboardCard>

        </div>

        {/* Center Main Leaflet Map widget */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <DashboardCard title="Dynamic Geospatial Overlay">
            <div className="relative w-full h-[60vh] rounded border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900">
              
              {/* React Leaflet Map Canvas */}
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                className="w-full h-full"
                scrollWheelZoom={true}
              >
                <MapViewHandler center={mapCenter} zoom={mapZoom} />
                
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Heatmap Overlay - Concentric glowing gradient circles */}
                {hotspots.map((h, idx) => {
                  const lat = h.coordinates[1];
                  const lng = h.coordinates[0];
                  
                  // Vary outer glows based on incident weights
                  const countMultiplier = Math.min(h.count * 150, 1500);

                  return (
                    <React.Fragment key={`heat-${idx}`}>
                      {/* Outer Glow */}
                      <Circle
                        center={[lat, lng]}
                        radius={countMultiplier}
                        pathOptions={{
                          fillColor: '#ef4444',
                          fillOpacity: 0.12,
                          stroke: false
                        }}
                      />
                      {/* Middle Glow */}
                      <Circle
                        center={[lat, lng]}
                        radius={countMultiplier * 0.5}
                        pathOptions={{
                          fillColor: '#ef4444',
                          fillOpacity: 0.22,
                          stroke: false
                        }}
                      />
                      {/* Inner Target Point */}
                      <Circle
                        center={[lat, lng]}
                        radius={150}
                        pathOptions={{
                          fillColor: '#f43f5e',
                          fillOpacity: 0.55,
                          color: '#ffffff',
                          weight: 1.5
                        }}
                      />
                    </React.Fragment>
                  );
                })}

                {/* Individual Case Markers */}
                {markers.map((m) => (
                  <Marker 
                    key={m.id} 
                    position={m.coordinates}
                  >
                    <Popup className="leaflet-popup-dark">
                      <div className="text-xs space-y-1 p-1">
                        <p className="font-bold text-slate-800 dark:text-white">{m.firNumber}</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">{m.crimeCategory}</p>
                        <div className="border-t border-slate-100 my-1 pt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                          <p><span className="font-bold">Station:</span> {m.policeStation}</p>
                          <p><span className="font-bold">Location:</span> {m.locationName}</p>
                          <p><span className="font-bold">Status:</span> <span className="underline">{m.status}</span></p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Loader overlay */}
              {loading && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px] z-[1000]">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Syncing spatial dimensions...</p>
                  </div>
                </div>
              )}

              {/* Coordinates lock details overlay */}
              {selectedHotspot && (
                <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded p-3 text-[10px] space-y-1 z-[1000] max-w-xs text-slate-300 shadow-md">
                  <p className="font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    Coordinate Lock
                  </p>
                  <p><span className="font-bold text-slate-400">Place:</span> {selectedHotspot.locationName}</p>
                  <p><span className="font-bold text-slate-400">GPS:</span> {selectedHotspot.coordinates[1].toFixed(5)}° N, {selectedHotspot.coordinates[0].toFixed(5)}° E</p>
                  <p><span className="font-bold text-slate-400">Threat Level:</span> <span className="text-red-400 font-bold">{selectedHotspot.count > 5 ? 'High Risk' : 'Medium Risk'}</span></p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>

      </div>
    </PageContainer>
  );
};

export default MapPage;
