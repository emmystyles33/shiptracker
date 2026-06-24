function project(lat, lng) {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

function quadraticPoint(t, p0, p1, p2) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function getIconGroup(shipmentType) {
  if (shipmentType === 'Air Freight') {
    return (
      <g>
        <path
          d="M -14 4 L -8 4 L -2 -6 L 6 -2 L 14 -10 L 12 -12 L 4 -4 L -2 -12 L -10 -12 L -6 -4 Z"
          fill="#ffffff"
          stroke="#0a0e14"
          strokeWidth="0.5"
        />
        <path d="M -8 4 L -2 4" fill="none" stroke="#0a0e14" strokeWidth="0.5" />
      </g>
    );
  }

  if (shipmentType === 'Ocean Freight') {
    return (
      <g>
        <rect x="-14" y="-5" width="30" height="10" rx="2" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
        <rect x="-8" y="-13" width="12" height="8" rx="1" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
        <rect x="6" y="-18" width="4" height="8" rx="1" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
        <circle cx="-6" cy="9" r="3" fill="#0a0e14" />
        <circle cx="10" cy="9" r="3" fill="#0a0e14" />
      </g>
    );
  }

  if (shipmentType === 'Rail Freight') {
    return (
      <g>
        <rect x="-14" y="-6" width="24" height="10" rx="2" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
        <path d="M 10 -6 L 16 -2 L 16 4 L 10 4 Z" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
        <circle cx="-4" cy="9" r="3" fill="#0a0e14" />
        <circle cx="10" cy="9" r="3" fill="#0a0e14" />
      </g>
    );
  }

  return (
    <g>
      <rect x="-14" y="-6" width="16" height="10" rx="2" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
      <rect x="2" y="-8" width="16" height="12" rx="2" fill="#ffffff" stroke="#0a0e14" strokeWidth="0.5" />
      <circle cx="-6" cy="9" r="3" fill="#0a0e14" />
      <circle cx="10" cy="9" r="3" fill="#0a0e14" />
    </g>
  );
}

export default function WorldMap({ origin, destination, progressFraction, shipmentType, originLabel, destinationLabel }) {
  const hasCoords =
    origin?.lat != null && origin?.lng != null && destination?.lat != null && destination?.lng != null;

  if (!hasCoords) {
    return (
      <div style={{ color: 'var(--ink-600)', textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        Route map unavailable — origin/destination location could not be resolved.
      </div>
    );
  }

  const o = project(origin.lat, origin.lng);
  const d = project(destination.lat, destination.lng);
  const midX = (o.x + d.x) / 2;
  const midY = (o.y + d.y) / 2;
  const bow = Math.min(Math.abs(d.x - o.x) * 0.25, 80);
  const control = { x: midX, y: midY - bow };
  const pathD = `M ${o.x} ${o.y} Q ${control.x} ${control.y} ${d.x} ${d.y}`;

  const t = Math.min(Math.max(progressFraction, 0), 1);
  const marker = quadraticPoint(t, o, control, d);
  const prevPoint = quadraticPoint(Math.max(t - 0.02, 0), o, control, d);
  const angle = Math.atan2(marker.y - prevPoint.y, marker.x - prevPoint.x) * (180 / Math.PI);

  const travelPoints = [];
  const travelSteps = 24;
  for (let i = 0; i <= travelSteps; i += 1) {
    const currentT = t * (i / travelSteps);
    travelPoints.push(quadraticPoint(currentT, o, control, d));
  }
  const travelPathD = t > 0 ? travelPoints.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)).join(' ') : '';

  return (
    <div style={{ background: '#0f1a2e', padding: '14px', borderRadius: '24px' }}>
      <svg viewBox="0 0 1000 500" className="world-map-svg" role="img" aria-label="Shipment route map">
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d2b45" />
            <stop offset="50%" stopColor="#1a3a5c" />
            <stop offset="100%" stopColor="#0a1f35" />
          </linearGradient>

          <radialGradient id="landGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3a7a30" />
            <stop offset="100%" stopColor="#1f4a1a" />
          </radialGradient>

          <filter id="landShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" floodOpacity="0.6" />
          </filter>

          <linearGradient id="oceanDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1828" stopOpacity="0.5" />
            <stop offset="30%" stopColor="transparent" />
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="#0a1828" stopOpacity="0.4" />
          </linearGradient>

          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(5,15,30,0.6)" />
          </radialGradient>
        </defs>

        {/* 1. Ocean gradient background */}
        <rect width="1000" height="500" fill="url(#oceanGrad)" />

        {/* 2. Ocean depth bands */}
        <rect x="0" y="0" width="1000" height="500" fill="url(#oceanDepth)" opacity="0.28" />

        {/* 3-5. Graticule grid lines and tropics/equator */}
        <g stroke="rgba(100,160,220,0.18)" strokeWidth="0.6" strokeDasharray="3 6" fill="none">
          <path d="M0 83 H1000" />
          <path d="M0 166 H1000" />
          <path d="M0 250 H1000" />
          <path d="M0 333 H1000" />
          <path d="M0 417 H1000" />
          <path d="M0 0 V500" />
          <path d="M83 0 V500" />
          <path d="M167 0 V500" />
          <path d="M250 0 V500" />
          <path d="M333 0 V500" />
          <path d="M417 0 V500" />
          <path d="M500 0 V500" />
          <path d="M583 0 V500" />
          <path d="M667 0 V500" />
          <path d="M750 0 V500" />
          <path d="M833 0 V500" />
          <path d="M917 0 V500" />
        </g>

        {/* Equator - special */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(100,200,255,0.35)" strokeWidth="1.2" />

        {/* Tropics */}
        <line x1="0" y1="184" x2="1000" y2="184" stroke="rgba(255,200,100,0.15)" strokeWidth="0.6" strokeDasharray="8 4" />
        <line x1="0" y1="315" x2="1000" y2="315" stroke="rgba(255,200,100,0.15)" strokeWidth="0.6" strokeDasharray="8 4" />

        {/* 6. Antarctica (underlay) */}
        <path d="M 50,475 L 200,468 L 350,472 L 500,465 L 650,470 L 800,466 L 950,472 L 1000,478 L 1000,500 L 0,500 Z" fill="#d4e8f0" stroke="#b8d4e8" strokeWidth="0.5" />

        {/* 7. Continents - detailed shapes */}
        <g fill="url(#landGrad)" filter="url(#landShadow)" stroke="#4a9a3a" strokeWidth="0.8" strokeLinejoin="round">
          {/* NORTH AMERICA */}
          <path d="M 95,72 L 108,65 L 125,62 L 142,60 L 158,58 L 172,60 L 185,58 L 198,56 L 210,60 L 218,58 L 228,62 L 232,70 L 238,75 L 242,85 L 238,95 L 230,105 L 225,118 L 228,128 L 222,135 L 215,142 L 205,148 L 195,152 L 188,160 L 180,165 L 172,170 L 162,172 L 152,168 L 145,162 L 138,155 L 130,148 L 122,140 L 115,132 L 108,122 L 102,112 L 97,102 L 92,92 L 90,82 Z" />

          {/* GREENLAND */}
          <path d="M 215,45 L 228,40 L 240,42 L 248,50 L 245,60 L 235,65 L 222,63 L 212,56 Z" />

          {/* CENTRAL AMERICA + CARIBBEAN */}
          <path d="M 175,170 L 182,178 L 185,188 L 180,192 L 174,188 L 170,180 Z" />

          {/* SOUTH AMERICA */}
          <path d="M 188,195 L 200,190 L 215,192 L 228,198 L 238,208 L 244,222 L 248,238 L 250,255 L 248,272 L 242,288 L 235,305 L 225,320 L 215,335 L 205,348 L 195,358 L 188,365 L 182,358 L 178,345 L 175,330 L 172,315 L 170,298 L 168,280 L 166,262 L 165,245 L 166,228 L 168,212 L 172,200 L 180,194 Z" />

          {/* EUROPE */}
          <path d="M 455,72 L 462,68 L 470,65 L 478,68 L 485,72 L 490,78 L 488,85 L 482,90 L 492,92 L 498,88 L 505,85 L 512,88 L 515,95 L 510,102 L 502,108 L 495,112 L 488,115 L 480,118 L 472,120 L 465,116 L 458,110 L 452,103 L 448,95 L 450,85 L 455,78 Z" />
          <path d="M 468,120 L 475,118 L 482,122 L 478,130 L 470,128 Z" />
          <path d="M 488,115 L 498,118 L 505,125 L 500,132 L 490,128 Z" />

          {/* UNITED KINGDOM */}
          <path d="M 445,75 L 450,70 L 455,72 L 452,80 L 448,85 L 444,82 L 442,76 Z" />

          {/* ICELAND */}
          <path d="M 420,55 L 428,52 L 435,55 L 432,62 L 424,64 L 418,60 Z" />

          {/* AFRICA */}
          <path d="M 460,135 L 472,128 L 485,125 L 498,128 L 510,132 L 520,138 L 528,148 L 532,160 L 535,175 L 535,192 L 532,208 L 528,225 L 522,242 L 515,258 L 505,275 L 495,290 L 485,308 L 475,322 L 465,335 L 455,342 L 448,335 L 442,322 L 438,308 L 435,292 L 434,275 L 435,258 L 437,240 L 438,222 L 437,205 L 435,188 L 435,172 L 437,158 L 442,146 L 450,138 Z" />
          <path d="M 510,132 L 522,130 L 530,135 L 528,148 Z" />

          {/* MADAGASCAR */}
          <path d="M 548,268 L 554,262 L 560,265 L 562,275 L 558,285 L 550,288 L 545,282 L 545,272 Z" />

          {/* RUSSIA + NORTHERN ASIA */}
          <path d="M 505,60 L 525,52 L 550,48 L 580,45 L 615,44 L 648,46 L 678,50 L 705,55 L 728,58 L 748,55 L 762,52 L 775,55 L 782,62 L 778,72 L 768,78 L 755,82 L 742,85 L 728,88 L 715,92 L 700,95 L 688,98 L 675,100 L 662,102 L 648,100 L 635,98 L 622,98 L 610,100 L 598,102 L 585,105 L 572,108 L 558,110 L 545,108 L 532,105 L 518,102 L 508,96 L 502,88 L 502,78 Z" />

          {/* MIDDLE EAST / ARABIAN PENINSULA */}
          <path d="M 535,155 L 548,148 L 562,148 L 572,152 L 578,162 L 580,175 L 575,185 L 565,192 L 552,195 L 540,190 L 532,180 L 530,168 Z" />

          {/* INDIA */}
          <path d="M 618,118 L 632,115 L 645,118 L 655,125 L 660,138 L 658,152 L 652,165 L 642,175 L 630,180 L 620,175 L 612,162 L 608,148 L 610,135 Z" />

          {/* SOUTHEAST ASIA */}
          <path d="M 688,120 L 702,115 L 715,118 L 722,128 L 718,140 L 708,148 L 695,150 L 685,142 L 682,130 Z" />
          <path d="M 715,148 L 725,145 L 730,155 L 722,162 L 712,158 Z" />

          {/* CHINA + EAST ASIA */}
          <path d="M 648,100 L 662,102 L 678,100 L 695,98 L 710,100 L 725,105 L 735,112 L 738,122 L 732,132 L 720,138 L 705,140 L 690,138 L 675,135 L 660,132 L 648,128 L 640,118 L 638,108 Z" />

          {/* JAPAN */}
          <path d="M 758,92 L 764,88 L 770,90 L 772,98 L 766,104 L 760,102 Z" />
          <path d="M 762,106 L 768,103 L 773,108 L 768,115 L 762,112 Z" />

          {/* INDONESIA / MARITIME SE ASIA */}
          <path d="M 720,178 L 730,175 L 738,180 L 735,188 L 726,190 Z" />
          <path d="M 740,182 L 750,179 L 758,185 L 754,193 L 744,192 Z" />
          <path d="M 758,188 L 768,185 L 775,192 L 770,200 L 760,198 Z" />

          {/* AUSTRALIA */}
          <path d="M 762,298 L 780,290 L 800,285 L 820,285 L 838,290 L 852,298 L 860,310 L 862,325 L 858,340 L 848,352 L 832,360 L 815,362 L 798,358 L 782,348 L 770,335 L 762,320 L 758,305 Z" />

          {/* NEW ZEALAND */}
          <path d="M 878,342 L 884,338 L 890,342 L 888,352 L 882,355 L 876,350 Z" />
          <path d="M 882,356 L 888,353 L 893,358 L 890,368 L 883,368 Z" />
        </g>

        {/* 8. Ocean labels */}
        <g fontFamily="serif" fontStyle="italic" fontSize="9" fill="rgba(150,200,255,0.35)">
          <text x="120" y="280">PACIFIC OCEAN</text>
          <text x="395" y="260">ATLANTIC OCEAN</text>
          <text x="640" y="320">INDIAN OCEAN</text>
          <text x="500" y="30">ARCTIC OCEAN</text>
          <text x="500" y="460">SOUTHERN OCEAN</text>
        </g>

        {/* 9. Country name labels */}
        <g fill="rgba(255,255,255,0.65)" fontFamily="'IBM Plex Mono', monospace" fontSize="8.5" fontWeight="500" textAnchor="middle" letterSpacing="0.08em">
          <text x={project(58, -98).x} y={project(58, -98).y}>CANADA</text>
          <text x={project(39, -98).x} y={project(39, -98).y}>U.S.A</text>
          <text x={project(-10, -52).x} y={project(-10, -52).y}>BRAZIL</text>
          <text x={project(72, -42).x} y={project(72, -42).y}>GREENLAND</text>
          <text x={project(65, -18).x} y={project(65, -18).y}>ICELAND</text>
          <text x={project(54, -2).x} y={project(54, -2).y}>UNITED\nKINGDOM</text>
          <text x={project(47, 2).x} y={project(47, 2).y}>FRANCE</text>
          <text x={project(51, 10).x} y={project(51, 10).y}>GERMANY</text>
          <text x={project(62, 94).x} y={project(62, 94).y}>RUSSIA</text>
          <text x={project(9, 8).x} y={project(9, 8).y}>NIGERIA</text>
          <text x={project(-30, 25).x} y={project(-30, 25).y}>S. AFRICA</text>
          <text x={project(23, 45).x} y={project(23, 45).y}>ARABIA</text>
          <text x={project(22, 80).x} y={project(22, 80).y}>INDIA</text>
          <text x={project(36, 104).x} y={project(36, 104).y}>CHINA</text>
          <text x={project(-25, 133).x} y={project(-25, 133).y}>AUSTRALIA</text>
        </g>

        {/* 10. Equator/Tropic text labels */}
        <g fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">
          <text x="15" y="247">EQUATOR</text>
          <text x="15" y="181">TROPIC OF CANCER</text>
          <text x="15" y="312">TROPIC OF CAPRICORN</text>
        </g>

        {/* 11-13. Route glow, dashed route, and traveled portion (polyline) */}
        <path d={pathD} fill="none" stroke="#e8a23a" strokeWidth="4" opacity="0.18" strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="#e8a23a" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.95" strokeLinecap="round" />
        {t > 0 && (
          <polyline
            points={travelPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#ffd700"
            strokeWidth="2.5"
            opacity="0.95"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 14. Origin marker (pulse + inner) */}
        <g className="origin-marker">
          <circle cx={o.x} cy={o.y} r="14" fill="none" stroke="#3ba89b" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={o.x} cy={o.y} r="6" fill="#3ba89b" stroke="#fff" strokeWidth="1.5" />
        </g>

        {/* 15. Destination marker */}
        <g className="destination-marker">
          <circle cx={d.x} cy={d.y} r="14" fill="none" stroke="#5fb88f" strokeWidth="1" opacity="0.5" />
          <circle cx={d.x} cy={d.y} r="8" fill="none" stroke="#5fb88f" strokeWidth="1.5" opacity="0.7" />
          <circle cx={d.x} cy={d.y} r="4" fill="#5fb88f" stroke="#fff" strokeWidth="1.5" />
        </g>

        {/* 16. City label pills */}
        <g className="labels">
          <g transform={`translate(${o.x - 30}, ${o.y - 28})`}>
            <rect width="60" height="16" rx="4" fill="rgba(5,15,30,0.85)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <text x="30" y="11" textAnchor="middle" fontSize="8.5" fill="#ffffff" fontFamily="'IBM Plex Mono', monospace" fontWeight="600" letterSpacing="0.05em">{originLabel || 'Origin'}</text>
          </g>

          <g transform={`translate(${d.x - 30}, ${d.y - 28})`}>
            <rect width="60" height="16" rx="4" fill="rgba(5,15,30,0.85)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <text x="30" y="11" textAnchor="middle" fontSize="8.5" fill="#ffffff" fontFamily="'IBM Plex Mono', monospace" fontWeight="600" letterSpacing="0.05em">{destinationLabel || 'Destination'}</text>
          </g>
        </g>

        {/* 17. Moving transport icon (preserve rotation logic) */}
        <g transform={`translate(${marker.x}, ${marker.y})`}>
          <circle r="14" fill="#e8a23a" opacity="0.25" />
          <g transform={shipmentType === 'Air Freight' ? `rotate(${angle})` : undefined}>
            {getIconGroup(shipmentType)}
          </g>
        </g>

        {/* 18. Vignette overlay (top) */}
        <rect width="1000" height="500" fill="url(#vignette)" style={{ pointerEvents: 'none' }} />

        {/* 19. Bottom info bar */}
        <rect x="0" y="480" width="1000" height="20" fill="rgba(5,15,30,0.7)" />
        <text x="12" y="493" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="monospace">SWIFTCARGO EXPRESS — LIVE ROUTE TRACKER</text>
        <text x="988" y="493" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="monospace" textAnchor="end">EQUIRECTANGULAR PROJECTION</text>

        {/* 20. Frame border */}
        <rect x="1" y="1" width="998" height="498" fill="none" stroke="rgba(100,160,220,0.25)" strokeWidth="1.5" rx="0" />
      </svg>
    </div>
  );
}
