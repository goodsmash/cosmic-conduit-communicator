import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  BookOpen,
  Database,
  Search,
  FileText,
  Rocket,
  Star,
  Galaxy,
  Radio,
  Telescope,
  Menu
} from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface GalaxySimulationLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Chapters', path: '/chapters', icon: BookOpen },
  { name: 'Galaxy Library', path: '/library', icon: Database },
  { name: 'Discover', path: '/discover', icon: Search },
  { name: 'Research Journal', path: '/research', icon: FileText },
  { name: 'Search Data', path: '/search', icon: Telescope },
  {
    name: 'Simulations',
    icon: Rocket,
    children: [
      { name: 'Simulation Explorer', path: '/simulations', icon: Star },
      { name: 'Orbital Mechanics', path: '/simulations/orbital', icon: Star },
      { name: 'Stellar Evolution', path: '/simulations/stellar', icon: Star },
      { name: 'Galaxy Formation', path: '/simulations/formation', icon: Galaxy },
      { name: 'Active Galactic Nuclei', path: '/simulations/agn', icon: Star },
      { name: 'Galaxy Mergers', path: '/simulations/mergers', icon: Galaxy },
      { name: 'Peculiar Galaxies', path: '/simulations/peculiar', icon: Galaxy },
      { name: 'Ultra-Diffuse Galaxies', path: '/simulations/diffuse', icon: Galaxy },
      { name: 'Radio Galaxies', path: '/simulations/radio', icon: Radio }
    ]
  }
]

export function GalaxySimulationLayout({ children }: GalaxySimulationLayoutProps) {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out md:translate-x-0',
          {
            'translate-x-0': isMenuOpen,
            '-translate-x-full': !isMenuOpen
          }
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <h2 className="text-2xl font-bold">Main Navigation</h2>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-2">
                      <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </div>
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              'flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                              location.pathname === child.path && 'bg-accent text-accent-foreground'
                            )}
                          >
                            <child.icon className="mr-2 h-4 w-4" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                        location.pathname === item.path && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:pl-64">
        <main className="min-h-screen p-8">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
}
