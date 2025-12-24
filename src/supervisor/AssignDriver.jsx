import { useEffect, useState } from "react";

export function AssignDriver() {
  const [vehicles, setVehicles] = useState([]);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  // Driver form fields
  const [driverName, setDriverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseValidUpto, setLicenseValidUpto] = useState("");
  const [assignedFrom, setAssignedFrom] = useState(new Date().toISOString().split("T")[0]);
  const [changeReason, setChangeReason] = useState("");

  // UI states
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [driverHistory, setDriverHistory] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
  const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

  /* =====================================
     FETCH DATA
  ===================================== */
  useEffect(() => {
    fetchVehicles();
    fetchCurrentAssignments();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/assign-driver/vehicles`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();

      // If no vehicles from API, use sample data for testing
      const vehicleData = Array.isArray(data) && data.length > 0 ? data : [
        { vehicle_id: "1", vehicle_number: "HR55AN2175" },
        { vehicle_id: "2", vehicle_number: "DL01AB1234" },
        { vehicle_id: "3", vehicle_number: "MH12CD5678" },
        { vehicle_id: "4", vehicle_number: "KA05EF9012" },
      ];

      setVehicles(vehicleData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      // Use sample data for testing
      setVehicles([
        { vehicle_id: "1", vehicle_number: "HR55AN2175" },
        { vehicle_id: "2", vehicle_number: "DL01AB1234" },
        { vehicle_id: "3", vehicle_number: "MH12CD5678" },
        { vehicle_id: "4", vehicle_number: "KA05EF9012" },
      ]);
    }
  };

  const fetchCurrentAssignments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/assign-driver/current`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setCurrentAssignments(Array.isArray(data) ? data : []);
    } catch {
      setCurrentAssignments([]);
    }
  };

  const fetchDriverHistory = async (vehicleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assign-driver/history/${vehicleId}`, {
        headers: { "x-role": "SUPERVISOR" },
      });
      const data = await res.json();
      setDriverHistory(Array.isArray(data) ? data : []);
    } catch {
      setDriverHistory([]);
    }
  };

  /* =====================================
     ASSIGN DRIVER
  ===================================== */
  const handleAssignDriver = async () => {
    if (loading) return;

    if (!vehicleId || !driverName) {
      alert("Please select vehicle and enter driver name");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        driver_name: driverName,
        phone_number: phoneNumber,
        license_number: licenseNumber,
        license_valid_upto: licenseValidUpto,
        vehicle_id: vehicleId,
        vehicle_number: vehicleNumber,
        assigned_from: assignedFrom ? new Date(assignedFrom).toISOString() : new Date().toISOString(),
        change_reason: changeReason || "New driver assignment",
        changed_by: "supervisor-id",
      };

      const res = await fetch(`${API_BASE_URL}/assign-driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-role": "SUPERVISOR",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Assignment failed");

      // Reset form
      setDriverName("");
      setPhoneNumber("");
      setLicenseNumber("");
      setLicenseValidUpto("");
      setAssignedFrom(new Date().toISOString().split("T")[0]);
      setChangeReason("");
      setVehicleId("");
      setVehicleNumber("");
      setSearch("");
      setShowList(false);

      fetchCurrentAssignments();
    } catch (error) {
      alert("Failed to assign driver: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     END ASSIGNMENT
  ===================================== */
  const handleEndAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to end this driver assignment?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/assign-driver/end/${assignmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-role": "SUPERVISOR",
        },
        body: JSON.stringify({
          change_reason: "Assignment ended by supervisor",
          changed_by: "supervisor-id",
        }),
      });

      if (!res.ok) throw new Error("Failed to end assignment");

      fetchCurrentAssignments();
    } catch (error) {
      alert("Failed to end assignment: " + error.message);
    }
  };

  /* =====================================
     SHOW DRIVER HISTORY
  ===================================== */
  const handleShowHistory = async (vehicleId, vehicleNumber) => {
    setSelectedAssignment({ vehicle_id: vehicleId, vehicle_number: vehicleNumber });
    await fetchDriverHistory(vehicleId);
    setShowHistory(true);
  };

  const selectedVehicleNumber = vehicleNumber;

  /* =====================================
     UI
  ===================================== */
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT CARD - ASSIGNMENT FORM */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                👤 Assign Driver to Vehicle
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* VEHICLE SELECTION */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                    Vehicle Selection ({vehicles.length} vehicles available)
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search vehicle number..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={search || selectedVehicleNumber}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setVehicleId("");
                        setVehicleNumber("");
                        setShowList(true);
                      }}
                      onFocus={() => setShowList(true)}
                      onClick={() => setShowList(true)}
                      onBlur={() => {
                        // Delay closing to allow click on dropdown items
                        setTimeout(() => setShowList(false), 200);
                      }}
                    />
                    {showList && vehicles.length > 0 && (
                      <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
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
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing
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
                        {vehicles.filter(v =>
                          !search ||
                          v.vehicle_number?.toLowerCase().includes(search.toLowerCase())
                        ).length === 0 && (
                          <div className="p-3 text-gray-500 text-center">
                            No vehicles found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* DRIVER DETAILS */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                    Driver Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter driver name"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter license number"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Valid Upto
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={licenseValidUpto}
                        onChange={(e) => setLicenseValidUpto(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned From
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={assignedFrom}
                        onChange={(e) => setAssignedFrom(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* CHANGE REASON */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change Reason (Optional)
                  </label>
                  <textarea
                    placeholder="Reason for assignment/change"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    onClick={handleAssignDriver}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
                  >
                    {loading ? "Assigning..." : "Assign Driver"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CARD - CURRENT ASSIGNMENTS */}
          <div className="space-y-4 overflow-hidden flex flex-col">
            {/* CURRENT ASSIGNMENTS */}
            <div className="bg-white rounded-xl border shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">
                  🚗 Current Driver Assignments
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {currentAssignments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No current assignments</p>
                      <p className="text-sm text-gray-400">Assign drivers to vehicles</p>
                    </div>
                  ) : (
                    currentAssignments.map((assignment) => (
                      <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 h-screen overflow-hidden">
                            <p className="font-semibold text-gray-800">{assignment.vehicle_number}</p>
                            <p className="text-sm text-blue-600 font-medium">
                              👤 {assignment.driver_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShowHistory(assignment.vehicle_id, assignment.vehicle_number)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                            >
                              History
                            </button>
                            <button
                              onClick={() => handleEndAssignment(assignment.assignment_id)}
                              className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-600"
                            >
                              End
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {assignment.phone_number && (
                            <div className="text-gray-600">
                              📞 {assignment.phone_number}
                            </div>
                          )}
                          {assignment.license_number && (
                            <div className="text-gray-600">
                              🪪 {assignment.license_number}
                            </div>
                          )}
                          {assignment.license_valid_upto && (
                            <div className="text-gray-600 col-span-2">
                              📅 License valid till: {new Date(assignment.license_valid_upto).toLocaleDateString()}
                            </div>
                          )}
                          <div className="text-gray-600 col-span-2">
                            📆 Assigned: {new Date(assignment.assigned_from).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DRIVER HISTORY MODAL */}
      {showHistory && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Driver History - {selectedAssignment.vehicle_number}
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {driverHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No driver history found</p>
                ) : (
                  driverHistory.map((record) => (
                    <div key={record.assignment_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{record.driver_name}</p>
                          <p className="text-sm text-gray-600">
                            {record.is_current ? "Current Driver" : "Previous Driver"}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.is_current ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {record.driver_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div>📅 From: {new Date(record.assigned_from).toLocaleDateString()}</div>
                        {record.assigned_to && (
                          <div>📅 To: {new Date(record.assigned_to).toLocaleDateString()}</div>
                        )}
                        {record.phone_number && <div>📞 {record.phone_number}</div>}
                        {record.license_number && <div>🪪 {record.license_number}</div>}
                        {record.change_reason && (
                          <div className="col-span-2 text-gray-600 italic">
                            💬 {record.change_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}