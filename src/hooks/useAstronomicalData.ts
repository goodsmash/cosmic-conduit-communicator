import { useState, useEffect, useCallback } from 'react';
import astronomicalDataService, { QueryParams } from '@/services/AstronomicalDataService';
import { AstronomicalObject } from '@/utils/astronomyUtils';
import { ProcessedData } from '@/utils/dataProcessing';

interface UseAstronomicalDataReturn {
  objects: AstronomicalObject[];
  processedData: ProcessedData | null;
  selectedObject: AstronomicalObject | null;
  similarObjects: AstronomicalObject[];
  loading: boolean;
  error: string | null;
  queryObjects: (params: QueryParams) => Promise<void>;
  selectObject: (object: AstronomicalObject | null) => void;
  addObject: (object: Partial<AstronomicalObject>) => Promise<void>;
  updateObject: (object: AstronomicalObject) => Promise<void>;
  deleteObject: (objectName: string) => Promise<void>;
  addObservation: (objectName: string, observation: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useAstronomicalData(): UseAstronomicalDataReturn {
  const [objects, setObjects] = useState<AstronomicalObject[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [selectedObject, setSelectedObject] = useState<AstronomicalObject | null>(null);
  const [similarObjects, setSimilarObjects] = useState<AstronomicalObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await astronomicalDataService.initialize();
      if (!result.success) {
        throw new Error(result.error);
      }

      const data = await astronomicalDataService.getProcessedData();
      if (data) {
        setProcessedData(data);
        setObjects(data.objects);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const updateSimilarObjects = async () => {
      if (selectedObject) {
        const similar = await astronomicalDataService.getSimilarObjects(selectedObject);
        setSimilarObjects(similar);
      } else {
        setSimilarObjects([]);
      }
    };

    updateSimilarObjects();
  }, [selectedObject]);

  const queryObjects = async (params: QueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const results = await astronomicalDataService.queryObjects(params);
      setObjects(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query objects');
    } finally {
      setLoading(false);
    }
  };

  const selectObject = (object: AstronomicalObject | null) => {
    setSelectedObject(object);
  };

  const addObject = async (object: Partial<AstronomicalObject>) => {
    try {
      setLoading(true);
      setError(null);

      await astronomicalDataService.addObject(object);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add object');
    } finally {
      setLoading(false);
    }
  };

  const updateObject = async (object: AstronomicalObject) => {
    try {
      setLoading(true);
      setError(null);

      await astronomicalDataService.updateObject(object);
      await refreshData();

      if (selectedObject?.name === object.name) {
        setSelectedObject(object);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update object');
    } finally {
      setLoading(false);
    }
  };

  const deleteObject = async (objectName: string) => {
    try {
      setLoading(true);
      setError(null);

      await astronomicalDataService.deleteObject(objectName);
      await refreshData();

      if (selectedObject?.name === objectName) {
        setSelectedObject(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete object');
    } finally {
      setLoading(false);
    }
  };

  const addObservation = async (objectName: string, observation: string) => {
    try {
      setLoading(true);
      setError(null);

      await astronomicalDataService.addObservation(objectName, observation);
      await refreshData();

      if (selectedObject?.name === objectName) {
        const updatedObject = await astronomicalDataService.getObjectById(objectName);
        if (updatedObject) {
          setSelectedObject(updatedObject);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add observation');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await astronomicalDataService.getProcessedData();
      if (data) {
        setProcessedData(data);
        setObjects(data.objects);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return {
    objects,
    processedData,
    selectedObject,
    similarObjects,
    loading,
    error,
    queryObjects,
    selectObject,
    addObject,
    updateObject,
    deleteObject,
    addObservation,
    refreshData,
  };
}

export default useAstronomicalData;
