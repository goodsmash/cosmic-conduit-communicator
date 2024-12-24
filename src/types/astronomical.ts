// Energy bands as defined in CAOM model
export type EnergyBand = 
  | 'RADIO'      // wavelength > ~10mm
  | 'MILLIMETER' // wavelength 0.1-10mm
  | 'INFRARED'   // wavelength 1μm-0.1mm
  | 'OPTICAL'    // wavelength 300nm-1μm
  | 'UV'         // wavelength 100-300nm
  | 'EUV'        // wavelength 10-100nm
  | 'XRAY'       // energy 0.12-120keV
  | 'GAMMARAY';  // energy > ~120keV

// Time range options for filtering
export type TimeRange = 
  | 'ALL'
  | 'LAST_24H'
  | 'LAST_WEEK'
  | 'LAST_MONTH'
  | 'LAST_YEAR'
  | 'CUSTOM';

// Observation types from CAOM model
export type ObservationType = 
  | 'ALL'
  | 'SCIENCE'
  | 'CALIBRATION';

// Interface matching CAOM Observation structure
export interface Observation {
  id: string;
  collection: string;
  observationID: string;
  type: string;
  intent: ObservationType;
  target?: {
    name: string;
    type: string;
    redshift?: number;
    moving?: boolean;
    standard?: boolean;
  };
  instrument?: {
    name: string;
    keywords: string[];
  };
  energy?: {
    bandpassName?: string;
    energyBands: EnergyBand[];
    resolvingPower?: number;
  };
  time?: {
    exposure?: number;
    resolution?: number;
  };
  quality?: {
    flag: 'GOOD' | 'QUESTIONABLE' | 'BAD';
  };
}
