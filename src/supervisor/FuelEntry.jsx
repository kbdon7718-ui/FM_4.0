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
    <div className="h-full overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* LEFT CARD */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-6">
          ⛽ Record Fuel Entry
        </h2>

        {/* VEHICLE */}
        <label className="block text-sm mb-1">Vehicle</label>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search vehicle number..."
            className="w-full border rounded-lg p-2"
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
              className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow"
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
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50"
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
        <label className="block text-sm mb-1">
          Odometer Reading (km)
        </label>
        <input
          type="number"
          className="w-full border rounded-lg p-2 mb-4"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="e.g. 123456"
        />

        {/* FUEL */}
        <label className="block text-sm mb-1">
          Fuel Amount (Liters)
        </label>
        <input
          type="number"
          className="w-full border rounded-lg p-2 mb-4"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
        />

        {/* PRICE */}
        <label className="block text-sm mb-1">
          Fuel Price (₹ / Liter)
          <span className="text-xs text-gray-400"> (optional)</span>
        </label>
        <input
          type="number"
          className="w-full border rounded-lg p-2 mb-4"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* COST */}
        <label className="block text-sm mb-1">Total Cost (₹)</label>
        <input
          type="text"
          className="w-full border rounded-lg p-2 mb-4 bg-gray-100"
          value={totalCost}
          readOnly
        />

        {/* DATE */}
        <label className="block text-sm mb-1">Date</label>
        <input
          type="date"
          className="w-full border rounded-lg p-2 mb-6"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
        >
          {loading ? "Saving..." : "Record Entry"}
        </button>
      </div>

      {/* RIGHT CARD */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-6">
          🕒 Recent Entries
        </h2>

        {recentEntries.map((e) => (
          <div
            key={e.fuel_entry_id}
            className="flex justify-between bg-gray-50 p-4 rounded-lg mb-3"
          >
            <div>
              <p className="font-semibold">
                {e.vehicles?.vehicle_number || "—"}
              </p>
              <p className="text-sm text-gray-500">
                {e.fuel_quantity} L
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {e.fuel_date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
