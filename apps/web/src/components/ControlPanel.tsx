"use client";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export interface DrawingOptions {
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillStyle: string;
  roughness: number;
  strokeLineDash: number[];
  fillOpacity: number;
}


interface ControlPanelProps {
  options: DrawingOptions;
  onChange: (opts: DrawingOptions) => void;
}

function hexToHex8(hex: string, alpha: number) {
  let c = (hex || '').replace('#', '');
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]].join('');
  if (typeof c !== 'string' || c.length !== 6) return hex; // fallback for invalid input
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `#${c}${alphaHex}`;
}
function setFillWithOpacity(fill: string, opacity: number) {
  if (fill.startsWith('rgba')) {
    return fill.replace(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/, (m, r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${opacity})`);
  }
  if (fill.startsWith('#')) {
    return hexToHex8(fill, opacity);
  }
  if (fill === 'rgba(0,0,0,0)' || fill === 'transparent') {
    return `rgba(0,0,0,${opacity})`;
  }
  // fallback for named colors
  return fill;
}
const fillOpacities = [0, 0.25, 0.5, 0.75, 1];

const strokeColors = [
  "#e5e5e5", "#ff8686", "#4ec16e", "#6cb6ff", "#c46a0a", "#f47c3c"
];
const backgroundColors = [
  "#23232a", "#6b3535", "#0e3d1c", "#0e2a3d", "#3d2a0e", "transparent"
];
const strokeWidths = [1, 2, 3, 4, 5];
const roughness = [0, 1, 2, 3, 4];

const strokeDashOptions = [
  { label: 'Solid', value: [], icon: (
    <div className="w-8 h-1 bg-[#f5f5f5] rounded-full" />
  ) },
  { label: 'Dashed', value: [8, 4], icon: (
    <svg width="32" height="8"><line x1="2" y1="4" x2="30" y2="4" stroke="#f5f5f5" strokeWidth="2" strokeDasharray="8,4" /></svg>
  ) },
  { label: 'Dotted', value: [1, 3], icon: (
    <svg width="32" height="8"><line x1="2" y1="4" x2="30" y2="4" stroke="#f5f5f5" strokeWidth="2" strokeDasharray="1,3" /></svg>
  ) },
  { label: 'Dash-dot', value: [8, 3, 1, 3], icon: (
    <svg width="32" height="8"><line x1="2" y1="4" x2="30" y2="4" stroke="#f5f5f5" strokeWidth="2" strokeDasharray="8,3,1,3" /></svg>
  ) },
  { label: 'Long dash', value: [14, 6], icon: (
    <svg width="32" height="8"><line x1="2" y1="4" x2="30" y2="4" stroke="#f5f5f5" strokeWidth="2" strokeDasharray="14,6" /></svg>
  ) },
];

export default function ControlPanel({ options, onChange }: ControlPanelProps) {
  const opts = { ...options };
  return (
    <Card className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-4 bg-background/90 backdrop-blur-sm border min-w-[260px] min-h-[400px] flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Stroke</div>
          <div className="flex gap-2">
            {strokeColors.map((color: string) => (
              <Button key={color} className="w-7 h-7 p-0 rounded" style={{ background: color, border: opts.stroke === color ? '2px solid #7c7bb7' : undefined }} variant={opts.stroke === color ? "default" : "outline"} onClick={() => onChange({ ...opts, stroke: color })} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Background</div>
          <div className="flex gap-2">
            {backgroundColors.map((color: string) => (
              <Button key={color} className="w-7 h-7 p-0 rounded" style={{ background: color === 'transparent' ? 'repeating-linear-gradient(45deg, #23232a 0 4px, #333 4px 8px)' : color, border: opts.fill === color ? '2px solid #7c7bb7' : undefined }} variant={opts.fill === color ? "default" : "outline"} onClick={() => onChange({ ...opts, fill: setFillWithOpacity(color === 'transparent' ? 'rgba(0,0,0,0)' : color, opts.fillOpacity) })} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Stroke width</div>
          <div className="flex gap-2">
            {strokeWidths.map((w: number) => (
              <Button key={w} className="w-12 h-10 flex items-center justify-center" variant={opts.strokeWidth === w ? "default" : "outline"} onClick={() => onChange({ ...opts, strokeWidth: w })}>
                <div className={`w-8 rounded-full`} style={{ height: w, background: '#f5f5f5' }} />
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Roughness</div>
          <div className="flex gap-2">
            {roughness.map((r: number) => (
              <Button key={r} className="w-12 h-10 flex items-center justify-center" variant={opts.roughness === r ? "default" : "outline"} onClick={() => onChange({ ...opts, roughness: r })}>
                <div className="flex items-center justify-center w-8 h-6">
                  <svg width="32" height="12">
                    {r === 0 ? (
                      <line x1="2" y1="6" x2="30" y2="6" stroke="#f5f5f5" strokeWidth="2" />
                    ) : r === 1 ? (
                      <path d="M2 8 Q8 4 16 8 Q24 12 30 8" stroke="#f5f5f5" strokeWidth="2" fill="none" />
                    ) : r === 2 ? (
                      <path d="M2 10 Q8 2 16 10 Q24 18 30 10" stroke="#f5f5f5" strokeWidth="2" fill="none" />
                    ) : r === 3 ? (
                      <path d="M2 11 Q8 1 16 11 Q24 21 30 11" stroke="#f5f5f5" strokeWidth="2" fill="none" />
                    ) : (
                      <path d="M2 12 Q8 0 16 12 Q24 24 30 12" stroke="#f5f5f5" strokeWidth="2" fill="none" />
                    )}
                  </svg>
                </div>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Stroke Dash</div>
          <div className="flex gap-2">
            {strokeDashOptions.map((opt: any, idx: number) => (
              <Button
                key={opt.label}
                className="w-12 h-10 flex items-center justify-center"
                variant={JSON.stringify(opts.strokeLineDash) === JSON.stringify(opt.value) ? "default" : "outline"}
                onClick={() => onChange({ ...opts, strokeLineDash: opt.value })}
              >
                {opt.icon}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Fill Opacity</div>
          <div className="flex gap-2">
            {fillOpacities.map((opacity) => (
              <Button
                key={opacity}
                className="w-12 h-10 flex items-center justify-center"
                variant={(() => {
                  const fill = opts.fill ?? '';
                  if (fill.startsWith('rgba')) {
                    const match = fill.match(/rgba\(\d+, \d+, \d+, ([\d.]+)\)/);
                    return match && Number(match[1]) === opacity ? "default" : "outline";
                  }
                  if (fill.startsWith('#') && fill.length === 9) {
                    // #RRGGBBAA
                    const aa = fill.slice(-2);
                    const aaDec = parseInt(aa, 16) / 255;
                    return Math.abs(aaDec - opacity) < 0.01 ? "default" : "outline";
                  }
                  return opacity === 1 && (!fill || fill === 'transparent' || fill === 'rgba(0,0,0,0)') ? "default" : "outline";
                })()}
                onClick={() => onChange({ ...opts, fill: setFillWithOpacity(opts.fill ?? 'rgba(0,0,0,0)', opacity), fillOpacity: opacity })}
              >
                {Math.round(opacity * 100)}%
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 