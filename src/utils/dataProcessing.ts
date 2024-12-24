import { AstronomicalObject } from './astronomyUtils';

export interface ProcessedData {
  objects: AstronomicalObject[];
  statistics: DataStatistics;
  categories: CategoryBreakdown;
  recommendations: string[];
  clusters: ClusterAnalysis;
  trends: TrendAnalysis;
}

interface DataStatistics {
  totalObjects: number;
  averageMagnitude?: number;
  brightestObject?: string;
  faintestObject?: string;
  northernObjects: number;
  southernObjects: number;
  typeDistribution: { [key: string]: number };
  densityMap: DensityRegion[];
}

interface CategoryBreakdown {
  byType: { [key: string]: number };
  byTag: { [key: string]: number };
  byConstellation: { [key: string]: number };
  byBrightnessRange: { [key: string]: number };
}

interface ClusterAnalysis {
  spatialClusters: SpatialCluster[];
  typeClusters: TypeCluster[];
  correlations: Correlation[];
}

interface TrendAnalysis {
  seasonalVisibility: SeasonalVisibility[];
  observabilityTrends: ObservabilityTrend[];
  discoveryTimeline: DiscoveryEvent[];
}

interface DensityRegion {
  ra: number;
  dec: number;
  density: number;
  objects: string[];
}

interface SpatialCluster {
  center: { ra: number; dec: number };
  radius: number;
  members: string[];
  dominantType: string;
}

interface TypeCluster {
  type: string;
  count: number;
  averageMagnitude?: number;
  commonTags: string[];
}

interface Correlation {
  factor1: string;
  factor2: string;
  strength: number;
  description: string;
}

interface SeasonalVisibility {
  season: string;
  visibleObjects: string[];
  bestViewingTime: string;
}

interface ObservabilityTrend {
  objectName: string;
  periods: {
    start: string;
    end: string;
    quality: number;
  }[];
}

interface DiscoveryEvent {
  date: string;
  objectName: string;
  significance: string;
}

export class DataProcessor {
  private data: AstronomicalObject[];
  private processedData: ProcessedData;

  constructor(initialData: AstronomicalObject[]) {
    this.data = initialData;
    this.processedData = this.processData();
  }

  private processData(): ProcessedData {
    const statistics = this.calculateStatistics();
    const categories = this.categorizeData();
    const clusters = this.analyzePatterns();
    const trends = this.analyzeTrends();
    const recommendations = this.generateRecommendations(statistics, clusters, trends);

    return {
      objects: this.data,
      statistics,
      categories,
      recommendations,
      clusters,
      trends,
    };
  }

  private calculateStatistics(): DataStatistics {
    const magnitudes = this.data
      .filter(obj => obj.magnitude !== undefined)
      .map(obj => obj.magnitude!);

    const northernObjects = this.data.filter(obj => parseFloat(obj.dec.split(':')[0]) > 0).length;

    const typeDistribution = this.data.reduce((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const densityMap = this.calculateDensityMap();

    return {
      totalObjects: this.data.length,
      averageMagnitude: magnitudes.length > 0 
        ? magnitudes.reduce((a, b) => a + b) / magnitudes.length 
        : undefined,
      brightestObject: magnitudes.length > 0
        ? this.data.find(obj => obj.magnitude === Math.min(...magnitudes))?.name
        : undefined,
      faintestObject: magnitudes.length > 0
        ? this.data.find(obj => obj.magnitude === Math.max(...magnitudes))?.name
        : undefined,
      northernObjects,
      southernObjects: this.data.length - northernObjects,
      typeDistribution,
      densityMap,
    };
  }

  private calculateDensityMap(): DensityRegion[] {
    const regions: DensityRegion[] = [];
    const gridSize = 15; // 15-degree cells

    for (let ra = 0; ra < 360; ra += gridSize) {
      for (let dec = -90; dec <= 90; dec += gridSize) {
        const objectsInRegion = this.data.filter(obj => {
          const objRa = this.parseRA(obj.ra);
          const objDec = this.parseDec(obj.dec);
          return (
            objRa >= ra && objRa < ra + gridSize &&
            objDec >= dec && objDec < dec + gridSize
          );
        });

        if (objectsInRegion.length > 0) {
          regions.push({
            ra: ra + gridSize / 2,
            dec: dec + gridSize / 2,
            density: objectsInRegion.length,
            objects: objectsInRegion.map(obj => obj.name),
          });
        }
      }
    }

    return regions;
  }

  private parseRA(ra: string): number {
    const [hours, minutes, seconds] = ra.split(':').map(Number);
    return (hours + minutes / 60 + (seconds || 0) / 3600) * 15; // Convert to degrees
  }

  private parseDec(dec: string): number {
    const [degrees, minutes, seconds] = dec.split(':').map(Number);
    const sign = degrees < 0 ? -1 : 1;
    return degrees + sign * (minutes / 60 + (seconds || 0) / 3600);
  }

  private categorizeData(): CategoryBreakdown {
    const byType: { [key: string]: number } = {};
    const byTag: { [key: string]: number } = {};
    const byConstellation: { [key: string]: number } = {};
    const byBrightnessRange: { [key: string]: number } = {};

    this.data.forEach(obj => {
      // Count by type
      byType[obj.type] = (byType[obj.type] || 0) + 1;

      // Count by tags
      obj.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });

      // Count by constellation
      const constellation = this.getConstellation(obj.ra, obj.dec);
      if (constellation) {
        byConstellation[constellation] = (byConstellation[constellation] || 0) + 1;
      }

      // Count by brightness range
      if (obj.magnitude !== undefined) {
        const range = this.getBrightnessRange(obj.magnitude);
        byBrightnessRange[range] = (byBrightnessRange[range] || 0) + 1;
      }
    });

    return { byType, byTag, byConstellation, byBrightnessRange };
  }

