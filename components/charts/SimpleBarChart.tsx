"use client";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

export default function SimpleBarChart({ 
  data, 
  title, 
  height = 200,
  showValues = true 
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const colors = [
    "#4361ee", "#7c3aed", "#059669", "#d97706", 
    "#dc2626", "#0891b2", "#db2777", "#10b981"
  ];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#1a1d2e" }}>
          {title}
        </h3>
      )}
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, i) => {
          const heightPct = (item.value / maxValue) * 100;
          const color = item.color || colors[i % colors.length];
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end" style={{ height: height - 40 }}>
                {showValues && item.value > 0 && (
                  <span 
                    className="text-xs font-bold text-center mb-1" 
                    style={{ color }}
                  >
                    {item.value}
                  </span>
                )}
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${heightPct}%`,
                    background: color,
                    minHeight: item.value > 0 ? '4px' : '0'
                  }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <span 
                className="text-xs font-medium text-center px-1" 
                style={{ color: "#64748b" }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
