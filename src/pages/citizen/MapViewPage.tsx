import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { IssueMap } from '@/components/map/IssueMap';
import { MapLegend } from '@/components/map/MapLegend';
import { MapFilters } from '@/components/map/MapFilters';
import { Button } from '@/components/ui/button';
import { Filter, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoIssues, filterIssues } from '@/data/demoIssues';
import { IssueFilters, Issue } from '@/types';

export default function MapViewPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<IssueFilters>({});
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filteredIssues = filterIssues(demoIssues, filters);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  return (
    <MainLayout requireAuth allowedRoles={['citizen']}>
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map */}
        <IssueMap
          issues={filteredIssues}
          center={[12.9716, 77.5946]} // Bangalore center
          zoom={12}
          onIssueClick={handleIssueClick}
          className="h-full w-full"
        />

        {/* Floating controls */}
        <div className="absolute left-4 right-4 top-4 z-[1000] flex items-start justify-between gap-4">
          {/* Left side - Legend */}
          <MapLegend className="hidden sm:block" />

          {/* Right side - Actions */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button
                variant={showFilters ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="glass-panel"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
                    {Object.keys(filters).length}
                  </span>
                )}
              </Button>
              <Button variant="secondary" size="sm" asChild className="glass-panel">
                <Link to="/issues">
                  <List className="mr-2 h-4 w-4" />
                  List View
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/report">
                  <Plus className="mr-2 h-4 w-4" />
                  Report
                </Link>
              </Button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <MapFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
                className="w-80 animate-slide-in-right"
              />
            )}
          </div>
        </div>

        {/* Issue count indicator */}
        <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-lg px-4 py-2">
          <p className="text-sm font-medium">
            <span className="text-primary">{filteredIssues.length}</span> issues on map
          </p>
        </div>

        {/* Mobile legend toggle */}
        <div className="absolute bottom-4 right-4 z-[1000] sm:hidden">
          <MapLegend />
        </div>
      </div>
    </MainLayout>
  );
}
