import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SuggestedSearches } from '@/components/SuggestedSearches';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchResult {
  target_name?: string;
  obs_id: string;
  s_ra: number;
  s_dec: number;
  instrument_name: string;
  dataproduct_type: string;
  calib_level: number;
  t_min: string;
  t_max: string;
  dataURL: string;
  preview_url?: string;
}

export default function DataSearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    target: '',
    ra: '',
    dec: '',
    radius: '0.2'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleObjectSelect = (object: any) => {
    setSearchParams({
      target: object.name,
      ra: object.ra?.toString() || '',
      dec: object.dec?.toString() || '',
      radius: '0.2'
    });
    handleSearch();
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/observations/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MAST Data Search</h1>

      <Tabs defaultValue="search" className="mb-4">
        <TabsList>
          <TabsTrigger value="search">Search Form</TabsTrigger>
          <TabsTrigger value="suggested">Suggested Objects</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Name</label>
                <Input
                  name="target"
                  value={searchParams.target}
                  onChange={handleInputChange}
                  placeholder="e.g., M31"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RA (degrees)</label>
                <Input
                  name="ra"
                  value={searchParams.ra}
                  onChange={handleInputChange}
                  placeholder="e.g., 254.28746"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dec (degrees)</label>
                <Input
                  name="dec"
                  value={searchParams.dec}
                  onChange={handleInputChange}
                  placeholder="e.g., -4.09933"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Radius (degrees)</label>
                <Input
                  name="radius"
                  value={searchParams.radius}
                  onChange={handleInputChange}
                  placeholder="e.g., 0.2"
                />
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="suggested">
          <SuggestedSearches onSelect={handleObjectSelect} />
        </TabsContent>
      </Tabs>

      {results.length > 0 && (
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableCaption>Search Results</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>RA</TableHead>
                <TableHead>Dec</TableHead>
                <TableHead>Instrument</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Observation Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.obs_id}>
                  <TableCell>{result.target_name || 'N/A'}</TableCell>
                  <TableCell>{result.s_ra.toFixed(5)}</TableCell>
                  <TableCell>{result.s_dec.toFixed(5)}</TableCell>
                  <TableCell>{result.instrument_name}</TableCell>
                  <TableCell>{result.dataproduct_type}</TableCell>
                  <TableCell>{new Date(result.t_min).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {result.dataURL && (
                        <a
                          href={result.dataURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Download
                        </a>
                      )}
                      {result.preview_url && (
                        <a
                          href={result.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Preview
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
