import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GalaxyTarget } from '@/data/targetCatalog'

interface SearchControlsProps {
  searchQuery: string
  selectedCategory: string
  categories: string[]
  searchResults: GalaxyTarget[]
  nearbyTargets: GalaxyTarget[]
  selectedTarget: GalaxyTarget | null
  isLoading: boolean
  error: string | null
  onSearchChange: (value: string) => void
  onSearch: () => void
  onCategoryChange: (category: string) => void
  onTargetSelect: (target: GalaxyTarget) => void
}

export function SearchControls({
  searchQuery,
  selectedCategory,
  categories,
  searchResults,
  nearbyTargets,
  selectedTarget,
  isLoading,
  error,
  onSearchChange,
  onSearch,
  onCategoryChange,
  onTargetSelect
}: SearchControlsProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Galaxy Search</h2>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search galaxies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
            <Button 
              onClick={onSearch} 
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <Select
            value={selectedCategory}
            onValueChange={onCategoryChange}
            options={categories.map(cat => ({
              label: cat,
              value: cat
            }))}
            placeholder="Select category..."
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Search Results</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {searchResults.map(target => (
                <Button
                  key={target.id}
                  variant={selectedTarget?.id === target.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => onTargetSelect(target)}
                >
                  <div className="truncate">
                    <span className="font-medium">{target.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {target.category}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Nearby Targets */}
      {nearbyTargets.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Nearby Targets</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {nearbyTargets.map(target => (
                <Button
                  key={target.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onTargetSelect(target)}
                >
                  <div className="truncate">
                    <span className="font-medium">{target.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {target.category}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
