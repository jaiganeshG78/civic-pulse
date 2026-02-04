import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { IssueCard } from '@/components/issues/IssueCard';
import { IssueDetailModal } from '@/components/issues/IssueDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoIssues, sortIssuesByPriority, filterIssues } from '@/data/demoIssues';
import { IssueCategory, IssueStatus, Issue } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function IssueFeedPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'recent'>('priority');
  
  // Modal state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVote = (issueId: string) => {
    toast({
      title: 'Vote recorded!',
      description: 'Your vote helps prioritize this issue.',
    });
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const filteredIssues = useMemo(() => {
    let issues = [...demoIssues];

    // Apply filters
    if (statusFilter !== 'all') {
      issues = filterIssues(issues, { status: [statusFilter as IssueStatus] });
    }
    if (categoryFilter !== 'all') {
      issues = filterIssues(issues, { category: [categoryFilter as IssueCategory] });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      issues = issues.filter(
        (issue) =>
          issue.summary.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query) ||
          issue.place.toLowerCase().includes(query)
      );
    }

    // Apply sort
    if (sortBy === 'priority') {
      issues = sortIssuesByPriority(issues);
    } else {
      issues.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return issues;
  }, [statusFilter, categoryFilter, sortBy, searchQuery]);

  return (
    <MainLayout requireAuth allowedRoles={['citizen']}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Issue Feed</h1>
            <p className="mt-1 text-muted-foreground">
              Browse and vote on civic issues in your area
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/map">
                <MapPin className="mr-2 h-4 w-4" />
                Map View
              </Link>
            </Button>
            <Button asChild>
              <Link to="/report">
                <Plus className="mr-2 h-4 w-4" />
                Report Issue
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="garbage_overflow">Garbage Overflow</SelectItem>
              <SelectItem value="pothole">Pothole</SelectItem>
              <SelectItem value="water_stagnation">Water Stagnation</SelectItem>
              <SelectItem value="street_light_failure">Street Light</SelectItem>
              <SelectItem value="hospital_infrastructure">Hospital</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'priority' | 'recent')}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {filteredIssues.length} issues
        </p>

        {/* Issue list */}
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onVote={handleVote}
                onViewDetails={handleViewDetails}
                className="animate-fade-in"
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No issues found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </MainLayout>
  );
}
