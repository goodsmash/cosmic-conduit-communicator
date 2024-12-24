// Camera position presets for different simulations
export const cameraPresets = {
  orbital: [
    {
      name: "Default View",
      position: [20, 10, 20],
      target: [0, 0, 0]
    },
    {
      name: "Top View",
      position: [0, 30, 0],
      target: [0, 0, 0]
    },
    {
      name: "Side View",
      position: [30, 0, 0],
      target: [0, 0, 0]
    }
  ],
  stellar: [
    {
      name: "Default View",
      position: [15, 8, 15],
      target: [0, 0, 0]
    },
    {
      name: "Close-up",
      position: [8, 4, 8],
      target: [0, 0, 0]
    },
    {
      name: "Wide View",
      position: [25, 12, 25],
      target: [0, 0, 0]
    }
  ],
  galaxy: [
    {
      name: "Default View",
      position: [30, 20, 30],
      target: [0, 0, 0]
    },
    {
      name: "Edge-on View",
      position: [40, 0, 0],
      target: [0, 0, 0]
    },
    {
      name: "Face-on View",
      position: [0, 40, 0],
      target: [0, 0, 0]
    }
  ]
};

// Physics parameters for different simulations
export const physicsPresets = {
  orbital: {
    gravitationalConstant: 6.67430e-11,
    timeScale: 1000, // 1 second = 1000 simulation seconds
    defaultMasses: {
      star: 1.989e30, // Solar mass in kg
      planet: 5.972e24, // Earth mass in kg
      moon: 7.34767309e22 // Moon mass in kg
    }
  },
  stellar: {
    fusionRate: 0.1,
    radiationPressure: 1.0,
    stellarWindStrength: 0.5,
    defaultMasses: {
      protostar: 0.1, // Solar masses
      mainSequence: 1.0,
      redGiant: 1.2
    }
  },
  galaxy: {
    rotationSpeed: 0.1,
    starCount: 10000,
    darkMatterHaloMass: 1e12, // Solar masses
    diskScale: 5.0, // kpc
    bulgeMass: 1e10 // Solar masses
  }
};

// Visual effects presets
export const effectsPresets = {
  orbital: {
    trailLength: 100,
    particleSize: 0.1,
    starGlow: 0.8,
    planetGlow: 0.4
  },
  stellar: {
    coronaSize: 1.2,
    flareIntensity: 0.6,
    atmosphereOpacity: 0.3,
    plasmaDensity: 0.5
  },
  galaxy: {
    dustOpacity: 0.4,
    starBrightness: 0.7,
    nebulaIntensity: 0.5,
    spiralDefinition: 0.8
  }
};
