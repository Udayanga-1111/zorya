export interface ConstellationStar {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string; // "#ffffff", "#a5f3fc", "#fef08a", "#bae6fd", "#fde047"
  brightness: number;
  name?: string;
}

export interface ConstellationData {
  name: string;
  symbol: string;
  description: string;
  stars: ConstellationStar[];
  lines: [number, number][]; // pairs of star indices
}

// Color palettes for photorealistic stars: white, blue-white, pale gold
const STAR_COLORS = {
  white: "#ffffff",
  blueWhite: "#a5f3fc",
  paleGold: "#fef08a",
  brightBlue: "#7dd3fc",
  warmGold: "#fde047",
};

/**
 * Helper to generate a cluster of hundreds of surrounding ambient stars for each constellation
 */
export function generateConstellationCluster(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const palette = [
    new THREE_Color("#ffffff"),
    new THREE_Color("#a5f3fc"),
    new THREE_Color("#fef08a"),
    new THREE_Color("#bae6fd"),
    new THREE_Color("#e0e7ff"),
  ];

  for (let i = 0; i < count; i++) {
    // Distribute in a spherical cloud around the constellation center
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * radius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    sizes[i] = Math.random() * 0.08 + 0.02;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return { positions, sizes, colors };
}

import * as THREE from "three";
const THREE_Color = THREE.Color;

export const CONSTELLATIONS: ConstellationData[] = [
  // 1. ARIES (The Ram) - Hamal, Sheratan, Mesarthim
  {
    name: "Aries",
    symbol: "♈",
    description: "The Ram · April 21 - May 20",
    stars: [
      { x: -1.2, y: 0.8, z: 0.1, size: 0.22, color: STAR_COLORS.paleGold, brightness: 1.0, name: "Hamal" },
      { x: -0.4, y: 0.3, z: -0.1, size: 0.18, color: STAR_COLORS.blueWhite, brightness: 0.9, name: "Sheratan" },
      { x: 0.2, y: 0.0, z: 0.0, size: 0.15, color: STAR_COLORS.white, brightness: 0.8, name: "Mesarthim" },
      { x: 1.1, y: -0.5, z: 0.2, size: 0.12, color: STAR_COLORS.brightBlue, brightness: 0.7 },
      { x: 1.5, y: -0.8, z: -0.1, size: 0.10, color: STAR_COLORS.white, brightness: 0.6 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  },

  // 2. TAURUS (The Bull) - Aldebaran, Elnath, Hyades, Pleiades
  {
    name: "Taurus",
    symbol: "♉",
    description: "The Bull · May 21 - June 20",
    stars: [
      { x: -1.5, y: -0.4, z: 0.2, size: 0.26, color: STAR_COLORS.warmGold, brightness: 1.0, name: "Aldebaran" }, // Red giant
      { x: -0.8, y: -0.1, z: 0.0, size: 0.16, color: STAR_COLORS.white, brightness: 0.8, name: "Ain" },
      { x: -0.2, y: 0.2, z: -0.1, size: 0.14, color: STAR_COLORS.blueWhite, brightness: 0.7 },
      { x: 0.8, y: 0.9, z: 0.3, size: 0.20, color: STAR_COLORS.brightBlue, brightness: 0.9, name: "Elnath" }, // Horn 1
      { x: 1.4, y: -0.6, z: -0.2, size: 0.16, color: STAR_COLORS.white, brightness: 0.8, name: "Zeta Tauri" }, // Horn 2
      // Pleiades sub-cluster (Seven Sisters)
      { x: 0.6, y: 0.4, z: 0.1, size: 0.15, color: STAR_COLORS.blueWhite, brightness: 0.85, name: "Alcyone" },
      { x: 0.7, y: 0.5, z: 0.15, size: 0.12, color: STAR_COLORS.brightBlue, brightness: 0.75 },
      { x: 0.5, y: 0.55, z: 0.08, size: 0.11, color: STAR_COLORS.blueWhite, brightness: 0.7 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [1, 4], [2, 5], [5, 6], [6, 7]
    ]
  },

  // 3. GEMINI (The Twins) - Castor & Pollux
  {
    name: "Gemini",
    symbol: "♊",
    description: "The Twins · June 21 - July 22",
    stars: [
      { x: -0.6, y: 1.4, z: 0.2, size: 0.23, color: STAR_COLORS.blueWhite, brightness: 0.95, name: "Castor" },
      { x: 0.4, y: 1.3, z: 0.0, size: 0.25, color: STAR_COLORS.warmGold, brightness: 1.0, name: "Pollux" },
      { x: -0.7, y: 0.5, z: -0.1, size: 0.15, color: STAR_COLORS.white, brightness: 0.7, name: "Mebsuta" },
      { x: 0.3, y: 0.4, z: 0.1, size: 0.16, color: STAR_COLORS.brightBlue, brightness: 0.75, name: "Wasat" },
      { x: -0.9, y: -0.5, z: 0.15, size: 0.17, color: STAR_COLORS.blueWhite, brightness: 0.8, name: "Tejat Prior" },
      { x: 0.2, y: -0.6, z: -0.2, size: 0.18, color: STAR_COLORS.paleGold, brightness: 0.85, name: "Alhena" },
      { x: -0.8, y: -1.2, z: 0.0, size: 0.12, color: STAR_COLORS.white, brightness: 0.6 },
      { x: 0.1, y: -1.3, z: 0.1, size: 0.13, color: STAR_COLORS.blueWhite, brightness: 0.65 },
    ],
    lines: [
      [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7]
    ]
  },

  // 4. CANCER (The Crab) - Acubens, Asellus, Beehive M44
  {
    name: "Cancer",
    symbol: "♋",
    description: "The Crab · July 23 - August 22",
    stars: [
      { x: 0.0, y: 0.2, z: 0.1, size: 0.17, color: STAR_COLORS.paleGold, brightness: 0.85, name: "Asellus Australis" },
      { x: 0.1, y: 0.8, z: -0.1, size: 0.16, color: STAR_COLORS.blueWhite, brightness: 0.8, name: "Asellus Borealis" },
      { x: -0.8, y: -0.6, z: 0.2, size: 0.19, color: STAR_COLORS.white, brightness: 0.9, name: "Acubens" },
      { x: 0.7, y: -0.5, z: -0.1, size: 0.15, color: STAR_COLORS.brightBlue, brightness: 0.75, name: "Tegmine" },
      { x: -0.3, y: 1.3, z: 0.0, size: 0.13, color: STAR_COLORS.white, brightness: 0.65 },
    ],
    lines: [
      [1, 0], [0, 2], [0, 3], [1, 4]
    ]
  },

  // 5. LEO (The Lion) - Regulus, Denebola, Algieba (The Sickle)
  {
    name: "Leo",
    symbol: "♌",
    description: "The Lion · August 23 - September 22",
    stars: [
      { x: -1.2, y: -0.9, z: 0.2, size: 0.27, color: STAR_COLORS.brightBlue, brightness: 1.0, name: "Regulus" },
      { x: -0.8, y: -0.2, z: 0.0, size: 0.18, color: STAR_COLORS.white, brightness: 0.85, name: "Eta Leonis" },
      { x: -0.6, y: 0.5, z: -0.1, size: 0.22, color: STAR_COLORS.warmGold, brightness: 0.9, name: "Algieba" },
      { x: -0.1, y: 0.9, z: 0.1, size: 0.17, color: STAR_COLORS.blueWhite, brightness: 0.8, name: "Adhafera" },
      { x: 0.4, y: 0.7, z: 0.2, size: 0.15, color: STAR_COLORS.white, brightness: 0.7, name: "Rasalas" },
      { x: 0.3, y: 0.1, z: -0.2, size: 0.19, color: STAR_COLORS.blueWhite, brightness: 0.85, name: "Zosma" },
      { x: 1.3, y: -0.3, z: 0.1, size: 0.21, color: STAR_COLORS.blueWhite, brightness: 0.9, name: "Denebola" },
      { x: 0.4, y: -0.7, z: 0.0, size: 0.16, color: STAR_COLORS.paleGold, brightness: 0.75, name: "Chertan" },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7], [7, 0], [5, 7]
    ]
  },

  // 6. VIRGO (The Maiden) - Spica, Porrima, Vindemiatrix
  {
    name: "Virgo",
    symbol: "♍",
    description: "The Maiden · September 23 - October 22",
    stars: [
      { x: -1.3, y: -1.1, z: 0.2, size: 0.28, color: STAR_COLORS.brightBlue, brightness: 1.0, name: "Spica" },
      { x: -0.7, y: -0.4, z: 0.0, size: 0.18, color: STAR_COLORS.white, brightness: 0.8, name: "Heze" },
      { x: -0.2, y: 0.2, z: -0.1, size: 0.20, color: STAR_COLORS.paleGold, brightness: 0.85, name: "Porrima" },
      { x: 0.4, y: 0.8, z: 0.1, size: 0.19, color: STAR_COLORS.warmGold, brightness: 0.85, name: "Vindemiatrix" },
      { x: 0.3, y: -0.1, z: 0.2, size: 0.16, color: STAR_COLORS.blueWhite, brightness: 0.75, name: "Zaniah" },
      { x: 0.9, y: -0.3, z: -0.2, size: 0.17, color: STAR_COLORS.white, brightness: 0.75, name: "Zavijava" },
      { x: -0.9, y: 0.6, z: 0.1, size: 0.15, color: STAR_COLORS.brightBlue, brightness: 0.7 },
      { x: 1.1, y: 0.5, z: 0.0, size: 0.14, color: STAR_COLORS.blueWhite, brightness: 0.65 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [2, 6], [3, 7]
    ]
  },

  // 7. LIBRA (The Scales) - Zubeneschamali, Zubenelgenubi
  {
    name: "Libra",
    symbol: "♎",
    description: "The Scales · October 23 - November 21",
    stars: [
      { x: 0.0, y: 1.0, z: 0.1, size: 0.24, color: STAR_COLORS.blueWhite, brightness: 0.95, name: "Zubeneschamali" },
      { x: -1.0, y: -0.2, z: 0.2, size: 0.22, color: STAR_COLORS.white, brightness: 0.9, name: "Zubenelgenubi" },
      { x: 0.9, y: 0.2, z: -0.1, size: 0.19, color: STAR_COLORS.paleGold, brightness: 0.8, name: "Zubenelhakrabi" },
      { x: -0.3, y: -1.0, z: 0.0, size: 0.17, color: STAR_COLORS.brightBlue, brightness: 0.75, name: "Brachium" },
      { x: 0.6, y: -0.8, z: 0.15, size: 0.15, color: STAR_COLORS.warmGold, brightness: 0.7 },
    ],
    lines: [
      [0, 1], [0, 2], [1, 3], [2, 4], [1, 2], [3, 4]
    ]
  },

  // 8. SCORPIO (The Scorpion) - Antares, Shaula, Sargas, Dschubba
  {
    name: "Scorpio",
    symbol: "♏",
    description: "The Scorpion · November 22 - December 21",
    stars: [
      { x: -1.2, y: 0.6, z: 0.2, size: 0.28, color: STAR_COLORS.warmGold, brightness: 1.0, name: "Antares" }, // Bright red supergiant
      { x: -1.5, y: 1.1, z: 0.1, size: 0.18, color: STAR_COLORS.blueWhite, brightness: 0.8, name: "Graffias" },
      { x: -1.6, y: 0.4, z: -0.1, size: 0.19, color: STAR_COLORS.brightBlue, brightness: 0.85, name: "Dschubba" },
      { x: -1.4, y: -0.1, z: 0.0, size: 0.17, color: STAR_COLORS.white, brightness: 0.75, name: "Pi Scorpii" },
      { x: -0.6, y: 0.2, z: 0.1, size: 0.16, color: STAR_COLORS.blueWhite, brightness: 0.7 },
      { x: -0.1, y: -0.3, z: 0.0, size: 0.19, color: STAR_COLORS.paleGold, brightness: 0.8, name: "Larawag" },
      { x: 0.4, y: -0.8, z: -0.2, size: 0.22, color: STAR_COLORS.white, brightness: 0.85, name: "Sargas" },
      { x: 1.0, y: -1.0, z: -0.1, size: 0.18, color: STAR_COLORS.brightBlue, brightness: 0.8 },
      { x: 1.4, y: -0.5, z: 0.1, size: 0.24, color: STAR_COLORS.blueWhite, brightness: 0.95, name: "Shaula" }, // The Stinger
      { x: 1.6, y: -0.2, z: 0.2, size: 0.17, color: STAR_COLORS.white, brightness: 0.75, name: "Lesath" },
    ],
    lines: [
      [1, 2], [2, 3], [2, 0], [0, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]
    ]
  },

  // 9. SAGITTARIUS (The Archer / Teapot) - Kaus Australis, Nunki, Ascella
  {
    name: "Sagittarius",
    symbol: "♐",
    description: "The Archer · December 22 - January 19",
    stars: [
      { x: -0.8, y: -0.6, z: 0.2, size: 0.25, color: STAR_COLORS.brightBlue, brightness: 1.0, name: "Kaus Australis" },
      { x: -0.9, y: 0.1, z: 0.0, size: 0.20, color: STAR_COLORS.white, brightness: 0.85, name: "Kaus Media" },
      { x: -0.6, y: 0.8, z: -0.1, size: 0.19, color: STAR_COLORS.paleGold, brightness: 0.8, name: "Kaus Borealis" },
      { x: 0.1, y: 0.2, z: 0.1, size: 0.21, color: STAR_COLORS.blueWhite, brightness: 0.9, name: "Nunki" },
      { x: 0.2, y: -0.5, z: 0.0, size: 0.22, color: STAR_COLORS.white, brightness: 0.85, name: "Ascella" },
      { x: 0.8, y: 0.5, z: -0.2, size: 0.17, color: STAR_COLORS.brightBlue, brightness: 0.75, name: "Tau Sagittarii" },
      { x: 1.0, y: -0.2, z: 0.1, size: 0.16, color: STAR_COLORS.paleGold, brightness: 0.7 },
      { x: -1.3, y: 0.4, z: 0.2, size: 0.18, color: STAR_COLORS.warmGold, brightness: 0.8, name: "Alnasl" }, // Teapot Spout
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3], [2, 7], [1, 7], [3, 5], [5, 6], [4, 6]
    ]
  },

  // 10. CAPRICORN (The Sea-Goat) - Deneb Algedi, Dabih, Algedi
  {
    name: "Capricorn",
    symbol: "♑",
    description: "The Sea Goat · January 20 - February 18",
    stars: [
      { x: -1.3, y: 0.8, z: 0.1, size: 0.21, color: STAR_COLORS.paleGold, brightness: 0.85, name: "Algedi" },
      { x: -1.2, y: 0.4, z: -0.1, size: 0.23, color: STAR_COLORS.warmGold, brightness: 0.9, name: "Dabih" },
      { x: -0.5, y: -0.4, z: 0.2, size: 0.17, color: STAR_COLORS.white, brightness: 0.75 },
      { x: 0.4, y: -0.8, z: 0.0, size: 0.18, color: STAR_COLORS.blueWhite, brightness: 0.8, name: "Nashira" },
      { x: 1.2, y: -0.5, z: -0.2, size: 0.25, color: STAR_COLORS.brightBlue, brightness: 1.0, name: "Deneb Algedi" },
      { x: 0.8, y: 0.2, z: 0.1, size: 0.16, color: STAR_COLORS.white, brightness: 0.7 },
      { x: 0.0, y: 0.6, z: 0.0, size: 0.15, color: STAR_COLORS.blueWhite, brightness: 0.65 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [2, 5]
    ]
  },

  // 11. AQUARIUS (The Water-Bearer) - Sadalsuud, Sadalmelik, Skat
  {
    name: "Aquarius",
    symbol: "♒",
    description: "The Water Bearer · February 19 - March 20",
    stars: [
      { x: -0.4, y: 1.1, z: 0.2, size: 0.25, color: STAR_COLORS.warmGold, brightness: 0.95, name: "Sadalsuud" },
      { x: 0.5, y: 0.9, z: 0.0, size: 0.24, color: STAR_COLORS.paleGold, brightness: 0.9, name: "Sadalmelik" },
      { x: 1.1, y: 0.4, z: -0.1, size: 0.19, color: STAR_COLORS.blueWhite, brightness: 0.8, name: "Sadachbia" },
      { x: -0.8, y: 0.2, z: 0.1, size: 0.18, color: STAR_COLORS.brightBlue, brightness: 0.75, name: "Albali" },
      { x: -0.6, y: -0.5, z: -0.2, size: 0.17, color: STAR_COLORS.white, brightness: 0.7, name: "Ancha" },
      { x: -0.3, y: -1.2, z: 0.0, size: 0.23, color: STAR_COLORS.blueWhite, brightness: 0.9, name: "Skat" },
      { x: 0.5, y: -0.4, z: 0.2, size: 0.16, color: STAR_COLORS.white, brightness: 0.65 },
      { x: 1.2, y: -1.0, z: 0.1, size: 0.15, color: STAR_COLORS.brightBlue, brightness: 0.6 },
    ],
    lines: [
      [3, 0], [0, 1], [1, 2], [0, 4], [4, 5], [1, 6], [6, 7]
    ]
  },

  // 12. PISCES (The Fishes) - Alrescha, Fum al Samakah
  {
    name: "Pisces",
    symbol: "♓",
    description: "The Fishes · March 21 - April 20",
    stars: [
      { x: 0.0, y: -1.2, z: 0.2, size: 0.24, color: STAR_COLORS.white, brightness: 0.95, name: "Alrescha" }, // The Knot
      // Western Fish Loop
      { x: -0.6, y: -0.5, z: 0.1, size: 0.17, color: STAR_COLORS.blueWhite, brightness: 0.75 },
      { x: -1.1, y: 0.2, z: 0.0, size: 0.19, color: STAR_COLORS.paleGold, brightness: 0.8 },
      { x: -1.4, y: 0.9, z: -0.1, size: 0.21, color: STAR_COLORS.brightBlue, brightness: 0.85, name: "Fum al Samakah" },
      { x: -0.9, y: 1.2, z: 0.1, size: 0.16, color: STAR_COLORS.white, brightness: 0.7 },
      { x: -0.5, y: 0.7, z: 0.2, size: 0.15, color: STAR_COLORS.blueWhite, brightness: 0.65 },
      // Northern Fish Loop
      { x: 0.6, y: -0.6, z: 0.0, size: 0.17, color: STAR_COLORS.warmGold, brightness: 0.75 },
      { x: 1.1, y: 0.0, z: -0.2, size: 0.18, color: STAR_COLORS.white, brightness: 0.8 },
      { x: 1.3, y: 0.7, z: 0.1, size: 0.20, color: STAR_COLORS.brightBlue, brightness: 0.85 },
      { x: 0.8, y: 1.0, z: 0.2, size: 0.15, color: STAR_COLORS.blueWhite, brightness: 0.65 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2],
      [0, 6], [6, 7], [7, 8], [8, 9], [9, 7]
    ]
  }
];
