import { useEffect, useState } from "react";
import api from "../services/api.js";

export function FuelAnalysis() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getFuelAnalysis();
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fuel analysis load error:", error);
        setRows([]);
      }
    };
    load();
  }, []);

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Fuel Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Expected vs actual mileage and variance
        </p>
      </div>

      {/* ================= MOBILE: STACKED CARDS ================= */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => {
          const varianceNumber = Number(r.fuel_variance);
          const varianceIsNegative = Number.isFinite(varianceNumber) && varianceNumber < 0;

          return (
            <div key={r.analysis_id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {r?.vehicles?.vehicle_number || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{r.analysis_date || '—'}</p>
                </div>

                <div className="shrink-0">
                  {r.theft_flag ? (
                    <span className="inline-flex items-center rounded-md border border-destructive-muted bg-destructive-muted px-2 py-1 text-xs font-semibold text-destructive">
                      Theft
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md border border-success-muted bg-success-muted px-2 py-1 text-xs font-semibold text-success">
                      OK
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Fuel</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{r.fuel_given ?? '—'}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Distance</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{r.distance_covered ?? '—'}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Expected</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{r.expected_mileage ?? '—'}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Actual</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{r.actual_mileage ?? '—'}</p>
                </div>

                <div className="col-span-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Variance</p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      varianceIsNegative ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {r.fuel_variance ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No fuel analysis records found.
          </div>
        )}
      </div>

      {/* ================= DESKTOP: TABLE ================= */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vehicle</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fuel</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Distance</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actual</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variance</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const varianceNumber = Number(r.fuel_variance);
              const varianceIsNegative = Number.isFinite(varianceNumber) && varianceNumber < 0;

              return (
                <tr key={r.analysis_id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-4 text-foreground whitespace-nowrap">{r?.vehicles?.vehicle_number || '—'}</td>
                  <td className="py-3 px-4 text-foreground whitespace-nowrap">{r.analysis_date || '—'}</td>
                  <td className="py-3 px-4 text-foreground tabular-nums whitespace-nowrap">{r.fuel_given ?? '—'}</td>
                  <td className="py-3 px-4 text-foreground tabular-nums whitespace-nowrap">{r.distance_covered ?? '—'}</td>
                  <td className="py-3 px-4 text-foreground tabular-nums whitespace-nowrap">{r.expected_mileage ?? '—'}</td>
                  <td className="py-3 px-4 text-foreground tabular-nums whitespace-nowrap">{r.actual_mileage ?? '—'}</td>
                  <td className={`py-3 px-4 tabular-nums whitespace-nowrap ${varianceIsNegative ? 'text-destructive' : 'text-foreground'}`}>{r.fuel_variance ?? '—'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {r.theft_flag ? (
                      <span className="inline-flex items-center rounded-md border border-destructive-muted bg-destructive-muted px-2 py-1 text-xs font-semibold text-destructive">
                        Theft
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-success-muted bg-success-muted px-2 py-1 text-xs font-semibold text-success">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 px-4 text-sm text-muted-foreground">
                  No fuel analysis records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