  private getBrightnessRange(magnitude: number): string {
    if (magnitude <= 0) return 'Extremely Bright (≤ 0)';
    if (magnitude <= 3) return 'Bright (0-3)';
    if (magnitude <= 6) return 'Naked Eye (3-6)';
    if (magnitude <= 10) return 'Binocular (6-10)';
    return 'Telescope (> 10)';
  }

  private analyzePatterns(): ClusterAnalysis {
    const spatialClusters = this.findSpatialClusters();
    const typeClusters = this.analyzeTypeClusters();
    const correlations = this.findCorrelations();

    return {
      spatialClusters,
      typeClusters,
      correlations,
    };
  }

  private findSpatialClusters(): SpatialCluster[] {
    // Implement DBSCAN or similar clustering algorithm
    return [];
  }

  private analyzeTypeClusters(): TypeCluster[] {
    const clusters: TypeCluster[] = [];
    const types = [...new Set(this.data.map(obj => obj.type))];

    types.forEach(type => {
      const objectsOfType = this.data.filter(obj => obj.type === type);
      const magnitudes = objectsOfType
        .filter(obj => obj.magnitude !== undefined)
        .map(obj => obj.magnitude!);
      
      const tagCounts: { [key: string]: number } = {};
      objectsOfType.forEach(obj => {
        obj.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const commonTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      clusters.push({
        type,
        count: objectsOfType.length,
        averageMagnitude: magnitudes.length > 0
          ? magnitudes.reduce((a, b) => a + b) / magnitudes.length
          : undefined,
        commonTags,
      });
    });

    return clusters;
  }

  private findCorrelations(): Correlation[] {
    // Implement correlation analysis
    return [];
  }

  private analyzeTrends(): TrendAnalysis {
    return {
      seasonalVisibility: this.calculateSeasonalVisibility(),
      observabilityTrends: this.calculateObservabilityTrends(),
      discoveryTimeline: this.generateDiscoveryTimeline(),
    };
  }

  private calculateSeasonalVisibility(): SeasonalVisibility[] {
    // Implement seasonal visibility calculation
    return [];
  }

  private calculateObservabilityTrends(): ObservabilityTrend[] {
    // Implement observability trends calculation
    return [];
  }

  private generateDiscoveryTimeline(): DiscoveryEvent[] {
    // Implement discovery timeline generation
    return [];
  }

  private generateRecommendations(
    statistics: DataStatistics,
    clusters: ClusterAnalysis,
    trends: TrendAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Balance-based recommendations
    if (statistics.northernObjects < statistics.southernObjects) {
      recommendations.push('Consider adding more northern hemisphere objects');
    }

    // Type distribution recommendations
    const typeDistribution = statistics.typeDistribution;
    const avgObjectsPerType = Object.values(typeDistribution).reduce((a, b) => a + b, 0) / 
                            Object.keys(typeDistribution).length;

    Object.entries(typeDistribution).forEach(([type, count]) => {
      if (count < avgObjectsPerType * 0.5) {
        recommendations.push(`Consider adding more ${type.toLowerCase()} objects`);
      }
    });

    // Cluster-based recommendations
    clusters.spatialClusters.forEach(cluster => {
      if (cluster.members.length > 5) {
        recommendations.push(
          `Notable cluster of ${cluster.dominantType} objects found at RA:${cluster.center.ra.toFixed(1)}, Dec:${cluster.center.dec.toFixed(1)}`
        );
      }
    });

    // Seasonal recommendations
    trends.seasonalVisibility.forEach(season => {
      if (season.visibleObjects.length < 10) {
        recommendations.push(`Limited objects visible during ${season.season}`);
      }
    });

    return recommendations;
  }

  // Public methods
  public getProcessedData(): ProcessedData {
    return this.processedData;
  }

  public updateData(newData: AstronomicalObject[]): void {
    this.data = newData;
    this.processedData = this.processData();
  }

  public findSimilarObjects(object: AstronomicalObject): AstronomicalObject[] {
    return this.data
      .filter(obj => obj !== object)
      .map(obj => ({
        object: obj,
        similarity: this.calculateSimilarity(object, obj),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(item => item.object);
  }

  private calculateSimilarity(a: AstronomicalObject, b: AstronomicalObject): number {
    let similarity = 0;

    // Type match
    if (a.type === b.type) similarity += 0.3;

    // Tag overlap
    const commonTags = a.tags.filter(tag => b.tags.includes(tag));
    similarity += (commonTags.length / Math.max(a.tags.length, b.tags.length)) * 0.3;

    // Magnitude similarity
    if (a.magnitude !== undefined && b.magnitude !== undefined) {
      const magDiff = Math.abs(a.magnitude - b.magnitude);
      similarity += (1 - Math.min(magDiff / 10, 1)) * 0.2;
    }

    // Position proximity
    const angularSeparation = this.calculateAngularSeparation(
      this.parseRA(a.ra), this.parseDec(a.dec),
      this.parseRA(b.ra), this.parseDec(b.dec)
    );
    similarity += (1 - Math.min(angularSeparation / 90, 1)) * 0.2;

    return similarity;
  }

  private calculateAngularSeparation(ra1: number, dec1: number, ra2: number, dec2: number): number {
    const φ1 = dec1 * Math.PI / 180;
    const φ2 = dec2 * Math.PI / 180;
    const Δλ = (ra2 - ra1) * Math.PI / 180;
    
    const separation = Math.acos(
      Math.sin(φ1) * Math.sin(φ2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    ) * 180 / Math.PI;

    return separation;
  }

  private getConstellation(ra: string, dec: string): string | null {
    // Implement constellation determination
    return null;
  }
}
