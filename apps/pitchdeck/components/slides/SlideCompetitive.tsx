import { SlideLayout } from "../SlideLayout";
import { COMPETITIVE_DATA } from "@/lib/slideData";

function Check() {
  return <span className="text-lg text-green">&#10003;</span>;
}

function Cross() {
  return <span className="text-lg text-red">&#10007;</span>;
}

const COLUMNS = [
  { key: "priceExposure" as const, label: "Price Exposure" },
  { key: "globalAccess" as const, label: "Global Access" },
  { key: "blockchain" as const, label: "Blockchain" },
  { key: "noStorage" as const, label: "No Storage" },
];

export function SlideCompetitive() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">
        Competitive Landscape
      </h2>
      <p className="mb-10 text-lg text-text-muted">
        Positioned as &ldquo;PAXG for Ammunition&rdquo; -- tokenized commodity
        exposure
      </p>

      <div className="flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-elevated">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                Platform
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                Type
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-center text-sm font-semibold text-text-muted"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPETITIVE_DATA.map((entry) => {
              const isUs = entry.name === "Ammo Exchange";
              return (
                <tr
                  key={entry.name}
                  className={`border-b border-surface-elevated ${isUs ? "bg-surface" : ""}`}
                >
                  <td
                    className={`px-4 py-4 text-base font-semibold ${isUs ? "text-brass" : "text-text"}`}
                  >
                    {entry.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">
                    {entry.type}
                  </td>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-4 text-center">
                      {entry[col.key] ? <Check /> : <Cross />}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-center text-lg font-semibold text-brass">
        The only platform offering global ammo price exposure without touching a
        single bullet.
      </p>
    </SlideLayout>
  );
}
