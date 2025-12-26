import { useEffect, useState } from "react";

export function FuelEntry() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [fuel, setFuel] = useState("");
  const [price, setPrice] = useState(""); // UI-only
  const [odometer, setOdometer] = useState(""); // ✅ NEW
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // kept but unused (as requested)
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);

  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5002";
  const API_BASE_URL = BASE_URL.endsWith("/api")
    ? BASE_URL
    : `${BASE_URL}/api`;

  /* =====================================
     FETCH VEHICLES + RECENT FUEL
  ===================================== */
  useEffect(() => {
    fetchVehicles();
    fetchRecentFuel();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    }
  };

  const fetchRecentFuel = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/fuel/recent`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setRecentEntries(Array.isArray(data) ? data : []);
    } catch {
      setRecentEntries([]);
    }
  };

  /* =====================================
     CALCULATED COST (UI ONLY)
  ===================================== */
  const totalCost =
    fuel && price ? (Number(fuel) * Number(price)).toFixed(2) : "";

  /* =====================================
     SUBMIT FUEL ENTRY
  ===================================== */
  const handleSubmit = async () => {
    if (loading) return;

    if (!vehicleId || !fuel || !odometer) {
      alert("Please select vehicle, fuel and odometer reading");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/fuel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-role": "SUPERVISOR",
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          fuel_date: date,
          fuel_quantity: Number(fuel),
          odometer_reading: Number(odometer), // ✅ NEW
          entered_by: "supervisor-id",
        }),
      });

      if (!res.ok) throw new Error("Insert failed");

      setFuel("");
      setPrice("");
      setOdometer(""); // ✅ reset
      setVehicleId("");
      setSearch("");
      setShowList(false);

      fetchRecentFuel();
    } catch {
      alert("Failed to save fuel entry");
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicleNumber =
    vehicles.find(v => v.vehicle_id === vehicleId)?.vehicle_number || "";

  /* =====================================
     UI
  ===================================== */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* LEFT CARD */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground mb-5">
          Record Fuel Entry
        </h2>

        {/* VEHICLE */}
        <label className="block text-sm font-medium text-foreground mb-1">Vehicle</label>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search vehicle number..."
            className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={search || selectedVehicleNumber}
            onChange={(e) => {
              setSearch(e.target.value);
              setVehicleId("");
              setShowList(true);
            }}
            onFocus={() => setShowList(true)}
          />

          {showList && (
            <div
              className="absolute z-10 w-full bg-popover text-popover-foreground border border-border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {vehicles
                .filter(v =>
                  !search ||
                  v.vehicle_number
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map(v => (
                  <div
                    key={v.vehicle_id}
                    className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setVehicleId(v.vehicle_id);
                      setSearch(v.vehicle_number);
                      setShowList(false);
                    }}
                  >
                    {v.vehicle_number}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ODOMETER */}
        <label className="block text-sm font-medium text-foreground mb-1">
          Odometer Reading (km)
        </label>
        <input
          type="number"
          className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-4"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="e.g. 123456"
        />

        {/* FUEL */}
        <label className="block text-sm font-medium text-foreground mb-1">
          Fuel Amount (Liters)
        </label>
        <input
          type="number"
          className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-4"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
        />

        {/* PRICE */}
        <label className="block text-sm font-medium text-foreground mb-1">
          Fuel Price (₹ / Liter)
          <span className="text-xs text-muted-foreground"> (optional)</span>
        </label>
        <input
          type="number"
          className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-4"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* COST */}
        <label className="block text-sm font-medium text-foreground mb-1">Total Cost (₹)</label>
        <input
          type="text"
          className="w-full h-11 rounded-md border border-border bg-muted/30 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-4"
          value={totalCost}
          readOnly
        />

        {/* DATE */}
        <label className="block text-sm font-medium text-foreground mb-1">Date</label>
        <input
          type="date"
          className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-6"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? "Saving..." : "Record Entry"}
        </button>
      </div>

      {/* RIGHT CARD */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground mb-5">
          Recent Entries
        </h2>

        {recentEntries.map((e) => (
          <div
            key={e.fuel_entry_id}
            className="flex items-start justify-between gap-3 bg-muted/20 border border-border p-4 rounded-lg mb-3"
          >
            <div>
              <p className="font-semibold text-foreground">
                {e.vehicles?.vehicle_number || "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {e.fuel_quantity} L
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {e.fuel_date}
              </p>
            </div>
          </div>
        ))}

        {recentEntries.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            No recent entries.
          </div>
        )}
      </div>
    </div>
  );
}
