import { PopularTarget } from '@/data/popularTargets';

export interface AstronomicalObject extends PopularTarget {
  tags: string[];
  magnitude?: number;
  distance?: number;
  spectralType?: string;
  observationHistory: ObservationRecord[];
  relatedObjects: string[]; // IDs or names of related objects
  lastUpdated: string;
}

interface ObservationRecord {
  date: string;
  observer: string;
  conditions: string;
  notes: string;
}

export interface CoordinateRange {
  raMin: string;
  raMax: string;
  decMin: string;
  decMax: string;
}

// Convert RA from HH:MM:SS.S to decimal degrees
export function raToDecimal(ra: string): number {
  const [hours, minutes, seconds] = ra.split(':').map(Number);
  return (hours + minutes / 60 + seconds / 3600) * 15;
}

// Convert Dec from DD:MM:SS.S to decimal degrees
export function decToDecimal(dec: string): number {
  const [degrees, minutes, seconds] = dec.split(':').map(Number);
  const sign = degrees < 0 || dec.startsWith('-') ? -1 : 1;
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

// Calculate angular separation between two objects
export function calculateAngularSeparation(
  ra1: string,
  dec1: string,
  ra2: string,
  dec2: string
): number {
  const ra1Decimal = raToDecimal(ra1) * Math.PI / 180;
  const dec1Decimal = decToDecimal(dec1) * Math.PI / 180;
  const ra2Decimal = raToDecimal(ra2) * Math.PI / 180;
  const dec2Decimal = decToDecimal(dec2) * Math.PI / 180;

  const cosAngle = Math.sin(dec1Decimal) * Math.sin(dec2Decimal) +
    Math.cos(dec1Decimal) * Math.cos(dec2Decimal) * Math.cos(ra1Decimal - ra2Decimal);

  return Math.acos(Math.min(1, cosAngle)) * 180 / Math.PI;
}

// Find objects within a given radius of coordinates
export function findNearbyObjects(
  objects: AstronomicalObject[],
  centerRA: string,
  centerDec: string,
  radiusDegrees: number
): AstronomicalObject[] {
  return objects.filter(obj => {
    const separation = calculateAngularSeparation(
      centerRA,
      centerDec,
      obj.ra,
      obj.dec
    );
    return separation <= radiusDegrees;
  });
}

// Auto-generate tags based on object properties
export function generateTags(object: AstronomicalObject): string[] {
  const tags: Set<string> = new Set([object.type.toLowerCase()]);

  // Add tags based on type
  switch (object.type.toLowerCase()) {
    case 'galaxy':
      tags.add('deep-sky');
      if (object.description.toLowerCase().includes('active')) tags.add('agn');
      break;
    case 'nebula':
      tags.add('deep-sky');
      if (object.description.toLowerCase().includes('planetary')) tags.add('planetary');
      if (object.description.toLowerCase().includes('emission')) tags.add('emission');
      break;
    case 'star cluster':
      tags.add('deep-sky');
      if (object.description.toLowerCase().includes('open')) tags.add('open-cluster');
      if (object.description.toLowerCase().includes('globular')) tags.add('globular-cluster');
      break;
  }

  // Add tags based on magnitude
  if (object.magnitude !== undefined) {
    if (object.magnitude < 6) tags.add('naked-eye');
    if (object.magnitude < 10) tags.add('binocular-target');
    if (object.magnitude > 15) tags.add('telescope-required');
  }

  // Add tags based on coordinates
  const dec = decToDecimal(object.dec);
  if (dec > 0) tags.add('northern-hemisphere');
  if (dec < 0) tags.add('southern-hemisphere');

  return Array.from(tags);
}

// Sort objects by various criteria
export function sortAstronomicalObjects(
  objects: AstronomicalObject[],
  criterion: 'ra' | 'dec' | 'magnitude' | 'type' | 'distance'
): AstronomicalObject[] {
  return [...objects].sort((a, b) => {
    switch (criterion) {
      case 'ra':
        return raToDecimal(a.ra) - raToDecimal(b.ra);
      case 'dec':
        return decToDecimal(a.dec) - decToDecimal(b.dec);
      case 'magnitude':
        return (a.magnitude ?? Infinity) - (b.magnitude ?? Infinity);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'distance':
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      default:
        return 0;
    }
  });
}
