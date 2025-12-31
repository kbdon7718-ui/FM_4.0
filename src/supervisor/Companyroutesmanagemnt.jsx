import React, { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Edit, Trash2, Clock, Car, Activity } from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "../components/ui/page-header.jsx";
import { SectionCard, SectionCardHeader, SectionCardContent } from "../components/ui/section-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { useMapplsSdk } from "../hooks/useMapplsSdk.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

export function Companyroutesmanagemnt() {

  // State
  const [routes, setRoutes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  // New company form
  const [newCompanyName, setNewCompanyName] = useState("");
  const [companyLoading, setCompanyLoading] = useState(false);
  // For route visualization
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCompanyRoute, setSelectedCompanyRoute] = useState(null);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const { ready: mapplsReady } = useMapplsSdk({ timeoutMs: 10000 });

  // Add new company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setCompanyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: newCompanyName })
      });
      if (!res.ok) throw new Error("Failed to add company");
      setNewCompanyName("");
      fetchCompanies();
    } catch (err) {
      alert("Failed to add company");
    } finally {
      setCompanyLoading(false);
    }
  };

  // Fetch and show route for selected company
  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    // Fetch routes for this company
    try {
      const res = await fetch(`${API_BASE_URL}/company-routes?company_id=${company.company_id}`);
      if (!res.ok) throw new Error("Failed to fetch routes");
      const data = await res.json();
      // Pick the first route for now (could add a selector if multiple)
      setSelectedCompanyRoute(data[0] || null);
    } catch (err) {
      setSelectedCompanyRoute(null);
    }
  };

  // Draw polyline for selected route
  useEffect(() => {
    if (!mapplsReady) return;
    if (!window.mappls || !mapRef.current || !selectedCompanyRoute || !selectedCompanyRoute.stops?.length) return;
    // Remove previous polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    const stops = selectedCompanyRoute.stops.map(s => [s.lat, s.lng]);
    polylineRef.current = new window.mappls.Polyline({
      map: mapRef.current,
      path: stops,
      strokeColor: "#0D47A1",
      strokeWeight: 5,
      strokeOpacity: 0.8
    });
    // Center map on first stop
    if (stops.length) mapRef.current.setCenter(stops[0]);
    // Fit bounds (optional)
    // ...
    return () => {
      if (polylineRef.current) polylineRef.current.remove();
    };
  }, [selectedCompanyRoute, mapplsReady]);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLog, setActivityLog] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    company_id: "",
    route_name: "",
    start_time: "",
    end_time: "",
    stops: [],
    vehicles: [],
  });

  // Stop form state
  const [stopForm, setStopForm] = useState({
    stop_name: "",
    lat: "",
    lng: "",
    radius: 150,
    expected_time: "",
  });

  // Vehicle search
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleList, setShowVehicleList] = useState(false);

  /* =====================================
     FETCH DATA
  ===================================== */
  const fetchRoutes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/company-routes`);
      if (!res.ok) throw new Error("Failed to fetch routes");
      const data = await res.json();
      setRoutes(data);
    } catch (error) {
      console.error("Fetch routes error:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies`);
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error("Fetch companies error:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Fetch vehicles error:", error);
    }
  };

  const fetchActivityLog = async (routeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/company-routes/${routeId}/activity`);
      if (!res.ok) throw new Error("Failed to fetch activity log");
      const data = await res.json();
      setActivityLog(data);
      setShowActivityLog(true);
    } catch (error) {
      console.error("Fetch activity log error:", error);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchCompanies();
    fetchVehicles();
  }, []);

  /* =====================================
     FORM HANDLERS
  ===================================== */
  const resetForm = () => {
    setFormData({
      company_id: "",
      route_name: "",
      start_time: "",
      end_time: "",
      stops: [],
      vehicles: [],
    });
    setEditingRoute(null);
    setShowForm(false);
  };

  const handleEdit = (route) => {
    setFormData({
      company_id: route.company_id,
      route_name: route.route_name,
      start_time: route.start_time || "",
      end_time: route.end_time || "",
      stops: route.stops || [],
      vehicles: route.vehicles || [],
    });
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleDelete = async (routeId, routeName) => {
    if (!confirm(`Delete route "${routeName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/company-routes/${routeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changed_by: "supervisor-id" }),
      });

      if (!res.ok) throw new Error("Failed to delete route");

      fetchRoutes();
    } catch (error) {
      alert("Failed to delete route: " + error.message);
    }
  };

  /* =====================================
     STOP MANAGEMENT
  ===================================== */
  const addStop = () => {
    if (!stopForm.stop_name || !stopForm.lat || !stopForm.lng) {
      alert("Please fill stop name, latitude, and longitude");
      return;
    }

    const newStop = {
      stop_name: stopForm.stop_name,
      lat: parseFloat(stopForm.lat),
      lng: parseFloat(stopForm.lng),
      radius: parseInt(stopForm.radius),
      expected_time: stopForm.expected_time,
    };

    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));

    setStopForm({
      stop_name: "",
      lat: "",
      lng: "",
      radius: 150,
      expected_time: "",
    });
  };

  const removeStop = (index) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  /* =====================================
     VEHICLE MANAGEMENT
  ===================================== */
  const addVehicle = (vehicle) => {
    if (formData.vehicles.find(v => v.vehicle_id === vehicle.vehicle_id)) {
      alert("Vehicle already added to route");
      return;
    }

    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, {
        vehicle_id: vehicle.vehicle_id,
        vehicle_number: vehicle.vehicle_number
      }]
    }));

    setVehicleSearch("");
    setShowVehicleList(false);
  };

  const removeVehicle = (vehicleId) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.vehicle_id !== vehicleId)
    }));
  };

  /* =====================================
     SUBMIT FORM
  ===================================== */
  const handleSubmit = async () => {
    if (!formData.company_id || !formData.route_name || formData.stops.length === 0) {
      alert("Please fill company, route name, and add at least one stop");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        created_by: "supervisor-id",
      };

      const url = editingRoute
        ? `${API_BASE_URL}/company-routes/${editingRoute.route_id}`
        : `${API_BASE_URL}/company-routes`;

      const method = editingRoute ? "PUT" : "POST";

      if (editingRoute) {
        payload.changed_by = "supervisor-id";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save route");

      resetForm();
      fetchRoutes();
    } catch (error) {
      alert("Failed to save route: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader>
        <div>
          <PageHeaderTitle>Company Routes</PageHeaderTitle>
          <PageHeaderDescription>
            Manage client routes, stops, and assigned vehicles with a live map preview
          </PageHeaderDescription>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px] h-[calc(100svh-168px)] min-h-[620px]">
        {/* LEFT: ROUTES + EDITOR */}
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader
            title={`Routes (${routes.length})`}
            description="Create, edit, delete and review route activity"
            action={
              <Button type="button" onClick={() => setShowForm(true)} size="sm">
                <Plus className="h-4 w-4" />
                New Route
              </Button>
            }
          />
          <SectionCardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4">
              {routes.map((route) => (
                <div key={route.route_id} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{route.route_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.stops?.length || 0} stops • {route.vehicles?.length || 0} vehicles
                      </p>
                      {route.start_time && route.end_time && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={14} />
                          {route.start_time} - {route.end_time}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchActivityLog(route.route_id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="View Activity Log"
                      >
                        <Activity size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(route)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-info-muted bg-info-muted text-info hover:bg-info-muted/70"
                        title="Edit Route"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.route_id, route.route_name)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-destructive-muted bg-destructive-muted text-destructive hover:bg-destructive-muted/70"
                        title="Delete Route"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCardContent>
        </SectionCard>

        {/* RIGHT: COMPANIES + MAP PREVIEW */}
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader title="Companies" description="Pick a company to preview its route" />
          <SectionCardContent className="p-4 sm:p-6 space-y-4 flex-1 min-h-0">
            {/* Add New Company */}
            <form className="flex gap-3 items-center" onSubmit={handleAddCompany}>
              <input
                type="text"
                value={newCompanyName}
                onChange={e => setNewCompanyName(e.target.value)}
                placeholder="New company name"
                className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                disabled={companyLoading}
              />
              <Button
                type="submit"
                disabled={companyLoading || !newCompanyName.trim()}
                size="sm"
              >
                {companyLoading ? "Adding..." : "Add"}
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {companies.map(company => (
                <Button
                  key={company.company_id}
                  type="button"
                  variant={selectedCompany?.company_id === company.company_id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCompanyClick(company)}
                >
                  {company.company_name}
                </Button>
              ))}
            </div>

            <div className="flex-1 min-h-0">
              <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
                <div className="p-3 border-b border-border bg-muted/30">
                  <div className="text-sm font-medium text-foreground">
                    {selectedCompanyRoute
                      ? `Route: ${selectedCompanyRoute.route_name}`
                      : 'Route preview'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCompany?.company_name ? selectedCompany.company_name : 'Select a company'}
                  </div>
                </div>

                <div className="h-[calc(100svh-520px)] min-h-[260px]">
                  {selectedCompanyRoute ? (
                    <div
                      id="company-route-map"
                      className="w-full h-full"
                      ref={el => {
                        if (el && !mapRef.current && window.mappls) {
                          mapRef.current = new window.mappls.Map(el, {
                            center: selectedCompanyRoute.stops?.length
                              ? [selectedCompanyRoute.stops[0].lat, selectedCompanyRoute.stops[0].lng]
                              : [28.61, 77.2],
                            zoom: 13
                          });
                        }
                      }}
                    />
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">
                      Choose a company to view its route on the map.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionCardContent>
        </SectionCard>
      </div>

      {showActivityLog && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Route activity log">
          <div className="mx-auto my-8 w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Route Activity Log</h2>
                <p className="text-sm text-muted-foreground">Recent changes made to this route</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setShowActivityLog(false)}>
                Close
              </Button>
            </div>

            <div className="p-4 sm:p-6 max-h-[75svh] overflow-y-auto">
              {activityLog.length === 0 ? (
                <div className="text-sm text-muted-foreground">No activity entries found.</div>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((a, idx) => (
                    <div key={a.activity_id || idx} className="rounded-lg border border-border bg-muted/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {a.action || a.activity_type || 'Activity'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {a.changed_by || a.user_id || '—'}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}
                        </div>
                      </div>
                      {a.details && (
                        <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{String(a.details)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Create or edit route">
          <div className="mx-auto my-8 w-full max-w-4xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {editingRoute ? 'Edit Route' : 'Create New Route'}
                </h2>
                <p className="text-sm text-muted-foreground">Define stops and assign vehicles</p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 sm:p-6 max-h-[80svh] overflow-y-auto">
              <div className="space-y-6">
                {/* BASIC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                    <select
                      value={formData.company_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Route Name</label>
                    <input
                      type="text"
                      value={formData.route_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, route_name: e.target.value }))}
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="e.g. Morning Pickup"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {/* STOPS */}
                <div className="border border-border rounded-xl p-4 sm:p-5 bg-muted/10">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin size={18} />
                    Stops ({formData.stops.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Stop name"
                      value={stopForm.stop_name}
                      onChange={(e) => setStopForm(prev => ({ ...prev, stop_name: e.target.value }))}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <input
                      type="time"
                      placeholder="Expected time"
                      value={stopForm.expected_time}
                      onChange={(e) => setStopForm(prev => ({ ...prev, expected_time: e.target.value }))}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={stopForm.lat}
                      onChange={(e) => setStopForm(prev => ({ ...prev, lat: e.target.value }))}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={stopForm.lng}
                      onChange={(e) => setStopForm(prev => ({ ...prev, lng: e.target.value }))}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Radius (m)"
                      value={stopForm.radius}
                      onChange={(e) => setStopForm(prev => ({ ...prev, radius: e.target.value }))}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="mt-3">
                    <Button type="button" onClick={addStop} className="w-full">
                      Add Stop
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {formData.stops.map((stop, index) => (
                      <div key={index} className="flex items-start justify-between gap-3 border border-info-muted bg-info-muted p-3 rounded">
                        <div className="min-w-0">
                          <span className="font-medium text-foreground">{stop.stop_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({stop.lat}, {stop.lng}) • {stop.radius}m • {stop.expected_time}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeStop(index)}
                          className="h-9 w-9"
                          aria-label="Remove stop"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VEHICLES */}
                <div className="border border-border rounded-xl p-4 sm:p-5 bg-muted/10">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Car size={18} />
                    Assigned Vehicles ({formData.vehicles.length})
                  </h3>

                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search vehicle number..."
                      value={vehicleSearch}
                      onChange={(e) => {
                        setVehicleSearch(e.target.value);
                        setShowVehicleList(true);
                      }}
                      onFocus={() => setShowVehicleList(true)}
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {showVehicleList && (
                      <div className="absolute z-20 w-full bg-popover text-popover-foreground border border-border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {vehicles
                          .filter(v =>
                            !vehicleSearch ||
                            v.vehicle_number?.toLowerCase().includes(vehicleSearch.toLowerCase())
                          )
                          .map((vehicle) => (
                            <div
                              key={vehicle.vehicle_id}
                              className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border/60 last:border-b-0"
                              onClick={() => addVehicle(vehicle)}
                            >
                              {vehicle.vehicle_number}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {formData.vehicles.map((vehicle) => (
                      <div key={vehicle.vehicle_id} className="flex justify-between items-center border border-success-muted bg-success-muted p-3 rounded">
                        <span className="font-medium text-foreground">{vehicle.vehicle_number}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeVehicle(vehicle.vehicle_id)}
                          className="h-9 w-9"
                          aria-label="Remove vehicle"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : editingRoute ? "Update Route" : "Create Route"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}