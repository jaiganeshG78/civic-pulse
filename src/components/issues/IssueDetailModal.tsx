import { Issue, getCategoryDisplayName, getStatusDisplayName, getPriorityLevel } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Map,
  CheckCircle2,
  X,
  ImageIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface IssueDetailModalProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Calculate progress percentage based on status
function getProgressPercentage(status: string): number {
  const statusProgress: Record<string, number> = {
    pending: 10,
    open: 25,
    assigned: 50,
    assigned_auto: 50,
    in_progress: 60,
    resolved: 75,
    resolved_pending_verification: 75,
    verified: 100,
    closed: 100,
    rejected: 100,
    fake: 0,
  };
  return statusProgress[status] ?? 25;
}

// Get stage label
function getStageLabel(status: string): string {
  const stages: Record<string, string> = {
    pending: 'Report Submitted',
    open: 'Open',
    assigned: 'Assigned to Department',
    assigned_auto: 'Auto-Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolution Submitted',
    resolved_pending_verification: 'Pending Verification',
    verified: 'Verified & Closed',
    closed: 'Closed',
    rejected: 'Rejected',
    fake: 'Marked as Fake',
  };
  return stages[status] ?? 'Processing';
}

export function IssueDetailModal({ issue, open, onOpenChange }: IssueDetailModalProps) {
  const navigate = useNavigate();

  if (!issue) return null;

  const priorityLevel = getPriorityLevel(issue.priority_score);
  const progressPercentage = getProgressPercentage(issue.status);

  const priorityClasses: Record<string, string> = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical',
  };

  const categoryClasses: Record<string, string> = {
    garbage_overflow: 'category-garbage',
    pothole: 'category-pothole',
    water_stagnation: 'category-water',
    street_light_failure: 'category-streetlight',
    hospital_infrastructure: 'category-hospital',
    other: 'category-other',
  };

  const handleViewOnMap = () => {
    onOpenChange(false);
    navigate(`/map?issueId=${issue.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        {/* Issue Image - Full width at top */}
        <div className="relative w-full">
          {issue.image_url ? (
            <img
              src={issue.image_url}
              alt="Issue"
              className="h-56 w-full object-cover sm:h-72"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-muted sm:h-72">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Priority badge overlay */}
          <div className="absolute left-4 top-4">
            <Badge className={cn('text-sm', priorityClasses[priorityLevel])}>
              Priority: {issue.priority_score.toFixed(0)}
            </Badge>
          </div>

          {/* Close button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Bar Section */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Resolution Progress</span>
              <span className="text-sm font-medium text-primary">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="mt-2 text-sm font-medium text-foreground">
              {getStageLabel(issue.status)}
            </p>
          </div>

          {/* Badges Row */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={cn('status-badge', categoryClasses[issue.category])}>
              {getCategoryDisplayName(issue.category)}
            </span>
            <Badge variant="outline">{getStatusDisplayName(issue.status)}</Badge>
          </div>

          {/* AI Summary */}
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl">{issue.summary}</DialogTitle>
          </DialogHeader>

          {/* Full Description */}
          {issue.description && (
            <div className="mb-4">
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm text-foreground">{issue.description}</p>
            </div>
          )}

          {/* Location - Human Readable Only */}
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <h4 className="text-sm font-medium text-foreground">Location</h4>
              <p className="text-sm text-muted-foreground">{issue.place}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Priority Score: {issue.priority_score.toFixed(0)}</span>
            </div>
          </div>

          {/* Resolution Proof (if resolved) */}
          {issue.resolution?.proof_image_url && (
            <div className="mb-6 rounded-lg border border-status-verified/30 bg-status-verified/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-status-verified" />
                <h4 className="font-medium text-status-verified">Resolution Proof</h4>
              </div>
              <img
                src={issue.resolution.proof_image_url}
                alt="Resolution proof"
                className="h-40 w-full rounded-lg object-cover"
              />
              {issue.resolution.notes && (
                <p className="mt-2 text-sm text-muted-foreground">{issue.resolution.notes}</p>
              )}
              {issue.resolution.resolved_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Resolved {formatDistanceToNow(new Date(issue.resolution.resolved_at), { addSuffix: true })}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button onClick={handleViewOnMap} className="w-full" size="lg">
            <Map className="mr-2 h-5 w-5" />
            View on Map
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
