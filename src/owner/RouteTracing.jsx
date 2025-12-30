import { getOwnerRouteHistory, getOwnerVehicles } from '../services/api.js';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Calendar, Clock, MapPin, Activity } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { Input } from '../components/ui/input.jsx';
import { useEffect, useState, useRef } from 'react';

/* =========================
   ROUTE TRACING COMPONENT
========================= */
export function RouteTracing() {

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const pathRef = useRef(null);
  const animationRef = useRef(null);
  const mapInitialized = useRef(false);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [gpsLogs, setGpsLogs] = useState([]);
  const [stops, setStops] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [routeStats, setRouteStats] = useState(null);

  /* =========================
     INIT MAP
  ========================= */
  useEffect(() => {
    const initMap = () => {
      if (!window.mappls) {
        setMapError('Mappls SDK not loaded. Please refresh the page.');
        return;
      }

      if (mapInstance.current) return;

      try {
        mapInstance.current = new window.mappls.Map('route-tracing-map', {
          center: [20.5937, 78.9629], // Center of India
          zoom: 10,
        });
        mapInitialized.current = true;
        setMapError('');
        setTimeout(() => {
          try {
            mapInstance.current?.resize?.();
          } catch {}
        }, 0);
        console.log('Route tracing map initialized successfully');
      } catch (error) {
        console.error('Route tracing map initialization error:', error);
        setMapError('Failed to initialize map: ' + error.message);
      }
    };

    const timer = setTimeout(initMap, 500);
    return () => clearTimeout(timer);
  }, []);

  /* =========================
     LOAD VEHICLES
  ========================= */
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const sessionRaw = localStorage.getItem('fm_session_v1');
        const ownerId = sessionRaw ? JSON.parse(sessionRaw)?.user?.owner_id : null;
        if (!ownerId) {
          setVehicles([]);
          return;
        }

        const data = await getOwnerVehicles(ownerId);
        setVehicles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        setVehicles([]);
      }
    };

    loadVehicles();
  }, []);

  /* =========================
     LOAD GPS LOGS FOR SELECTED VEHICLE AND DATE
  ========================= */
  const loadRouteData = async () => {
    if (!selectedVehicle || !selectedDate) return;

    setLoading(true);
    try {
      // Fetch route history for the selected vehicle and date
      const data = await getOwnerRouteHistory(selectedVehicle, selectedDate);

      const rawRoute = Array.isArray(data?.route) ? data.route : [];
      const normalizedRoute = rawRoute.map((p) => ({
        ...p,
        recorded_at: p.recorded_at || p.timestamp || p.recordedAt || p.time || null,
      }));

      const computedStops = calculateStops(normalizedRoute);
      const stats = calculateRouteStats(normalizedRoute, computedStops);

      setGpsLogs(normalizedRoute);
      setStops(computedStops);
      setRouteStats(stats);
      setCurrentIndex(0);
      setIsPlaying(false);

      console.log('Loaded route data:', data);
    } catch (error) {
      console.error('Error loading route data:', error);
      setGpsLogs([]);
      setStops([]);
      setRouteStats(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CALCULATE STOPS FROM GPS LOGS
  ========================= */
  const calculateStops = (logs) => {
    const stops = [];
    let currentStop = null;
    const STOP_THRESHOLD_MINUTES = 5;
    const MOVEMENT_THRESHOLD_METERS = 50; // 50 meters

    logs.forEach((log, index) => {
      const isMoving = log.speed > 2; // Consider moving if speed > 2 km/h

      if (!isMoving && !currentStop) {
        // Start of a potential stop
        currentStop = {
          startIndex: index,
          startTime: new Date(log.recorded_at),
          position: { lat: log.latitude, lng: log.longitude },
          logs: [log]
        };
      } else if (!isMoving && currentStop) {
        // Continue the current stop
        currentStop.logs.push(log);
      } else if (isMoving && currentStop) {
        // End of the current stop
        const stopDuration = (new Date(log.recorded_at) - currentStop.startTime) / (1000 * 60); // minutes

        if (stopDuration >= STOP_THRESHOLD_MINUTES) {
          currentStop.endTime = new Date(log.recorded_at);
          currentStop.duration = stopDuration;
          stops.push(currentStop);
        }

        currentStop = null;
      }
    });

    // Handle case where vehicle is still stopped at the end
    if (currentStop && currentStop.logs.length > 1) {
      const stopDuration = (new Date(logs[logs.length - 1].recorded_at) - currentStop.startTime) / (1000 * 60);
      if (stopDuration >= STOP_THRESHOLD_MINUTES) {
        currentStop.endTime = new Date(logs[logs.length - 1].recorded_at);
        currentStop.duration = stopDuration;
        stops.push(currentStop);
      }
    }

    return stops;
  };

  /* =========================
     CALCULATE ROUTE STATISTICS
  ========================= */
  const calculateRouteStats = (logs, stops) => {
    if (logs.length === 0) return null;

    const startTime = new Date(logs[0].recorded_at);
    const endTime = new Date(logs[logs.length - 1].recorded_at);
    const totalDuration = (endTime - startTime) / (1000 * 60 * 60); // hours

    let totalDistance = 0;
    for (let i = 1; i < logs.length; i++) {
      // Simple distance calculation (not accurate for large distances)
      const lat1 = logs[i-1].latitude * Math.PI / 180;
      const lat2 = logs[i].latitude * Math.PI / 180;
      const lng1 = logs[i-1].longitude * Math.PI / 180;
      const lng2 = logs[i].longitude * Math.PI / 180;

      const dLat = lat2 - lat1;
      const dLng = lng2 - lng1;

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      totalDistance += 6371 * c; // Earth's radius in km
    }

    return {
      startTime,
      endTime,
      totalDuration: totalDuration.toFixed(1),
      totalDistance: totalDistance.toFixed(1),
      stopsCount: stops.length,
      avgSpeed: totalDistance > 0 ? (totalDistance / totalDuration).toFixed(1) : 0
    };
  };

  /* =========================
     FIT MAP TO ROUTE
  ========================= */
  const fitMapToRoute = (logs) => {
    if (!mapInstance.current || logs.length === 0) return;

    const bounds = logs.map(log => [log.latitude, log.longitude]);

    try {
      const minLat = Math.min(...bounds.map(b => b[0]));
      const maxLat = Math.max(...bounds.map(b => b[0]));
      const minLng = Math.min(...bounds.map(b => b[1]));
      const maxLng = Math.max(...bounds.map(b => b[1]));

      const latPadding = (maxLat - minLat) * 0.1 || 0.01;
      const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

      const boundsArray = [
        [minLat - latPadding, minLng - lngPadding],
        [maxLat + latPadding, maxLng + lngPadding]
      ];

      if (typeof mapInstance.current.fitBounds === 'function') {
        mapInstance.current.fitBounds(boundsArray);
      } else {
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        mapInstance.current.setCenter([centerLat, centerLng], 12);
      }
    } catch (error) {
      console.error('Error fitting map to route:', error);
    }
  };

  /* =========================
     UPDATE MAP DISPLAY
  ========================= */
  useEffect(() => {
    if (!mapInitialized.current || !mapInstance.current) return;

    // Clear existing markers and path
    markersRef.current.forEach(marker => {
      if (marker && typeof marker.remove === 'function') {
        marker.remove();
      }
    });
    markersRef.current = [];

    if (pathRef.current && typeof pathRef.current.remove === 'function') {
      pathRef.current.remove();
    }
    pathRef.current = null;

    if (gpsLogs.length === 0) return;

    // Draw the full route path
    try {
      const pathCoordinates = gpsLogs.map(log => [log.latitude, log.longitude]);

      if (window.mappls && window.mappls.Polyline) {
        pathRef.current = new window.mappls.Polyline({
          map: mapInstance.current,
          path: pathCoordinates,
          strokeColor: '#2563eb',
          strokeOpacity: 0.8,
          strokeWeight: 4,
        });
      }
    } catch (error) {
      console.error('Error drawing route path:', error);
    }

    // Add stop markers
    stops.forEach((stop, index) => {
      try {
        const stopMarker = new window.mappls.Marker({
          map: mapInstance.current,
          position: { lat: stop.position?.lat, lng: stop.position?.lng },
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="3"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${index + 1}</text>
              </svg>
            `)}`,
            size: [32, 32],
            anchor: [16, 32]
          }
        });

        const arrivalTime = stop.startTime ? stop.startTime.toLocaleString() : '—';
        const departureTime = stop.endTime ? stop.endTime.toLocaleString() : 'Still stopped';

        const popupContent = `
          <div style="font-size:12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 200px;">
            <strong style="color: #dc2626;">🛑 Stop ${index + 1}</strong><br/>
            <strong>Arrival:</strong> ${arrivalTime}<br/>
            <strong>Departure:</strong> ${departureTime}<br/>
            <strong>Duration:</strong> ${Number(stop.duration || 0).toFixed(1)} minutes<br/>
            <strong>Location:</strong> ${Number(stop.position?.lat || 0).toFixed(4)}, ${Number(stop.position?.lng || 0).toFixed(4)}
          </div>
        `;

        if (typeof stopMarker.setPopup === 'function') {
          stopMarker.setPopup(popupContent);
        }

        markersRef.current.push(stopMarker);
      } catch (error) {
        console.error('Error creating stop marker:', error);
      }
    });

    // Add current position marker for animation
    if (currentIndex < gpsLogs.length) {
      const currentLog = gpsLogs[currentIndex];
      try {
        const currentMarker = new window.mappls.Marker({
          map: mapInstance.current,
          position: { lat: currentLog.latitude, lng: currentLog.longitude },
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="white" stroke-width="3"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>
            `)}`,
            size: [24, 24],
            anchor: [12, 12]
          }
        });

        markersRef.current.push(currentMarker);
      } catch (error) {
        console.error('Error creating current position marker:', error);
      }
    }

    fitMapToRoute(gpsLogs);

  }, [gpsLogs, stops, currentIndex]);

  /* =========================
     ANIMATION LOGIC
  ========================= */
  useEffect(() => {
    if (isPlaying && gpsLogs.length > 0) {
      const interval = 1000 / speed; // Update every second at 1x speed

      animationRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= gpsLogs.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, speed, gpsLogs.length]);

  /* =========================
     CONTROL FUNCTIONS
  ========================= */
  const playPause = () => setIsPlaying(!isPlaying);

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const skipToStart = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const skipToEnd = () => {
    setCurrentIndex(gpsLogs.length - 1);
    setIsPlaying(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">Route Tracing</h1>
          <p className="text-sm text-muted-foreground">Replay vehicle movement and analyze stops</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Vehicle
            </label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder="Choose vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.vehicle_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Playback Speed
            </label>
            <Select value={speed.toString()} onValueChange={(value) => setSpeed(parseFloat(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={loadRouteData}
              disabled={!selectedVehicle || !selectedDate || loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Load Route'}
            </Button>
          </div>
        </div>

        {/* PLAYBACK CONTROLS */}
        {gpsLogs.length > 0 && (
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Button variant="outline" size="sm" onClick={skipToStart}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={playPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={skipToEnd}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="text-sm text-muted-foreground ml-4">
              {currentIndex < gpsLogs.length ?
                formatTime(new Date(gpsLogs[currentIndex].recorded_at)) :
                'End of route'
              }
            </div>
          </div>
        )}
      </div>

      {/* ROUTE STATISTICS */}
      {routeStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-lg font-semibold text-foreground">{routeStats.totalDuration}h</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-lg font-semibold text-foreground">{routeStats.totalDistance} km</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Stops</p>
                <p className="text-lg font-semibold text-foreground">{routeStats.stopsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Speed</p>
                <p className="text-lg font-semibold text-foreground">{routeStats.avgSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAP CONTAINER */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {mapError && (
          <div className="p-4 bg-destructive/10 border-b border-border">
            <p className="text-destructive text-sm">{mapError}</p>
          </div>
        )}
        <div
          id="route-tracing-map"
          ref={mapRef}
          className="w-full h-[60svh] min-h-[360px] sm:h-[65svh] lg:h-[72svh] max-h-[820px]"
          style={{ height: '65vh', minHeight: 420, maxHeight: 900 }}
        />
      </div>

      {/* STOPS LIST */}
      {stops.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Route Stops</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {stops.map((stop, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Stop {index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {stop.position.lat.toFixed(4)}, {stop.position.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {stop.duration.toFixed(1)} min
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stop.startTime.toLocaleTimeString()} - {stop.endTime?.toLocaleTimeString() || 'Ongoing'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}