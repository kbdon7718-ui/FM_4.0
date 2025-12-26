import { useEffect, useState } from "react";

export function Maintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [category, setCategory] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [odometerKm, setOdometerKm] = useState("");
  const [nextDueKm, setNextDueKm] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [cost, setCost] = useState("");
  const [remarks, setRemarks] = useState("");

  // Type-specific fields
  const [tyreSerialNumber, setTyreSerialNumber] = useState("");
  const [tyrePosition, setTyrePosition] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUpto, setValidUpto] = useState("");
  const [breakdownLocation, setBreakdownLocation] = useState("");
  const [downtimeHours, setDowntimeHours] = useState("");

  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
  const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

  // Maintenance type options
  const maintenanceTypes = [
    { value: "SERVICE", label: "Service" },
    { value: "COMPLIANCE", label: "Compliance" },
    { value: "TYRE", label: "Tyre" },
    { value: "BREAKDOWN", label: "Breakdown" },
  ];

  // Category options based on maintenance type
  const getCategoryOptions = (type) => {
    switch (type) {
      case "SERVICE":
        return [
          "Engine Oil",
          "General Service",
          "Brake Service",
          "Clutch",
          "Gear Oil",
          "Coolant"
        ];
      case "COMPLIANCE":
        return [
          "Pollution Certificate",
          "Insurance",
          "RTO Tax",
          "Fitness Validity"
        ];
      case "TYRE":
        return [
          "Rotation",
          "Replacement"
        ];
      case "BREAKDOWN":
        return [
          "Engine Issue",
          "Electrical",
          "Accident",
          "Other"
        ];
      default:
        return [];
    }
  };

  const tyrePositions = [
    "Front Left", "Front Right", "Rear Left", "Rear Right", "Spare"
  ];

  /* =====================================
     FETCH VEHICLES + RECENT MAINTENANCE + ALERTS
  ===================================== */
  useEffect(() => {
    fetchVehicles();
    fetchRecentMaintenance();
    fetchAlerts();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/maintenance/vehicles`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    }
  };

  const fetchRecentMaintenance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/maintenance/recent`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setRecentEntries(Array.isArray(data) ? data : []);
    } catch {
      setRecentEntries([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/maintenance/alerts`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      setAlerts([]);
    }
  };

  /* =====================================
     SUBMIT MAINTENANCE ENTRY
  ===================================== */
  const handleSubmit = async () => {
    if (loading) return;

    if (!vehicleId || !maintenanceType || !serviceDate) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vehicle_id: vehicleId,
        vehicle_number: vehicleNumber,
        maintenance_type: maintenanceType,
        category,
        service_date: serviceDate,
        odometer_km: odometerKm,
        next_due_km: nextDueKm,
        next_due_date: nextDueDate,
        cost,
        remarks,
        entered_by: "supervisor-id",
      };

      // Add type-specific fields
      if (maintenanceType === "TYRE") {
        payload.tyre_serial_number = tyreSerialNumber;
        payload.tyre_position = tyrePosition;
      } else if (maintenanceType === "COMPLIANCE") {
        payload.valid_from = validFrom;
        payload.valid_upto = validUpto;
      } else if (maintenanceType === "BREAKDOWN") {
        payload.breakdown_location = breakdownLocation;
        payload.downtime_hours = downtimeHours;
      }

      const res = await fetch(`${API_BASE_URL}/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-role": "SUPERVISOR",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Insert failed");

      // Reset form
      setMaintenanceType("");
      setCategory("");
      setOdometerKm("");
      setNextDueKm("");
      setNextDueDate("");
      setCost("");
      setRemarks("");
      setTyreSerialNumber("");
      setTyrePosition("");
      setValidFrom("");
      setValidUpto("");
      setBreakdownLocation("");
      setDowntimeHours("");
      setVehicleId("");
      setVehicleNumber("");
      setSearch("");
      setShowList(false);

      fetchRecentMaintenance();
    } catch (error) {
      alert("Failed to save maintenance entry: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicleNumber = vehicleNumber;

  // Handle maintenance type change
  const handleMaintenanceTypeChange = (type) => {
    setMaintenanceType(type);
    setCategory(""); // Reset category when type changes
  };

  /* =====================================
     UI
  ===================================== */
  return (
    <div className="space-y-4">
      {/* ALERTS BAR - FIXED AT TOP */}
      {alerts.length > 0 && (
        <div
          className="bg-destructive-muted border border-destructive-muted border-l-4 p-4 rounded-lg"
          style={{ borderLeftColor: 'var(--destructive)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-destructive">
                🚨 Maintenance Alerts ({alerts.length})
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {alerts.slice(0, 3).map((alert) => (
                  <span
                    key={alert.alert_id}
                    className="bg-destructive-muted border border-destructive-muted text-destructive px-2 py-1 rounded text-sm"
                  >
                    {alert.vehicle_number}: {alert.alert_message}
                  </span>
                ))}
                {alerts.length > 3 && (
                  <span className="text-destructive text-sm">+{alerts.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT CARD - FORM (SCROLLABLE) */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              🔧 Record Maintenance Entry
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* BASIC INFO SECTION */}
              <div className="bg-muted/30 border border-border p-4 rounded-lg">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VEHICLE */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Vehicle *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search vehicle number..."
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={search || selectedVehicleNumber}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setVehicleId("");
                          setVehicleNumber("");
                          setShowList(true);
                        }}
                        onFocus={() => setShowList(true)}
                      />
                      {showList && (
                        <div className="absolute z-20 w-full bg-popover text-popover-foreground border border-border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                          {vehicles
                            .filter(v =>
                              !search ||
                              v.vehicle_number
                                ?.toLowerCase()
                                .includes(search.toLowerCase())
                            )
                            .map((vehicle) => (
                              <div
                                key={vehicle.vehicle_id}
                                className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border/60 last:border-b-0"
                                onClick={() => {
                                  setVehicleId(vehicle.vehicle_id);
                                  setVehicleNumber(vehicle.vehicle_number);
                                  setSearch(vehicle.vehicle_number);
                                  setShowList(false);
                                }}
                              >
                                {vehicle.vehicle_number}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MAINTENANCE TYPE */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Maintenance Type *
                    </label>
                    <select
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={maintenanceType}
                      onChange={(e) => handleMaintenanceTypeChange(e.target.value)}
                    >
                      <option value="">Select Type</option>
                      {maintenanceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CATEGORY */}
                  {maintenanceType && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Category *
                      </label>
                      <select
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {getCategoryOptions(maintenanceType).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SERVICE DETAILS SECTION */}
              <div className="bg-info-muted border border-info-muted p-4 rounded-lg">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Service Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SERVICE DATE */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Service Date *
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                    />
                  </div>

                  {/* ODOMETER KM */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Odometer (KM)
                    </label>
                    <input
                      type="number"
                      placeholder="Current reading"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={odometerKm}
                      onChange={(e) => setOdometerKm(e.target.value)}
                    />
                  </div>

                  {/* NEXT DUE KM */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Next Due KM
                    </label>
                    <input
                      type="number"
                      placeholder="Next service at KM"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={nextDueKm}
                      onChange={(e) => setNextDueKm(e.target.value)}
                    />
                  </div>

                  {/* NEXT DUE DATE */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                    />
                  </div>

                  {/* COST */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Cost (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter cost"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* TYPE-SPECIFIC FIELDS */}
              {maintenanceType === "TYRE" && (
                <div className="bg-success-muted border border-success-muted p-4 rounded-lg">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Tyre Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Tyre Serial Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter serial number"
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={tyreSerialNumber}
                        onChange={(e) => setTyreSerialNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Tyre Position
                      </label>
                      <select
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={tyrePosition}
                        onChange={(e) => setTyrePosition(e.target.value)}
                      >
                        <option value="">Select Position</option>
                        {tyrePositions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {maintenanceType === "COMPLIANCE" && (
                <div className="bg-warning-muted border border-warning-muted p-4 rounded-lg">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Compliance Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Valid From
                      </label>
                      <input
                        type="date"
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Valid Upto
                      </label>
                      <input
                        type="date"
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={validUpto}
                        onChange={(e) => setValidUpto(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {maintenanceType === "BREAKDOWN" && (
                <div className="bg-destructive-muted border border-destructive-muted p-4 rounded-lg">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Breakdown Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Breakdown Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter location"
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={breakdownLocation}
                        onChange={(e) => setBreakdownLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Downtime Hours
                      </label>
                      <input
                        type="number"
                        placeholder="Hours of downtime"
                        className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={downtimeHours}
                        onChange={(e) => setDowntimeHours(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* REMARKS */}
              <div className="bg-muted/30 border border-border p-4 rounded-lg">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Remarks
                </label>
                <textarea
                  placeholder="Additional remarks or notes"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? "Saving..." : "Save Maintenance Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD - RECENT ENTRIES & ALERTS */}
        <div className="space-y-4 flex flex-col">
          {/* ALERTS */}
          {alerts.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4 flex-shrink-0">
              <h3 className="text-base font-semibold mb-3 text-destructive">
                🚨 Maintenance Alerts
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.alert_id}
                    className="border border-destructive-muted bg-destructive-muted p-3 rounded"
                    style={{ borderLeftWidth: 4, borderLeftColor: 'var(--destructive)' }}
                  >
                    <p className="font-medium text-sm text-foreground">{alert.vehicle_number}</p>
                    <p className="text-xs text-muted-foreground">{alert.alert_message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.alert_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT ENTRIES */}
          <div className="bg-card rounded-xl border border-border flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
              <h3 className="text-base font-semibold text-foreground">
                📋 Recent Maintenance Entries
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '65vh' }}>
              <div className="space-y-3">
                {recentEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent entries</p>
                    <p className="text-sm text-muted-foreground">Maintenance records will appear here</p>
                  </div>
                ) : (
                  recentEntries.map((entry) => (
                    <div key={entry.maintenance_id} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/20 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{entry.vehicle_number}</p>
                          <p className="text-sm text-info capitalize font-medium truncate">
                            {entry.maintenance_type} {entry.category && `- ${entry.category}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted/30 border border-border px-2 py-1 rounded">
                          {new Date(entry.service_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {entry.odometer_km && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Odometer:</span> {entry.odometer_km} KM
                          </div>
                        )}
                        {entry.cost && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Cost:</span> ₹{entry.cost}
                          </div>
                        )}
                        {entry.next_due_date && (
                          <div className="text-muted-foreground col-span-2">
                            <span className="font-medium">Next Due:</span> {new Date(entry.next_due_date).toLocaleDateString()}
                          </div>
                        )}
                        {entry.valid_upto && (
                          <div className="text-destructive col-span-2 font-medium">
                            <span className="font-medium">Valid Upto:</span> {new Date(entry.valid_upto).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {entry.remarks && (
                        <p className="text-sm text-muted-foreground italic mt-2 border-t border-border pt-2">
                          {entry.remarks}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}