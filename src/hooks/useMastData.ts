import { useState } from 'react';
import { MastApiService, MastSearchParams, ImageMetadata } from '@/services/mastApi';

interface MastDataState {
  images: ImageMetadata[];
  loading: boolean;
  error: Error | null;
}

export function useMastData() {
  const [state, setState] = useState<MastDataState>({
    images: [],
    loading: false,
    error: null
  });

  const searchData = async (params: MastSearchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const images = await MastApiService.searchImages(params);
      setState({
        images,
        loading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Failed to fetch data')
      }));
    }
  };

  return {
    ...state,
    searchData
  };
}
