export interface PopularTarget {
  id: string;
  name: string;
  ra: number;
  dec: number;
  radius: number;
  type: string;
  description: string;
  image?: string;
}

// Convert RA from HH:MM:SS to degrees
function raToDecimal(ra: string): number {
  const [hours, minutes, seconds] = ra.split(':').map(Number);
  return (hours + minutes / 60 + seconds / 3600) * 15;
}

// Convert Dec from DD:MM:SS to degrees
function decToDecimal(dec: string): number {
  const isNegative = dec.startsWith('-');
  const cleanDec = dec.replace('-', '');
  const [degrees, minutes, seconds] = cleanDec.split(':').map(Number);
  const decimal = degrees + minutes / 60 + seconds / 3600;
  return isNegative ? -decimal : decimal;
}

export const popularTargets: PopularTarget[] = [
  {
    id: "M31",
    name: "Andromeda Galaxy (M31)",
    ra: raToDecimal("00:42:44.3"),
    dec: decToDecimal("+41:16:09"),
    radius: 1.0,
    type: "Galaxy",
    description: "The nearest major galaxy to the Milky Way",
    image: "/images/andromeda.jpg"
  },
  {
    id: "M42",
    name: "Orion Nebula (M42)",
    ra: raToDecimal("05:35:17.3"),
    dec: decToDecimal("-05:23:28"),
    radius: 0.5,
    type: "Nebula",
    description: "A diffuse nebula in the Milky Way",
    image: "/images/orion.jpg"
  },
  {
    id: "M45",
    name: "Pleiades (M45)",
    ra: raToDecimal("03:47:24.0"),
    dec: decToDecimal("+24:07:00"),
    radius: 0.75,
    type: "Star Cluster",
    description: "An open star cluster in Taurus",
    image: "/images/pleiades.jpg"
  },
  {
    id: "HDF",
    name: "Hubble Deep Field",
    ra: raToDecimal("12:36:49.4"),
    dec: decToDecimal("+62:12:58"),
    radius: 0.2,
    type: "Deep Field",
    description: "A region of space containing nearly 3,000 galaxies, showcasing the early universe",
    image: "/images/hubble-deep-field.jpg"
  },
  {
    id: "M1",
    name: "Crab Nebula (M1)",
    ra: raToDecimal("05:34:31.9"),
    dec: decToDecimal("+22:00:52"),
    radius: 0.3,
    type: "Supernova Remnant",
    description: "A supernova remnant in Taurus",
    image: "/images/crab-nebula.jpg"
  },
  {
    id: "M51",
    name: "Whirlpool Galaxy (M51)",
    ra: raToDecimal("13:29:52.7"),
    dec: decToDecimal("+47:11:43"),
    radius: 0.4,
    type: "Galaxy",
    description: "A grand-design spiral galaxy interacting with NGC 5195",
    image: "/images/whirlpool.jpg"
  }
];
