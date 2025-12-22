import { useEffect, useState } from "react";

export function FuelAnalysis() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5002/api/analysis")
      .then(res => res.json())
      .then(setRows);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Fuel Analysis</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Date</th>
            <th>Fuel</th>
            <th>Distance</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Variance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.analysis_id}>
              <td>{r.vehicles.vehicle_number}</td>
              <td>{r.analysis_date}</td>
              <td>{r.fuel_given}</td>
              <td>{r.distance_covered}</td>
              <td>{r.expected_mileage}</td>
              <td>{r.actual_mileage}</td>
              <td>{r.fuel_variance}</td>
              <td>{r.theft_flag ? "⚠ Theft" : "OK"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
