/**
 * SLAReports – OWNER (REAL DATA)
 * Based on geofence-driven arrival_logs
 */

import { useEffect, useMemo, useState } from 'react';

export default function SLAReports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH REAL DATA
  ========================= */
  useEffect(() => {
    fetch('/api/arrival-logs')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setLogs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* =========================
     DERIVED METRICS
  ========================= */
  const summary = useMemo(() => {
    const total = logs.length;
    const onTime = logs.filter(l => l.status === 'ON_TIME').length;
    const late = logs.filter(l => l.status === 'LATE').length;
    const missed = logs.filter(l => l.status === 'MISSED').length;

    return {
      total,
      onTime,
      late,
      missed,
      sla: total ? ((onTime / total) * 100).toFixed(1) : '0.0',
    };
  }, [logs]);

  const companyWise = useMemo(() => {
    const map = {};

    logs.forEach(l => {
      const c = l.companies?.company_name || 'Unknown';
      if (!map[c]) {
        map[c] = { total: 0, onTime: 0, late: 0, missed: 0 };
      }
      map[c].total++;
      map[c][l.status === 'ON_TIME' ? 'onTime' : l.status === 'LATE' ? 'late' : 'missed']++;
    });

    return Object.entries(map).map(([company, v]) => ({
      company,
      ...v,
      sla: ((v.onTime / v.total) * 100).toFixed(1),
    }));
  }, [logs]);

  const vehicleWise = useMemo(() => {
    const map = {};

    logs.forEach(l => {
      const v = l.vehicles?.vehicle_number || 'Unknown';
      if (!map[v]) {
        map[v] = { total: 0, onTime: 0, late: 0, missed: 0 };
      }
      map[v].total++;
      map[v][l.status === 'ON_TIME' ? 'onTime' : l.status === 'LATE' ? 'late' : 'missed']++;
    });

    return Object.entries(map).map(([vehicle, v]) => ({
      vehicle,
      ...v,
      sla: ((v.onTime / v.total) * 100).toFixed(1),
    }));
  }, [logs]);

  const breaches = useMemo(
    () => logs.filter(l => l.status !== 'ON_TIME'),
    [logs]
  );

  /* =========================
     UI
  ========================= */
  if (loading) {
    return <div className="p-8">Loading SLA data…</div>;
  }

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">SLA & Geofencing Reports</h1>
      <p className="text-gray-600 mb-6">
        Owner-level SLA compliance based on automated geofence arrival tracking
      </p>

      {/* ================= KPI SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Kpi title="Total Trips" value={summary.total} />
        <Kpi title="On-Time" value={summary.onTime} color="emerald" />
        <Kpi title="Late" value={summary.late} color="amber" />
        <Kpi title="Missed" value={summary.missed} color="red" />
        <Kpi title="SLA %" value={`${summary.sla}%`} color="blue" />
      </div>

      {/* ================= COMPANY SLA ================= */}
      <Section title="Company-wise SLA (Client Contracts)">
        <Table
          headers={['Company', 'Trips', 'On-Time', 'Late', 'Missed', 'SLA %']}
          rows={companyWise.map(c => [
            c.company,
            c.total,
            c.onTime,
            c.late,
            c.missed,
            `${c.sla}%`,
          ])}
        />
      </Section>

      {/* ================= SLA BREACHES ================= */}
      <Section title="SLA Breaches (Owner Attention)">
        <Table
          headers={[
            'Vehicle',
            'Company',
            'Shift',
            'Status',
            'Delay (min)',
            'Supervisor Action',
          ]}
          rows={breaches.map(b => [
            b.vehicles?.vehicle_number,
            b.companies?.company_name,
            b.company_shifts?.shift_name,
            <StatusBadge status={b.status} />,
            b.delay_minutes ?? '—',
            b.action_taken || '—',
          ])}
        />
      </Section>

      {/* ================= VEHICLE SLA ================= */}
      <Section title="Vehicle-wise SLA Performance">
        <Table
          headers={['Vehicle', 'Trips', 'On-Time', 'Late', 'Missed', 'SLA %']}
          rows={vehicleWise.map(v => [
            v.vehicle,
            v.total,
            v.onTime,
            v.late,
            v.missed,
            `${v.sla}%`,
          ])}
        />
      </Section>
    </div>
  );
}

/* =========================
   SHARED COMPONENTS
========================= */
function Kpi({ title, value, color = 'gray' }) {
  const colors = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-800',
  };

  return (
    <div className="bg-white p-5 border rounded shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-8 bg-white p-6 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b">
        <tr>
          {headers.map(h => (
            <th key={h} className="text-left py-3 px-4 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            {r.map((c, j) => (
              <td key={j} className="py-3 px-4">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }) {
  const map = {
    ON_TIME: 'bg-emerald-100 text-emerald-700',
    LATE: 'bg-amber-100 text-amber-700',
    MISSED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}
