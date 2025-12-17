import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Badge } from '../ui/badge.jsx';
import { Switch } from '../ui/switch.jsx';
import { Navigation, MapPin, Clock, X, AlertCircle, CheckCircle2, Circle, Bell, Send, ZoomIn, ZoomOut, Maximize2, Plus, ChevronLeft, Search } from 'lucide-react';
import mapBackground from 'figma:asset/84f2df699de86d311dc0b56820be473ca8ac952c.png';

export function GeofencingPage() {
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showAddGeofence, setShowAddGeofence] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [radius, setRadius] = useState('500');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  
  // Add Geofence form states
  const [geofenceName, setGeofenceName] = useState('');
  const [geofenceCategory, setGeofenceCategory] = useState('');
  const [location, setLocation] = useState('');
  const [latLongToggle, setLatLongToggle] = useState(false);
  const [geofenceType, setGeofenceType] = useState('circle');
  const [assignUser, setAssignUser] = useState('self');
  const [radiusValue, setRadiusValue] = useState('1');
  const [radiusUnit, setRadiusUnit] = useState('kilometer');

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setMapZoom(1);
  };

  const vehicles = [
    { id: 'TN-01-1234', status: 'inside', position: { top: '25%', left: '30%' }, lastUpdated: '2 mins ago', distance: '50m from Office' },
    { id: 'TN-01-1236', status: 'inside', position: { top: '35%', left: '45%' }, lastUpdated: '1 min ago', distance: '120m from Office' },
    { id: 'TN-01-1240', status: 'outside', position: { top: '55%', left: '70%' }, lastUpdated: '5 mins ago', distance: '2.5km from Office' },
    { id: 'TN-01-1235', status: 'inside', position: { top: '70%', left: '35%' }, lastUpdated: '3 mins ago', distance: '80m from Office' },
    { id: 'TN-01-1238', status: 'outside', position: { top: '45%', left: '25%' }, lastUpdated: '7 mins ago', distance: '1.8km from Office' },
  ];

  // Get late vehicles (outside geofence)
  const lateVehicles = vehicles.filter(v => v.status === 'outside');

  const handleSendAlert = (vehicleId) => {
    // Logic to send alert
    console.log(`Sending alert for vehicle: ${vehicleId}`);
  };

  const geofenceAlerts = [
    { id: '1', vehicleId: 'Bus 102', message: 'not reached Office Zone at 9:15 AM – marked RED', time: '15 mins ago', type: 'warning' },
    { id: '2', vehicleId: 'Cab 220', message: 'entered Factory Zone successfully at 8:58 AM', time: '1 hour ago', type: 'success' },
    { id: '3', vehicleId: 'Van 305', message: 'left Depot Zone at 8:45 AM', time: '1 hour ago', type: 'success' },
  ];

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSelectedPoint({ x, y });
    setShowGeofenceModal(true);
  };

  const handleCreateGeofence = () => {
    // Logic to create geofence
    setShowGeofenceModal(false);
    setSelectedPoint(null);
    setLocationName('');
    setRadius('500');
    setStartTime('09:00');
    setEndTime('10:00');
  };

  const handleCancel = () => {
    setShowGeofenceModal(false);
    setSelectedPoint(null);
    setLocationName('');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Real Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center cursor-crosshair transition-transform duration-300"
        style={{ 
          backgroundImage: `url(${mapBackground})`,
          transform: `scale(${mapZoom})`,
          transformOrigin: 'center center'
        }}
        onClick={handleMapClick}
      >
        {/* Existing Geofence Zones */}
        {showGeofences && (
          <>
            {/* Office Zone */}
            <div className="absolute" style={{ top: '30%', left: '35%', transform: 'translate(-50%, -50%)' }}>
              <div className="relative">
                <Circle className="h-48 w-48 text-blue-500 opacity-20 fill-blue-200" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-lg shadow-lg">
                  <p className="text-xs text-slate-900">Office Zone</p>
                  <p className="text-[10px] text-slate-600">Radius: 500m</p>
                </div>
              </div>
            </div>

            {/* Factory Zone */}
            <div className="absolute" style={{ top: '65%', left: '60%', transform: 'translate(-50%, -50%)' }}>
              <div className="relative">
                <Circle className="h-40 w-40 text-green-500 opacity-20 fill-green-200" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-lg shadow-lg">
                  <p className="text-xs text-slate-900">Factory Zone</p>
                  <p className="text-[10px] text-slate-600">Radius: 250m</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Selected Point for New Geofence */}
        {selectedPoint && (
          <div 
            className="absolute" 
            style={{ 
              top: `${selectedPoint.y}%`, 
              left: `${selectedPoint.x}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <Circle className={`h-${radius === '100' ? '20' : radius === '250' ? '32' : radius === '500' ? '48' : '64'} w-${radius === '100' ? '20' : radius === '250' ? '32' : radius === '500' ? '48' : '64'} text-blue-600 opacity-30 fill-blue-300 animate-pulse`} />
              <MapPin className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
            </div>
          </div>
        )}

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="absolute"
            style={{ top: vehicle.position.top, left: vehicle.position.left }}
            onMouseEnter={() => setHoveredVehicle(vehicle.id)}
            onMouseLeave={() => setHoveredVehicle(null)}
          >
            <div className="relative">
              <div className={`${vehicle.status === 'inside' ? 'bg-green-500' : 'bg-red-500'} p-3 rounded-full shadow-xl animate-pulse cursor-pointer`}>
                <Navigation className="h-5 w-5 text-white" />
              </div>
              
              {/* Vehicle Tooltip */}
              {hoveredVehicle === vehicle.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-4 py-3 rounded-lg shadow-2xl z-50 whitespace-nowrap">
                  <p className="text-xs text-slate-900">{vehicle.id}</p>
                  <p className="text-[10px] text-slate-600 mt-1">Last updated: {vehicle.lastUpdated}</p>
                  <p className="text-[10px] text-slate-600">Distance: {vehicle.distance}</p>
                  <Badge className={`mt-2 text-[10px] ${vehicle.status === 'inside' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {vehicle.status === 'inside' ? 'Inside Zone' : 'Outside Zone'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/95 backdrop-blur-sm px-8 py-4 rounded-lg shadow-xl">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-[#10b981]" />
            <div>
              <h3 className="text-slate-900">Geofencing Management</h3>
              <p className="text-xs text-slate-600">Real-time zone monitoring & alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Show Geofences */}
      <div className="absolute top-6 right-6 z-30 flex flex-col gap-2">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="show-geofences" className="text-sm text-slate-700 cursor-pointer">
                Show Geofences
              </Label>
              <Switch
                id="show-geofences"
                checked={showGeofences}
                onCheckedChange={setShowGeofences}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Geofence Button */}
        <button
          onClick={() => setShowAddGeofence(true)}
          className="bg-white hover:bg-gray-50 p-4 rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          title="Add Geofence"
        >
          <Plus className="w-5 h-5 text-slate-700" />
          <span className="text-sm text-slate-700">Add Geofence</span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 bg-white hover:bg-slate-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={handleResetZoom}
          className="w-12 h-12 bg-white hover:bg-slate-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Reset Zoom"
        >
          <Maximize2 className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 bg-white hover:bg-slate-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-slate-700" />
        </button>
        <div className="w-12 bg-white rounded-lg shadow-lg px-2 py-2 text-center">
          <span className="text-xs text-slate-700">{Math.round(mapZoom * 100)}%</span>
        </div>
      </div>

      {/* Late Vehicles Alert Panel - Bottom Left */}
      {lateVehicles.length > 0 && (
        <div className="absolute bottom-6 left-6 z-30 w-96">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-red-200">
            <CardHeader className="pb-3 bg-red-50 border-b border-red-200">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900">Late Vehicles Alert</span>
                <Badge className="ml-auto bg-red-600 text-white">{lateVehicles.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto pt-4">
              {lateVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="bg-red-500 p-2 rounded-full flex-shrink-0">
                        <Navigation className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{vehicle.id}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {vehicle.lastUpdated}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {vehicle.distance}
                        </p>
                        <Badge className="mt-2 text-[10px] bg-red-600 text-white">
                          Outside Geofence - Late
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendAlert(vehicle.id)}
                      className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0 h-8 px-3"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Alert
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Geofencing Control Panel Modal */}
      {showGeofenceModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="w-[480px] shadow-2xl">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">Set Geofence Zone</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Location Name */}
              <div className="space-y-2">
                <Label htmlFor="location-name" className="text-slate-700">
                  Location Name
                </Label>
                <Input
                  id="location-name"
                  placeholder="e.g., Office, Factory, Depot"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="border-slate-300"
                />
              </div>

              {/* Radius */}
              <div className="space-y-2">
                <Label htmlFor="radius" className="text-slate-700">
                  Radius
                </Label>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger id="radius" className="border-slate-300">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 m</SelectItem>
                    <SelectItem value="250">250 m</SelectItem>
                    <SelectItem value="500">500 m</SelectItem>
                    <SelectItem value="1000">1 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Time Window */}
              <div className="space-y-2">
                <Label className="text-slate-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Active Time Window
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-xs text-slate-600">
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-xs text-slate-600">
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGeofence}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Geofence
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Geofence Modal */}
      {showAddGeofence && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowAddGeofence(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#F5F7FA] p-6 border-b border-[#E1E6EF]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddGeofence(false)}
                  className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-[#2A3547]" />
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'Inter', color: '#2A3547' }}>
                  ADD GEOFENCE
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)]">
              {/* Geofence Details Section */}
              <div className="bg-[#F5F7FA] p-6 rounded-xl mb-6">
                <h3 className="text-[#0D47A1] mb-1" style={{ fontWeight: 600, fontSize: '16px' }}>
                  Geofence Details <span className="text-[#67727E] text-sm" style={{ fontWeight: 400 }}>(All fields are mandatory)</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-6 mt-6">
                  {/* Geofence Name */}
                  <div className="space-y-2">
                    <Label className="text-[#2A3547] text-sm" style={{ fontWeight: 500 }}>
                      Geofence Name
                    </Label>
                    <Input
                      placeholder="Enter Text Here"
                      value={geofenceName}
                      onChange={(e) => setGeofenceName(e.target.value)}
                      className="border-[#E1E6EF] bg-white"
                    />
                  </div>

                  {/* Geofence Category */}
                  <div className="space-y-2">
                    <Label className="text-[#2A3547] text-sm" style={{ fontWeight: 500 }}>
                      Geofence Category
                    </Label>
                    <Select value={geofenceCategory} onValueChange={setGeofenceCategory}>
                      <SelectTrigger className="border-[#E1E6EF] bg-white">
                        <SelectValue placeholder="Geofence Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="factory">Factory</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="depot">Depot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#2A3547] text-sm" style={{ fontWeight: 500 }}>
                        Location
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#67727E]">Lat/Long</span>
                        <Switch
                          checked={latLongToggle}
                          onCheckedChange={setLatLongToggle}
                          className="data-[state=checked]:bg-[#0D47A1]"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#67727E]" size={16} />
                      <Input
                        placeholder="Search location here"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-[#E1E6EF] bg-white pl-10"
                      />
                    </div>
                  </div>

                  {/* Geofence Type */}
                  <div className="space-y-2">
                    <Label className="text-[#2A3547] text-sm" style={{ fontWeight: 500 }}>
                      Geofence Type
                    </Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setGeofenceType('circle')}
                        className={`px-6 py-2 rounded-full transition-all ${
                          geofenceType === 'circle'
                            ? 'bg-[#0D47A1] text-white'
                            : 'bg-white text-[#67727E] border border-[#E1E6EF]'
                        }`}
                        style={{ fontWeight: 500, fontSize: '14px' }}
                      >
                        Circle
                      </button>
                      <button
                        onClick={() => setGeofenceType('polygon')}
                        className={`px-6 py-2 rounded-full transition-all ${
                          geofenceType === 'polygon'
                            ? 'bg-[#0D47A1] text-white'
                            : 'bg-white text-[#67727E] border border-[#E1E6EF]'
                        }`}
                        style={{ fontWeight: 500, fontSize: '14px' }}
                      >
                        Polygon
                      </button>
                    </div>
                  </div>

                  {/* Assign User */}
                  <div className="space-y-2">
                    <Label className="text-[#2A3547] text-sm" style={{ fontWeight: 500 }}>
                      Assign User
                    </Label>
                    <Select value={assignUser} onValueChange={setAssignUser}>
                      <SelectTrigger className="border-[#E1E6EF] bg-white">
                        <SelectValue placeholder="Self" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Radius */}
                  <div className="space-y-2">
                    <Label className="text-[#2A3547] text-sm" style={{ fontWeight: 500 }}>
                      Radius
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="1"
                        value={radiusValue}
                        onChange={(e) => setRadiusValue(e.target.value)}
                        className="border-[#E1E6EF] bg-white flex-1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRadiusUnit('kilometer')}
                          className={`p-2 rounded-lg transition-all ${
                            radiusUnit === 'kilometer'
                              ? 'bg-[#0D47A1] text-white'
                              : 'bg-white text-[#67727E] border border-[#E1E6EF]'
                          }`}
                          style={{ width: '100px' }}
                        >
                          <Circle size={14} className="inline mr-1" />
                          Kilometer
                        </button>
                        <button
                          onClick={() => setRadiusUnit('meter')}
                          className={`p-2 rounded-lg transition-all ${
                            radiusUnit === 'meter'
                              ? 'bg-[#0D47A1] text-white'
                              : 'bg-white text-[#67727E] border border-[#E1E6EF]'
                          }`}
                          style={{ width: '100px' }}
                        >
                          <Circle size={14} className="inline mr-1" />
                          Meter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-[#F5F7FA] p-4 rounded-xl">
                <div className="flex gap-2 mb-4">
                  <button className="px-4 py-2 bg-white border border-[#E1E6EF] rounded-lg text-[#2A3547] text-sm hover:bg-gray-50">
                    Map
                  </button>
                  <button className="px-4 py-2 bg-white border border-[#E1E6EF] rounded-lg text-[#2A3547] text-sm hover:bg-gray-50">
                    Satellite
                  </button>
                </div>
                
                {/* Map Display */}
                <div 
                  className="w-full h-[400px] bg-cover bg-center rounded-lg border-2 border-[#E1E6EF]"
                  style={{ 
                    backgroundImage: `url(${mapBackground})`,
                  }}
                >
                  {/* Sample geofence circle on map */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative">
                      <Circle className="h-32 w-32 text-blue-500 opacity-30 fill-blue-200" />
                      <MapPin className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
