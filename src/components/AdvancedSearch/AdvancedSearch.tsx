import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchParams {
  target: string;
  ra: string;
  dec: string;
  radius: string;
  instrument: string;
  productType: string;
  format: string;
  resolver: 'resolve' | 'dont-resolve';
  equinox: 'J2000' | 'B1950' | 'B1900';
}

interface AdvancedSearchProps {
  onSearch: (params: SearchParams) => void;
}

const defaultParams: SearchParams = {
  target: '',
  ra: '',
  dec: '',
  radius: '3.0',
  instrument: '',
  productType: '',
  format: '',
  resolver: 'resolve',
  equinox: 'J2000',
};

export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [params, setParams] = useState<SearchParams>(defaultParams);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(params);
  };

  const handleReset = () => {
    setParams(defaultParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Search</CardTitle>
          <CardDescription>
            Search for astronomical objects and data products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="target">Target Name</Label>
              <Input
                id="target"
                placeholder="e.g., M31, Andromeda"
                value={params.target}
                onChange={(e) => setParams({ ...params, target: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolver">Name Resolver</Label>
              <Select
                value={params.resolver}
                onValueChange={(value: 'resolve' | 'dont-resolve') =>
                  setParams({ ...params, resolver: value })
                }
              >
                <SelectTrigger id="resolver">
                  <SelectValue placeholder="Select resolver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolve">Resolve</SelectItem>
                  <SelectItem value="dont-resolve">Don't Resolve</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ra">Right Ascension</Label>
              <Input
                id="ra"
                placeholder="HH:MM:SS.S"
                value={params.ra}
                onChange={(e) => setParams({ ...params, ra: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dec">Declination</Label>
              <Input
                id="dec"
                placeholder="DD:MM:SS.S"
                value={params.dec}
                onChange={(e) => setParams({ ...params, dec: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equinox">Equinox</Label>
              <Select
                value={params.equinox}
                onValueChange={(value: 'J2000' | 'B1950' | 'B1900') =>
                  setParams({ ...params, equinox: value })
                }
              >
                <SelectTrigger id="equinox">
                  <SelectValue placeholder="Select equinox" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="J2000">J2000</SelectItem>
                  <SelectItem value="B1950">B1950</SelectItem>
                  <SelectItem value="B1900">B1900</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Radius */}
          <div className="space-y-2">
            <Label htmlFor="radius">Search Radius (arcmin)</Label>
            <Input
              id="radius"
              type="number"
              step="0.1"
              value={params.radius}
              onChange={(e) => setParams({ ...params, radius: e.target.value })}
            />
          </div>

          {/* Data Product Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="instrument">Instrument</Label>
              <Input
                id="instrument"
                placeholder="e.g., COS, STIS"
                value={params.instrument}
                onChange={(e) =>
                  setParams({ ...params, instrument: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type</Label>
              <Input
                id="productType"
                placeholder="e.g., spectrum, image"
                value={params.productType}
                onChange={(e) =>
                  setParams({ ...params, productType: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Input
                id="format"
                placeholder="e.g., FITS, CSV"
                value={params.format}
                onChange={(e) => setParams({ ...params, format: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}
