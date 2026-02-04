import { Issue, getCategoryDisplayName, getStatusDisplayName, getPriorityLevel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ThumbsUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  onVote?: (issueId: string) => void;
  onViewDetails?: (issue: Issue) => void;
  showVoteButton?: boolean;
  className?: string;
}

export function IssueCard({ 
  issue, 
  onVote, 
  onViewDetails,
  showVoteButton = true, 
  className 
}: IssueCardProps) {
  const priorityLevel = getPriorityLevel(issue.priority_score);
  
  const categoryClasses: Record<string, string> = {
    garbage_overflow: 'category-garbage',
    pothole: 'category-pothole',
    water_stagnation: 'category-water',
    street_light_failure: 'category-streetlight',
    hospital_infrastructure: 'category-hospital',
    other: 'category-other',
  };

  const statusClasses: Record<string, string> = {
    pending: 'status-pending',
    assigned: 'status-assigned',
    in_progress: 'status-in-progress',
    resolved: 'status-resolved',
    verified: 'status-verified',
    rejected: 'status-rejected',
    fake: 'bg-muted text-muted-foreground',
  };

  const priorityClasses: Record<string, string> = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical',
  };

  const handleViewDetails = () => {
    onViewDetails?.(issue);
  };

  return (
    <Card className={cn('issue-card overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          {issue.image_url && (
            <div 
              className="relative w-32 flex-shrink-0 cursor-pointer sm:w-40"
              onClick={handleViewDetails}
            >
              <img
                src={issue.image_url}
                alt="Issue"
                className="h-full w-full object-cover"
              />
              {/* Priority indicator overlay */}
              <div className="absolute left-2 top-2">
                <div className={cn('priority-indicator', priorityClasses[priorityLevel])} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            {/* Top row: badges */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className={cn('status-badge', categoryClasses[issue.category])}>
                {getCategoryDisplayName(issue.category)}
              </span>
              <span className={cn('status-badge', statusClasses[issue.status])}>
                {getStatusDisplayName(issue.status)}
              </span>
            </div>

            {/* Summary */}
            <h3 className="mb-1 line-clamp-1 font-medium text-foreground">
              {issue.summary}
            </h3>

            {/* Description */}
            {issue.description && (
              <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                {issue.description}
              </p>
            )}

            {/* Meta row - Human readable location only */}
            <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{issue.place}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Priority: {issue.priority_score.toFixed(0)}</span>
              </div>
            </div>

            {/* Actions row */}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                {showVoteButton && !issue.is_own_issue && (
                  <Button
                    variant={issue.has_voted ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => onVote?.(issue.id)}
                    disabled={issue.has_voted}
                    className="h-8"
                  >
                    <ThumbsUp className={cn('mr-1.5 h-3.5 w-3.5', issue.has_voted && 'fill-current')} />
                    {issue.vote_count}
                  </Button>
                )}
                {issue.is_own_issue && (
                  <Badge variant="outline" className="text-xs">Your report</Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8"
                onClick={handleViewDetails}
              >
                View Details
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
