"use client";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimplePieChartProps {
  data: DataPoint[];
  title?: string;
  size?: number;
}

export default function SimplePieChart({ 
  data, 
  title, 
  size = 200 
}: SimplePieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = [
    "#4361ee", "#7c3aed", "#059669", "#d97706", 
    "#dc2626", "#0891b2", "#db2777", "#10b981"
  ];

  if (total === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-sm" style={{ color: "#94a3b8" }}>Tidak ada data</p>
      </div>
    );
  }

  let currentAngle = -90; // Start from top
  const paths = data.map((item, i) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const color = item.color || colors[i % colors.length];

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate path for pie slice
    const radius = size / 2 - 10;
    const centerX = size / 2;
    const centerY = size / 2;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return { pathData, color, label: item.label, value: item.value, percentage };
  });

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#1a1d2e" }}>
          {title}
        </h3>
      )}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths.map((path, i) => (
            <path
              key={i}
              d={path.pathData}
              fill={path.color}
              className="transition-opacity duration-200 hover:opacity-80"
              style={{ cursor: 'pointer' }}
            >
              <title>{`${path.label}: ${path.value} (${path.percentage.toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>
        
        <div className="flex-1 space-y-2">
          {data.map((item, i) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const color = item.color || colors[i % colors.length];
            
            return (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm shrink-0" 
                  style={{ background: color }}
                />
                <span className="text-xs flex-1" style={{ color: "#64748b" }}>
                  {item.label}
                </span>
                <span className="text-xs font-bold" style={{ color }}>
                  {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
