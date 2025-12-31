import { useEffect, useState } from "react";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "../components/ui/page-header.jsx";
import { SectionCard, SectionCardHeader, SectionCardContent } from "../components/ui/section-card.jsx";
import { Button } from "../components/ui/button.jsx";

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
      const res = await fetch(`${API_BASE_URL}/vehicles`, {
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
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageHeaderTitle>Assign Driver</PageHeaderTitle>
          <PageHeaderDescription>
            Assign and manage drivers for vehicles, and review assignment history
          </PageHeaderDescription>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT CARD - ASSIGNMENT FORM */}
        <SectionCard className="lg:col-span-2 overflow-hidden">
          <SectionCardHeader title="Assign driver to vehicle" description="Select a vehicle and enter driver details" />
          <SectionCardContent className="p-4 sm:p-6">
            <div className="space-y-6">

              {/* VEHICLE SELECTION */}
              <div className="bg-muted/30 border border-border p-4 rounded-lg">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Vehicle Selection ({vehicles.length} vehicles available)
                </h3>
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
                    onClick={() => setShowList(true)}
                    onBlur={() => {
                      // Delay closing to allow click on dropdown items
                      setTimeout(() => setShowList(false), 200);
                    }}
                  />
                  {showList && vehicles.length > 0 && (
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
                        <div className="p-3 text-muted-foreground text-center">
                          No vehicles found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* DRIVER DETAILS */}
              <div className="bg-muted/30 border border-border p-4 rounded-lg">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Driver Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Driver Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter driver name"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter license number"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      License Valid Upto
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={licenseValidUpto}
                      onChange={(e) => setLicenseValidUpto(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Assigned From
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={assignedFrom}
                      onChange={(e) => setAssignedFrom(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* CHANGE REASON */}
              <div className="bg-muted/30 border border-border p-4 rounded-lg">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Change Reason (Optional)
                </label>
                <textarea
                  placeholder="Reason for assignment/change"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows="2"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4">
                <Button type="button" onClick={handleAssignDriver} disabled={loading} className="w-full">
                  {loading ? "Assigning..." : "Assign Driver"}
                </Button>
              </div>
            </div>
          </SectionCardContent>
        </SectionCard>

        {/* RIGHT CARD - CURRENT ASSIGNMENTS */}
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader title="Current assignments" description="End assignments or view history" />
          <SectionCardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: '65vh' }}>
            <div className="space-y-3">
              {currentAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No current assignments</p>
                  <p className="text-sm text-muted-foreground">Assign drivers to vehicles</p>
                </div>
              ) : (
                currentAssignments.map((assignment) => (
                  <div key={assignment.assignment_id} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{assignment.vehicle_number}</p>
                        <p className="text-sm text-info font-medium truncate">
                          {assignment.driver_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowHistory(assignment.vehicle_id, assignment.vehicle_number)}
                        >
                          History
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEndAssignment(assignment.assignment_id)}
                        >
                          End
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {assignment.phone_number && (
                        <div className="text-muted-foreground">{assignment.phone_number}</div>
                      )}
                      {assignment.license_number && (
                        <div className="text-muted-foreground">{assignment.license_number}</div>
                      )}
                      {assignment.license_valid_upto && (
                        <div className="text-muted-foreground col-span-2">
                          License valid till: {new Date(assignment.license_valid_upto).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-muted-foreground col-span-2">
                        Assigned: {new Date(assignment.assigned_from).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCardContent>
        </SectionCard>
      </div>

      {/* DRIVER HISTORY MODAL */}
      {showHistory && selectedAssignment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Driver History - {selectedAssignment.vehicle_number}
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowHistory(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 72px)' }}>
              <div className="space-y-4">
                {driverHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No driver history found</p>
                ) : (
                  driverHistory.map((record) => (
                    <div key={record.assignment_id} className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{record.driver_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.is_current ? "Current Driver" : "Previous Driver"}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.is_current ? "bg-success-muted border border-success-muted text-success" : "bg-muted/30 border border-border text-foreground"
                        }`}>
                          {record.driver_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div className="text-muted-foreground">From: {new Date(record.assigned_from).toLocaleDateString()}</div>
                        {record.assigned_to && (
                          <div className="text-muted-foreground">To: {new Date(record.assigned_to).toLocaleDateString()}</div>
                        )}
                        {record.phone_number && <div className="text-muted-foreground">{record.phone_number}</div>}
                        {record.license_number && <div className="text-muted-foreground">{record.license_number}</div>}
                        {record.change_reason && (
                          <div className="col-span-2 text-muted-foreground italic">
                            {record.change_reason}
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