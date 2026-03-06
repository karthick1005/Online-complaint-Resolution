import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  FileText,
  AlertTriangle,
  XCircle,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

/**
 * ComplaintTimeline - Visual timeline of complaint history
 * 
 * Displays chronological events in a complaint's lifecycle with:
 * - Status changes
 * - Comments
 * - Attachments
 * - Staff assignments
 * - Timestamps
 * 
 * @param {Object} props
 * @param {Array} props.history - Array of history items
 * @param {boolean} props.showInternalNotes - Whether to show internal notes (staff only)
 */
export default function ComplaintTimeline({ history = [], showInternalNotes = false }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No history available
      </div>
    );
  }

  // Filter out internal notes if user shouldn't see them
  const filteredHistory = showInternalNotes
    ? history
    : history.filter((item) => !item.isInternalNote);

  return (
    <div className="relative space-y-6">
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      {filteredHistory.map((item, index) => (
        <TimelineItem
          key={item.id || index}
          item={item}
          isFirst={index === 0}
          isLast={index === filteredHistory.length - 1}
        />
      ))}
    </div>
  );
}

/**
 * Individual timeline item
 */
function TimelineItem({ item, isFirst, isLast }) {
  const icon = getStatusIcon(item.status);
  const iconColor = getStatusColor(item.status);

  return (
    <div className="relative flex gap-4 group">
      {/* Icon container */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 border-background ${iconColor} flex items-center justify-center z-10 transition-transform group-hover:scale-110`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status}
                </Badge>
                {item.isInternalNote && (
                  <Badge variant="secondary" size="sm">
                    Internal Note
                  </Badge>
                )}
              </div>
              
              {item.updatedBy && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {item.updatedBy.name || item.updatedBy.email}
                  {item.updatedBy.role && (
                    <span className="text-xs">({item.updatedBy.role})</span>
                  )}
                </p>
              )}
            </div>

            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(item.createdAt)}
            </time>
          </div>

          {/* Comment/Description */}
          {item.comment && (
            <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
              {item.comment}
            </p>
          )}

          {/* Attachments */}
          {item.statusUpdateFiles && item.statusUpdateFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Attachments ({item.statusUpdateFiles.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {item.statusUpdateFiles.map((file) => (
                  <AttachmentChip key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/**
 * Attachment chip component
 */
function AttachmentChip({ file }) {
  const isImage = file.fileType?.startsWith('image/');
  const Icon = isImage ? ImageIcon : FileText;

  const handleDownload = async () => {
    try {
      // Assuming API endpoint for file download
      const link = document.createElement('a');
      link.href = `/api/files/${file.id}`;
      link.download = file.fileName || 'attachment';
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm"
    >
      <Icon className="w-4 h-4" />
      <span className="max-w-[150px] truncate">{file.fileName || 'File'}</span>
      <span className="text-xs text-muted-foreground">
        ({formatFileSize(file.fileSize)})
      </span>
      <Download className="w-3 h-3 ml-1" />
    </button>
  );
}

/**
 * Get icon for status
 */
function getStatusIcon(status) {
  const iconMap = {
    Registered: <Clock className="w-5 h-5" />,
    Assigned: <UserCheck className="w-5 h-5" />,
    InProgress: <AlertCircle className="w-5 h-5" />,
    Resolved: <CheckCircle className="w-5 h-5" />,
    Closed: <CheckCircle className="w-5 h-5" />,
    Escalated: <AlertTriangle className="w-5 h-5" />,
    Rejected: <XCircle className="w-5 h-5" />,
  };

  return iconMap[status] || <FileText className="w-5 h-5" />;
}

/**
 * Get color for status
 */
function getStatusColor(status) {
  const colorMap = {
    Registered: 'bg-blue-500',
    Assigned: 'bg-purple-500',
    InProgress: 'bg-yellow-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-gray-500',
    Escalated: 'bg-red-500',
    Rejected: 'bg-red-700',
  };

  return colorMap[status] || 'bg-gray-400';
}

/**
 * Get badge variant for status
 */
function getStatusBadgeVariant(status) {
  const variantMap = {
    Registered: 'default',
    Assigned: 'secondary',
    InProgress: 'warning',
    Resolved: 'success',
    Closed: 'secondary',
    Escalated: 'destructive',
    Rejected: 'destructive',
  };

  return variantMap[status] || 'default';
}

/**
 * Format timestamp
 */
function formatTimestamp(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Relative time for recent events
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Absolute time for older events
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    return dateString;
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
