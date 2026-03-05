// Complaint status transitions
export const COMPLAINT_STATUSES = {
  REGISTERED: 'Registered',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'InProgress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  ESCALATED: 'Escalated',
}

export const STATUS_TRANSITIONS = {
  [COMPLAINT_STATUSES.REGISTERED]: [
    COMPLAINT_STATUSES.ASSIGNED,
    COMPLAINT_STATUSES.ESCALATED,
  ],
  [COMPLAINT_STATUSES.ASSIGNED]: [
    COMPLAINT_STATUSES.IN_PROGRESS,
    COMPLAINT_STATUSES.ESCALATED,
  ],
  [COMPLAINT_STATUSES.IN_PROGRESS]: [
    COMPLAINT_STATUSES.RESOLVED,
    COMPLAINT_STATUSES.ESCALATED,
  ],
  [COMPLAINT_STATUSES.RESOLVED]: [COMPLAINT_STATUSES.CLOSED],
  [COMPLAINT_STATUSES.CLOSED]: [],
  [COMPLAINT_STATUSES.ESCALATED]: [
    COMPLAINT_STATUSES.IN_PROGRESS,
    COMPLAINT_STATUSES.RESOLVED,
  ],
}

// Complaint priorities
export const COMPLAINT_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

// SLA targets (in hours)
export const SLA_TARGETS = {
  [COMPLAINT_PRIORITIES.LOW]: 72, // 3 days
  [COMPLAINT_PRIORITIES.MEDIUM]: 48, // 2 days
  [COMPLAINT_PRIORITIES.HIGH]: 24, // 1 day
  [COMPLAINT_PRIORITIES.CRITICAL]: 4, // 4 hours
}

// Check if status transition is valid
export const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = STATUS_TRANSITIONS[currentStatus] || []
  return validTransitions.includes(newStatus)
}

// Get allowed statuses for current status
export const getAllowedStatusTransitions = (currentStatus) => {
  return STATUS_TRANSITIONS[currentStatus] || []
}

// Calculate SLA status
export const calculateSLAStatus = (priority, createdAt, resolvedAt = null) => {
  const targetHours = SLA_TARGETS[priority] || 24
  const targetMs = targetHours * 60 * 60 * 1000
  const createdTime = new Date(createdAt).getTime()
  const currentTime = resolvedAt ? new Date(resolvedAt).getTime() : Date.now()
  const elapsedMs = currentTime - createdTime

  if (elapsedMs > targetMs) {
    return 'breached' // Red
  } else if (elapsedMs > targetMs * 0.8) {
    return 'warning' // Yellow - 80% of time used
  }
  return 'on_track' // Green
}

// Format complaint for display
export const formatComplaint = (complaint) => {
  return {
    ...complaint,
    slaStatus: calculateSLAStatus(complaint.priority, complaint.createdAt, complaint.resolvedAt),
    daysOpen: Math.floor(
      (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }
}

// Validate complaint data
export const validateComplaintUpdate = (data) => {
  const errors = {}

  if (data.status && !Object.values(COMPLAINT_STATUSES).includes(data.status)) {
    errors.status = 'Invalid status'
  }

  if (data.priority && !Object.values(COMPLAINT_PRIORITIES).includes(data.priority)) {
    errors.priority = 'Invalid priority'
  }

  if (data.title && data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters'
  }

  if (data.description && data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Get status color/variant for Badge
export const getStatusVariant = (status) => {
  const variants = {
    [COMPLAINT_STATUSES.REGISTERED]: 'registered',
    [COMPLAINT_STATUSES.ASSIGNED]: 'assigned',
    [COMPLAINT_STATUSES.IN_PROGRESS]: 'inprogress',
    [COMPLAINT_STATUSES.RESOLVED]: 'resolved',
    [COMPLAINT_STATUSES.CLOSED]: 'closed',
    [COMPLAINT_STATUSES.ESCALATED]: 'escalated',
  }
  return variants[status] || 'default'
}

// Get priority color/variant for Badge
export const getPriorityVariant = (priority) => {
  const variants = {
    [COMPLAINT_PRIORITIES.LOW]: 'low',
    [COMPLAINT_PRIORITIES.MEDIUM]: 'medium',
    [COMPLAINT_PRIORITIES.HIGH]: 'high',
    [COMPLAINT_PRIORITIES.CRITICAL]: 'critical',
  }
  return variants[priority] || 'default'
}

// Format time estimates
export const formatTimeEstimate = (priority) => {
  const targets = SLA_TARGETS[priority]
  if (!targets) return 'N/A'

  if (targets < 24) {
    return `${targets} hours`
  } else {
    const days = Math.round(targets / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }
}
