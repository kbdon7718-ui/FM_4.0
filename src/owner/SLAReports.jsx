/**
 * SLAReports – OWNER (REAL DATA)
 * Based on geofence-driven arrival_logs
 */

import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

export default function SLAReports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH REAL DATA
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getArrivalLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Arrival logs fetch error:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
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
    return <div className="py-10 text-sm text-muted-foreground">Loading SLA data…</div>;
  }

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          SLA & Geofencing Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Owner-level SLA compliance based on automated geofence arrival tracking
        </p>
      </div>

      {/* ================= KPI SUMMARY ================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 sm:gap-4">
        <Kpi title="Total Trips" value={summary.total} />
        <Kpi title="On-Time" value={summary.onTime} color="success" />
        <Kpi title="Late" value={summary.late} color="warning" />
        <Kpi title="Missed" value={summary.missed} color="destructive" />
        <Kpi title="SLA %" value={`${summary.sla}%`} color="primary" />
      </div>

      {/* ================= COMPANY SLA ================= */}
      <Section title="Company-wise SLA (Client Contracts)">
        <div className="space-y-3 md:hidden">
          {companyWise.map((c) => (
            <div key={c.company} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.company}</p>
                  <p className="text-xs text-muted-foreground">
                    Trips:{' '}
                    <span className="font-medium text-foreground tabular-nums">{c.total}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">SLA</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{c.sla}%</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <MobileStat label="On-Time" value={c.onTime} tone="success" />
                <MobileStat label="Late" value={c.late} tone="warning" />
                <MobileStat label="Missed" value={c.missed} tone="destructive" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
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
        </div>
      </Section>

      {/* ================= SLA BREACHES ================= */}
      <Section title="SLA Breaches (Owner Attention)">
        <div className="space-y-3 md:hidden">
          {breaches.map((b, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {b.vehicles?.vehicle_number || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {b.companies?.company_name || '—'}
                  </p>
                </div>

                <div className="shrink-0">
                  <StatusBadge status={b.status} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <MobileKV label="Shift" value={b.company_shifts?.shift_name || '—'} />
                  <MobileKV label="Delay (min)" value={b.delay_minutes ?? '—'} tone={b.status === 'MISSED' ? 'destructive' : 'warning'} />
                </div>
                <MobileKV label="Supervisor Action" value={b.action_taken || '—'} />
              </div>
            </div>
          ))}

          {breaches.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No breaches.
            </div>
          )}
        </div>

        <div className="hidden md:block">
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
        </div>
      </Section>

      {/* ================= VEHICLE SLA ================= */}
      <Section title="Vehicle-wise SLA Performance">
        <div className="space-y-3 md:hidden">
          {vehicleWise.map((v) => (
            <div key={v.vehicle} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{v.vehicle}</p>
                  <p className="text-xs text-muted-foreground">
                    Trips:{' '}
                    <span className="font-medium text-foreground tabular-nums">{v.total}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">SLA</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{v.sla}%</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <MobileStat label="On-Time" value={v.onTime} tone="success" />
                <MobileStat label="Late" value={v.late} tone="warning" />
                <MobileStat label="Missed" value={v.missed} tone="destructive" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
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
        </div>
      </Section>
    </div>
  );
}

/* =========================
   SHARED COMPONENTS
========================= */
function Kpi({ title, value, color = 'gray' }) {
  const colors = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    primary: 'text-primary',
    emerald: 'text-success',
    amber: 'text-warning',
    red: 'text-destructive',
    blue: 'text-primary',
    gray: 'text-foreground',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-semibold tracking-tight tabular-nums ${colors[color] || colors.gray}`}>{value}</p>
    </div>
  );
}

function MobileKV({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${tones[tone] || tones.default}`}>{value}</p>
    </div>
  );
}

function MobileStat({ label, value, tone = 'default' }) {
  return <MobileKV label={label} value={value} tone={tone} />;
}

function Section({ title, children }) {
  return (
    <div className="mt-6 sm:mt-8 bg-card p-4 sm:p-6 border border-border rounded-xl">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
      <thead className="border-b border-border bg-muted/30">
        <tr>
          {headers.map(h => (
            <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border hover:bg-muted/30">
            {r.map((c, j) => (
              <td key={j} className="py-3 px-4 text-foreground whitespace-nowrap">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ON_TIME: 'bg-success-muted border border-success-muted text-success',
    LATE: 'bg-warning-muted border border-warning-muted text-warning',
    MISSED: 'bg-destructive-muted border border-destructive-muted text-destructive',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${map[status] || 'bg-muted border border-border text-foreground'}`}>
      {status}
    </span>
  );
}
