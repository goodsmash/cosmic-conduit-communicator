import React, { useState } from 'react';
import { useMastData } from '@/hooks/useMastData';
import { popularTargets } from '@/data/popularTargets';
import { MastApiService } from '@/services/mastApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Search, 
  Star,
  Shuffle,
  Info,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';

const AstronomicalDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    ra: '',
    dec: '',
    radius: '0.2',
    targetName: ''
  });

  const { images, loading, error, searchData } = useMastData();

  const handleSearch = () => {
    if (!searchParams.ra && !searchParams.dec && !searchParams.targetName) {
      return;
    }

    const params = {
      ra: searchParams.ra ? parseFloat(searchParams.ra) : undefined,
      dec: searchParams.dec ? parseFloat(searchParams.dec) : undefined,
      radius: parseFloat(searchParams.radius),
      targetName: searchParams.targetName || undefined,
      maxRecords: 100
    };
    searchData(params);
  };

  const handlePopularTargetClick = (target: typeof popularTargets[0]) => {
    setSearchParams({
      ra: target.ra.toString(),
      dec: target.dec.toString(),
      radius: target.radius.toString(),
      targetName: target.name
    });
    searchData({
      ra: target.ra,
      dec: target.dec,
      radius: target.radius,
      targetName: target.name,
      maxRecords: 100
    });
  };

  const handleRandomDiscover = async () => {
    try {
      const discovery = await MastApiService.getRandomDiscovery();
      setSearchParams({
        ra: discovery.ra.toString(),
        dec: discovery.dec.toString(),
        radius: '0.2',
        targetName: ''
      });
      searchData({
        ra: discovery.ra,
        dec: discovery.dec,
        radius: 0.2,
        maxRecords: 100
      });
    } catch (error) {
      console.error('Error during random discovery:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Astronomical Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Search for astronomical images using coordinates or target names
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRandomDiscover}
          disabled={loading}
          title="Random Discovery"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
          <CardDescription>Enter coordinates or target name to search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Right Ascension (RA)</label>
              <Input
                placeholder="Degrees (0-360)"
                value={searchParams.ra}
                onChange={(e) => setSearchParams({ ...searchParams, ra: e.target.value })}
                onKeyPress={handleKeyPress}
                type="number"
                min="0"
                max="360"
                step="0.0001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Declination (Dec)</label>
              <Input
                placeholder="Degrees (-90 to +90)"
                value={searchParams.dec}
                onChange={(e) => setSearchParams({ ...searchParams, dec: e.target.value })}
                onKeyPress={handleKeyPress}
                type="number"
                min="-90"
                max="90"
                step="0.0001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Radius (degrees)</label>
              <Input
                placeholder="Search radius"
                value={searchParams.radius}
                onChange={(e) => setSearchParams({ ...searchParams, radius: e.target.value })}
                onKeyPress={handleKeyPress}
                type="number"
                min="0.01"
                max="10"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Name (optional)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., M31, Andromeda"
                  value={searchParams.targetName}
                  onChange={(e) => setSearchParams({ ...searchParams, targetName: e.target.value })}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Targets</CardTitle>
        </CardHeader>
        <ScrollArea className="h-20">
          <div className="flex gap-2 p-4">
            {popularTargets.map((target) => (
              <Button
                key={target.id}
                variant="outline"
                size="sm"
                onClick={() => handlePopularTargetClick(target)}
                disabled={loading}
              >
                <Star className="h-4 w-4 mr-2" />
                {target.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {loading ? 'Searching...' : `Found ${images.length} images`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <Card key={n}>
                  <CardContent className="p-4">
                    <Skeleton className="h-[200px] w-full" />
                    <div className="space-y-2 mt-4">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    {image.thumbnailUrl ? (
                      <img
                        src={image.thumbnailUrl}
                        alt={image.title || 'Astronomical object'}
                        className="w-full h-[200px] object-cover rounded-md"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-[200px] bg-muted flex items-center justify-center rounded-md">
                        <Info className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium truncate" title={image.title}>
                        {image.title || 'Untitled Image'}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2" title={image.description}>
                        {image.description}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={image.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={image.url} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && images.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No images found. Try adjusting your search parameters or selecting a popular target.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AstronomicalDiscoveryPage;
