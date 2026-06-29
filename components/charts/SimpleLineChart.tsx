"use client";

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export default function SimpleLineChart({ 
  data, 
  title, 
  height = 200,
  color = "#4361ee",
  showDots = true
}: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-sm" style={{ color: "#94a3b8" }}>Tidak ada data</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const width = 100; // percentage
  const padding = 10;
  const chartHeight = height - 60;
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  const points = data.map((point, i) => {
    const x = padding + (i * stepX);
    const y = chartHeight - ((point.value - minValue) / range) * (chartHeight - padding * 2);
    return { x, y, ...point };
  });

  // Create path for line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create path for area under line
  const areaPath = [
    linePath,
    `L ${points[points.length - 1].x} ${chartHeight}`,
    `L ${points[0].x} ${chartHeight}`,
    'Z'
  ].join(' ');

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#1a1d2e" }}>
          {title}
        </h3>
      )}
      
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = (pct / 100) * chartHeight;
          return (
            <line
              key={pct}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Area under line */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots && points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
            <title>{`${p.label}: ${p.value}`}</title>
          </g>
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((point, i) => (
          <span 
            key={i}
            className="text-xs font-medium" 
            style={{ color: "#64748b" }}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
