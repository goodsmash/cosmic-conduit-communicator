import { AstronomicalObject } from '@/utils/astronomyUtils';
import { ProcessedData, DataProcessor } from '@/utils/dataProcessing';

export interface QueryParams {
  type?: string;
  constellation?: string;
  minMagnitude?: number;
  maxMagnitude?: number;
  tags?: string[];
  hemisphere?: 'north' | 'south';
  searchTerm?: string;
}

class AstronomicalDataService {
  private dataProcessor: DataProcessor;
  private objects: AstronomicalObject[];
  private processedData: ProcessedData | null;

  constructor() {
    this.objects = [];
    this.processedData = null;
    this.dataProcessor = new DataProcessor([]);
  }

  async initialize() {
    try {
      // Load initial data
      const popularTargets = await this.loadPopularTargets();
      const catalogObjects = await this.loadCatalogObjects();
      const userObjects = await this.loadUserObjects();

      // Combine all data sources
      this.objects = [
        ...popularTargets,
        ...catalogObjects,
        ...userObjects
      ];

      // Process the combined data
      this.dataProcessor = new DataProcessor(this.objects);
      this.processedData = this.dataProcessor.getProcessedData();

      return {
        success: true,
        data: this.processedData
      };
    } catch (error) {
      console.error('Failed to initialize astronomical data:', error);
      return {
        success: false,
        error: 'Failed to initialize data'
      };
    }
  }

  private async loadPopularTargets(): Promise<AstronomicalObject[]> {
    try {
      const { popularTargets } = await import('@/data/popularTargets');
      return popularTargets.map(target => ({
        ...target,
        tags: this.generateInitialTags(target),
        observationHistory: [],
        relatedObjects: [],
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to load popular targets:', error);
      return [];
    }
  }

  private async loadCatalogObjects(): Promise<AstronomicalObject[]> {
    // TODO: Implement catalog loading from external source
    return [];
  }

  private async loadUserObjects(): Promise<AstronomicalObject[]> {
    // TODO: Implement user objects loading from local storage or database
    return [];
  }

  private generateInitialTags(object: Partial<AstronomicalObject>): string[] {
    const tags: string[] = [];

    // Type-based tags
    if (object.type) {
      tags.push(object.type.toLowerCase());
      switch (object.type.toLowerCase()) {
        case 'galaxy':
          tags.push('deep-sky');
          break;
        case 'star cluster':
          tags.push('stellar');
          break;
        case 'nebula':
          tags.push('diffuse');
          break;
      }
    }

    // Magnitude-based tags
    if (object.magnitude !== undefined) {
      if (object.magnitude <= 0) tags.push('extremely-bright');
      else if (object.magnitude <= 3) tags.push('bright');
      else if (object.magnitude <= 6) tags.push('naked-eye');
      else if (object.magnitude <= 10) tags.push('binocular');
      else tags.push('telescope');
    }

    // Position-based tags
    if (object.dec) {
      const declination = this.parseDec(object.dec);
      if (declination > 0) tags.push('northern-hemisphere');
      else tags.push('southern-hemisphere');

      if (Math.abs(declination) > 60) tags.push('circumpolar');
    }

    return tags;
  }

  private parseDec(dec: string): number {
    const [degrees, minutes, seconds] = dec.split(':').map(Number);
    const sign = degrees < 0 ? -1 : 1;
    return degrees + sign * (minutes / 60 + (seconds || 0) / 3600);
  }

  async queryObjects(params: QueryParams): Promise<AstronomicalObject[]> {
    let filtered = [...this.objects];

    // Apply filters based on query parameters
    if (params.type) {
      filtered = filtered.filter(obj => 
        obj.type.toLowerCase() === params.type!.toLowerCase()
      );
    }

    if (params.constellation) {
      filtered = filtered.filter(obj => 
        obj.tags.includes(params.constellation!.toLowerCase())
      );
    }

    if (params.minMagnitude !== undefined) {
      filtered = filtered.filter(obj => 
        obj.magnitude !== undefined && obj.magnitude >= params.minMagnitude!
      );
    }

    if (params.maxMagnitude !== undefined) {
      filtered = filtered.filter(obj => 
        obj.magnitude !== undefined && obj.magnitude <= params.maxMagnitude!
      );
    }

    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter(obj => 
        params.tags!.every(tag => obj.tags.includes(tag.toLowerCase()))
      );
    }

    if (params.hemisphere) {
      const tag = `${params.hemisphere}-hemisphere`;
      filtered = filtered.filter(obj => obj.tags.includes(tag));
    }

    if (params.searchTerm) {
      const term = params.searchTerm.toLowerCase();
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(term) ||
        obj.description.toLowerCase().includes(term) ||
        obj.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  async getObjectById(id: string): Promise<AstronomicalObject | null> {
    return this.objects.find(obj => obj.name === id) || null;
  }

  async getSimilarObjects(object: AstronomicalObject): Promise<AstronomicalObject[]> {
    return this.dataProcessor.findSimilarObjects(object);
  }

  async getProcessedData(): Promise<ProcessedData | null> {
    return this.processedData;
  }

  async addObject(object: Partial<AstronomicalObject>): Promise<AstronomicalObject> {
    const newObject: AstronomicalObject = {
      name: object.name || `Object-${Date.now()}`,
      type: object.type || 'Unknown',
      ra: object.ra || '00:00:00',
      dec: object.dec || '00:00:00',
      magnitude: object.magnitude,
      description: object.description || '',
      image: object.image,
      tags: object.tags || this.generateInitialTags(object),
      observationHistory: object.observationHistory || [],
      relatedObjects: object.relatedObjects || [],
      lastUpdated: new Date().toISOString()
    };

    this.objects.push(newObject);
    this.dataProcessor.updateData(this.objects);
    this.processedData = this.dataProcessor.getProcessedData();

    return newObject;
  }

  async updateObject(object: AstronomicalObject): Promise<AstronomicalObject> {
    const index = this.objects.findIndex(obj => obj.name === object.name);
    if (index === -1) {
      throw new Error('Object not found');
    }

    this.objects[index] = {
      ...object,
      lastUpdated: new Date().toISOString()
    };

    this.dataProcessor.updateData(this.objects);
    this.processedData = this.dataProcessor.getProcessedData();

    return this.objects[index];
  }

  async deleteObject(objectName: string): Promise<void> {
    this.objects = this.objects.filter(obj => obj.name !== objectName);
    this.dataProcessor.updateData(this.objects);
    this.processedData = this.dataProcessor.getProcessedData();
  }

  async addObservation(objectName: string, observation: string): Promise<void> {
    const object = await this.getObjectById(objectName);
    if (!object) {
      throw new Error('Object not found');
    }

    object.observationHistory.push({
      timestamp: new Date().toISOString(),
      note: observation
    });

    await this.updateObject(object);
  }

  async getObservationHistory(objectName: string): Promise<any[]> {
    const object = await this.getObjectById(objectName);
    return object ? object.observationHistory : [];
  }
}

export const astronomicalDataService = new AstronomicalDataService();
export default astronomicalDataService;
