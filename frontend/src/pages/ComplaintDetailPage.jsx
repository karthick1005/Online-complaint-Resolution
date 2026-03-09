import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  Paperclip,
  Clock,
  User,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Star,
  Download,
  AlertTriangle,
  File,
  Image,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { complaintAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { FeedbackForm } from "@/components/FeedbackForm";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { InternalNotes } from "@/components/InternalNotes";

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Status update states
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [statusFiles, setStatusFiles] = useState([]);
  const [statusFilePreview, setStatusFilePreview] = useState({});

  // Feedback states
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  // Attachments states
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({});
  const [timelineFilePreviews, setTimelineFilePreviews] = useState({});

  // Comments states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  // Escalation states
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [escalationError, setEscalationError] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);

  // Reopen states
  const [reopenLoading, setReopenLoading] = useState(false);
  const [reopenError, setReopenError] = useState("");
  const [reopenSuccess, setReopenSuccess] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [showReopenDialog, setShowReopenDialog] = useState(false);
 const fetchComplaint = async () => {
      try {
        setLoading(true);
        const response = await complaintAPI.getComplaintById(id);
        setComplaint(response.data);
      } catch (error) {
        console.error("Failed to fetch complaint:", error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
   
    fetchComplaint();
  }, [id]);

  // Load timeline file previews
  useEffect(() => {
    const loadTimelineFilePreviews = async () => {
      if (!complaint?.history) return;

      const previews = {};
      
      // Collect all image files that need fetching
      const imageFiles = [];
      for (const entry of complaint.history) {
        if (entry.files && entry.files.length > 0) {
          for (const file of entry.files) {
            if (file.fileType?.startsWith("image/")) {
              imageFiles.push(file);
            }
          }
        }
      }
      
      // Fetch all images in parallel
      if (imageFiles.length > 0) {
        const downloadPromises = imageFiles.map(file =>
          complaintAPI.downloadStatusFile(file.id)
            .then(fileResponse => {
              const blob = fileResponse.data || fileResponse;
              if (blob && blob instanceof Blob) {
                const url = URL.createObjectURL(blob);
                previews[file.id] = url;
              } else {
                console.warn("Invalid blob for file:", file.id);
              }
            })
            .catch(err => console.error("Failed to load timeline preview:", err))
        );
        
        await Promise.all(downloadPromises);
      }
      
      setTimelineFilePreviews(previews);
    };

    loadTimelineFilePreviews();
  }, [complaint?.history]);

  // Fetch staff for assignment dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setStaffLoading(true);
        console.log("Fetching staff for department:", complaint.departmentId);
        const response = await complaintAPI.getStaff({ departmentId: complaint?.departmentId || "" });
        setStaffList(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
  }, [complaint]);

  // Fetch attachments
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setAttachmentsLoading(true);
        const response = await complaintAPI.getAttachments(id);
        const attachmentsData = response.data?.data || [];
        console.log("Fetched attachments:", attachmentsData);
        setAttachments(attachmentsData);

        // Generate previews for images - fetch in parallel
        const imageAttachments = attachmentsData.filter(a => 
          a.fileType?.startsWith("image/")
        );
        
        const previews = {};
        if (imageAttachments.length > 0) {
          const previewPromises = imageAttachments.map(attachment =>
            complaintAPI.downloadAttachment(attachment.id)
              .then(fileResponse => {
                const url = URL.createObjectURL(fileResponse.data);
                previews[attachment.id] = url;
              })
              .catch(err => {
                console.error("Failed to generate preview for", attachment.id);
              })
          );
          
          await Promise.all(previewPromises);
        }
        
        setImagePreviews(previews);
      } catch (error) {
        console.error("Failed to fetch attachments:", error);
      } finally {
        setAttachmentsLoading(false);
      }
    };
    fetchAttachments();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await complaintAPI.getComments(id);
        setComments(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  const handleAssignComplaint = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      setAssignmentError("Please select a staff member");
      return;
    }

    try {
      setAssignmentLoading(true);
      setAssignmentError("");
      await complaintAPI.assignComplaint(id, selectedStaff);
      setAssignmentSuccess(true);
      setSelectedStaff("");
      // Refresh complaint to show updated assignment
      const response = await complaintAPI.getComplaintById(id);
      setComplaint(response.data);
      setTimeout(() => setAssignmentSuccess(false), 3000);
    } catch (error) {
      setAssignmentError(
        error.response?.data?.error || "Failed to assign complaint",
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      setStatusError("Please select a status");
      return;
    }

    try {
      setStatusLoading(true);
      setStatusError("");
      await complaintAPI.updateStatus(id, selectedStatus, statusComment, statusFiles);
      setStatusSuccess(true);
      setSelectedStatus("");
      setStatusComment("");
      setStatusFiles([]);
      setStatusFilePreview({});
      // Refresh complaint
      const response = await complaintAPI.getComplaintById(id);
      setComplaint(response.data);
      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (error) {
      setStatusError(error.response?.data?.error || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStatusFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    handleStatusFileChange(files);
  };

  const handleStatusFileChange = (files) => {
    const newFiles = [...statusFiles, ...files];
    if (newFiles.length > 5) {
      setStatusError("Maximum 5 files allowed");
      return;
    }

    setStatusFiles(newFiles);

    // Generate previews for images
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setStatusFilePreview(prev => ({
            ...prev,
            [file.name]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeStatusFile = (index) => {
    const fileName = statusFiles[index].name;
    setStatusFiles(statusFiles.filter((_, i) => i !== index));
    setStatusFilePreview(prev => {
      const newPreview = { ...prev };
      delete newPreview[fileName];
      return newPreview;
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!rating) {
      setFeedbackError("Please select a rating");
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackError("");
      await complaintAPI.addFeedback(id, rating, feedbackComment);
      fetchComplaint(); // Refresh complaint to show feedback
      setFeedbackSuccess(true);
      setRating(0);
      setFeedbackComment("");
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (error) {
      setFeedbackError(
        error.response?.data?.error || "Failed to submit feedback",
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleReopenComplaint = async () => {
    try {
      setReopenLoading(true);
      setReopenError("");
      await complaintAPI.reopenComplaint(id, reopenReason);
      setReopenSuccess(true);
      setReopenReason("");
      setShowReopenDialog(false);
      // Reload complaint data
      const response = await complaintAPI.getComplaintById(id);
      setComplaint(response.data);
      setTimeout(() => setReopenSuccess(false), 3000);
    } catch (error) {
      setReopenError(
        error.response?.data?.error || "Failed to reopen complaint",
      );
    } finally {
      setReopenLoading(false);
    }
  };

  const getValidStatusTransitions = () => {
    const transitions = {
      Registered: ["Assigned", "Escalated"],
      Assigned: ["InProgress", "Escalated"],
      InProgress: ["Resolved", "Escalated"],
      Resolved: ["Closed"],
      Closed: [],
      Escalated: ["Assigned", "InProgress"],
    };
    return transitions[complaint?.status] || [];
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    try {
      setAddingComment(true);
      setCommentError("");
      await complaintAPI.addComment(id, newComment);
      setCommentSuccess(true);
      setNewComment("");
      // Refresh comments
      const response = await complaintAPI.getComments(id);
      setComments(response.data?.data || []);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (error) {
      setCommentError(error.response?.data?.error || "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleEscalation = async () => {
    if (!escalationReason.trim()) {
      setEscalationError("Please provide a reason for escalation");
      return;
    }

    try {
      setEscalationLoading(true);
      setEscalationError("");
      await complaintAPI.escalateComplaint(id, escalationReason);
      setShowEscalationDialog(false);
      setEscalationReason("");
      // Refresh complaint
      const response = await complaintAPI.getComplaintById(id);
      setComplaint(response.data);
    } catch (error) {
      setEscalationError(
        error.response?.data?.error || "Failed to escalate complaint",
      );
    } finally {
      setEscalationLoading(false);
    }
  };

  const downloadAttachment = async (attachmentId, fileName) => {
    try {
      const response = await complaintAPI.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "attachment");
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      console.error("Failed to download attachment:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!complaint) {
    return (
      <div className="text-center py-12 text-destructive">
        Complaint not found
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Registered: "registered",
      Assigned: "assigned",
      InProgress: "inprogress",
      Resolved: "resolved",
      Closed: "closed",
      Escalated: "escalated",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "critical",
      High: "high",
      Medium: "medium",
      Low: "low",
    };
    return colors[priority] || "default";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{complaint.title}</h1>
          <p className="text-muted-foreground mt-1">
            {complaint.complaintCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={getStatusColor(complaint.status)}>
            {complaint.status}
          </Badge>
          <Badge variant={getPriorityColor(complaint.priority)}>
            {complaint.priority}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Details & Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="mt-2 text-foreground">{complaint.description}</p>
            </div>

            {complaint.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <p className="mt-2 text-foreground">{complaint.address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Category
                </label>
                <p className="mt-1 text-foreground">
                  {complaint.category?.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <p className="mt-1 text-foreground">
                  {complaint.department?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Info - Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.history?.map((entry, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    {idx < complaint.history.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4 w-full">
                    <p className="font-medium text-sm">{entry.status}</p>
                    {entry.comment && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.comment}
                      </p>
                    )}
                    
                    {/* Display files if present */}
                    {entry.files && entry.files.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {/* Display Images */}
                        {entry.files.some((f) => f.fileType?.startsWith("image/")) && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Images:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {entry.files.map((file, fileIdx) => {
                                if (!file.fileType?.startsWith("image/")) return null;
                                const imageUrl = timelineFilePreviews[file.id];
                                return (
                                  <div
                                    key={fileIdx}
                                    className="relative group rounded overflow-hidden border border-border bg-muted hover:shadow-md transition-all cursor-pointer"
                                    onClick={() =>
                                      setSelectedImage({
                                        id: file.id,
                                        name: file.fileName,
                                        url: imageUrl,
                                      })
                                    }
                                  >
                                    {imageUrl ? (
                                      <>
                                        <img
                                          src={imageUrl}
                                          alt={file.fileName}
                                          className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <p className="text-white text-xs font-medium">View</p>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-32 flex items-center justify-center bg-muted">
                                        <Image className="w-6 h-6 text-muted-foreground animate-pulse" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Display PDFs and other files */}
                        {entry.files.some((f) => !f.fileType?.startsWith("image/")) && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Documents:
                            </p>
                            <div className="space-y-1">
                              {entry.files.map((file, fileIdx) => {
                                if (file.fileType?.startsWith("image/")) return null;
                                return (
                                  <div
                                    key={fileIdx}
                                    className="flex items-center gap-2 text-xs p-2 bg-muted rounded"
                                  >
                                    <File className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span className="truncate">{file.fileName}</span>
                                    <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                                      {(file.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-4">
                <div>
                  <label className="text-muted-foreground">Created By</label>
                  <p className="font-medium">{complaint.user?.name}</p>
                </div>
                {complaint.assignedTo && (
                  <div>
                    <label className="text-muted-foreground">Assigned To</label>
                    <p className="font-medium">{complaint.assignedTo.name}</p>
                  </div>
                )}
                {!complaint.assignedTo && (
                  <div>
                    <label className="text-muted-foreground">Assigned To</label>
                    <p className="font-medium text-destructive">Unassigned</p>
                  </div>
                )}
                <div>
                  <label className="text-muted-foreground">Created Date</label>
                  <p className="font-medium">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Assignment Form */}
              {(currentUser?.role === "department_manager" ||
                currentUser?.role === "admin") &&
                (complaint.status === "Registered" ||
                  complaint.status === "Assigned") && !complaint.assignedTo && (
                  <div className="pt-4 border-t">
                    <form
                      onSubmit={handleAssignComplaint}
                      className="space-y-3"
                    >
                      <label className="text-sm font-medium">
                        Assign to Staff
                      </label>

                      {assignmentError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {assignmentError}
                        </div>
                      )}

                      {assignmentSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          Assigned successfully
                        </div>
                      )}

                      <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        disabled={staffLoading || assignmentLoading}
                        className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 text-sm"
                      >
                        <option value="">
                          {staffLoading
                            ? "Loading..."
                            : "Select staff member"}
                        </option>
                        {staffList.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          !selectedStaff || staffLoading || assignmentLoading
                        }
                        size="sm"
                      >
                        {assignmentLoading ? "Assigning..." : "Assign"}
                      </Button>
                    </form>
                  </div>
                )}

              {/* Status Resolved Message */}
              {complaint.status === "Resolved" && (currentUser?.role === "staff" || currentUser?.role === "department_manager" || currentUser?.role === "admin") && (
                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Complaint Resolved</p>
                      <p className="text-xs mt-1">Awaiting feedback from the complainant. Once they provide feedback, you can reopen if needed.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Form */}
              {(currentUser?.role === "staff" ||
                currentUser?.role === "department_manager" ||
                currentUser?.role === "admin") &&
                getValidStatusTransitions().length > 0 && complaint.assignedTo &&
                complaint.status !== "Resolved" && (
                  <div className="pt-4 border-t">
                    <form onSubmit={handleStatusUpdate} className="space-y-3">
                      <label className="text-sm font-medium">
                        Update Status
                      </label>

                      {statusError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {statusError}
                        </div>
                      )}

                      {statusSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          Status updated
                        </div>
                      )}

                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={statusLoading}
                        className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 text-sm"
                      >
                        <option value="">Select new status</option>
                        {getValidStatusTransitions().map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <textarea
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        placeholder="Add a comment..."
                        disabled={statusLoading}
                        className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 text-sm"
                        rows="2"
                      />

                      {/* File Upload Section */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Attach Evidence (Optional)
                        </label>
                        <div
                          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStatusFileChange(Array.from(e.dataTransfer.files));
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            onChange={handleStatusFileSelect}
                            disabled={statusLoading}
                            className="hidden"
                            id="status-file-input"
                            accept="image/*,.pdf"
                          />
                          <label
                            htmlFor="status-file-input"
                            className="cursor-pointer text-sm text-muted-foreground"
                          >
                            Drag files here or click to select (Max 5 files)
                          </label>
                        </div>

                        {/* File Previews */}
                        {statusFiles.length > 0 && (
                          <div className="space-y-2">
                            {statusFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-muted rounded-lg"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {file.type.startsWith('image/') ? (
                                    <Image className="w-4 h-4 flex-shrink-0 text-blue-600" />
                                  ) : (
                                    <File className="w-4 h-4 flex-shrink-0 text-red-600" />
                                  )}
                                  <span className="text-xs truncate">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeStatusFile(index)}
                                  className="ml-2 p-1 hover:bg-destructive/20 rounded text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!selectedStatus || statusLoading}
                        size="sm"
                      >
                        {statusLoading ? "Updating..." : "Update"}
                      </Button>
                    </form>
                  </div>
                )}

              {/* Feedback Section */}
              {currentUser?.role === "complainant" &&
                complaint.status === "Resolved" && (
                  <div className="pt-4 border-t">
                    <form onSubmit={handleSubmitFeedback} className="space-y-3">
                      <label className="text-sm font-medium">
                        Rate Experience
                      </label>

                      {feedbackError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {feedbackError}
                        </div>
                      )}

                      {feedbackSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          Thank you!
                        </div>
                      )}

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            disabled={feedbackLoading}
                            className="focus:outline-none transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (hoveredRating || rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Feedback (optional)"
                        disabled={feedbackLoading}
                        className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 text-sm"
                        rows="2"
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!rating || feedbackLoading}
                        size="sm"
                      >
                        {feedbackLoading ? "Submitting..." : "Submit"}
                      </Button>
                    </form>

                    {/* Reopen Option */}
                    {feedbackSuccess && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <p className="text-sm text-muted-foreground">
                          If the issue wasn't properly resolved, you can reopen the complaint for further action.
                        </p>
                        <Button
                          onClick={() => setShowReopenDialog(true)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          Reopen Complaint
                        </Button>
                      </div>
                    )}
                  </div>
                )}

              {/* Reopen Dialog */}
              {showReopenDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>Reopen Complaint</CardTitle>
                      <CardDescription>
                        Tell us why the issue needs to be reopened
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {reopenError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {reopenError}
                        </div>
                      )}

                      <textarea
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        placeholder="Please describe why this complaint needs to be reopened..."
                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                        rows="3"
                        disabled={reopenLoading}
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowReopenDialog(false)}
                          variant="outline"
                          disabled={reopenLoading}
                          className="flex-1"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleReopenComplaint}
                          disabled={!reopenReason.trim() || reopenLoading}
                          className="flex-1"
                          size="sm"
                        >
                          {reopenLoading ? "Reopening..." : "Reopen"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Reopen Success Message */}
              {reopenSuccess && (
                <div className="fixed top-4 right-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Complaint reopened successfully! Staff will be notified.
                </div>
              )}

              {/* Escalation */}
              {(currentUser?.role === "department_manager" ||
                currentUser?.role === "admin") &&
                complaint.status !== "Escalated" &&
                complaint.status !== "Closed" && (
                  <div className="pt-4 border-t">
                    {!showEscalationDialog ? (
                      <Button
                        onClick={() => setShowEscalationDialog(true)}
                        variant="destructive"
                        className="w-full"
                        size="sm"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">
                          Reason
                        </label>

                        {escalationError && (
                          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {escalationError}
                          </div>
                        )}

                        <textarea
                          value={escalationReason}
                          onChange={(e) => setEscalationReason(e.target.value)}
                          placeholder="Escalation reason..."
                          disabled={escalationLoading}
                          className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 text-sm"
                          rows="2"
                        />

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowEscalationDialog(false)}
                            variant="outline"
                            className="flex-1"
                            disabled={escalationLoading}
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleEscalation}
                            variant="destructive"
                            className="flex-1"
                            disabled={
                              !escalationReason.trim() || escalationLoading
                            }
                            size="sm"
                          >
                            Escalate
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attachments Section - Full Width */}
      {attachments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Attachments ({attachments?.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attachmentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading attachments...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Image Gallery */}
                {attachments.some((a) => a.fileType?.startsWith("image/")) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {attachments.map((attachment) => {
                        const fileName = attachment.filePath.split("/").pop();
                        if (!attachment.fileType?.startsWith("image/"))
                          return null;
                        return (
                          <div
                            key={attachment.id}
                            className="relative group rounded-lg overflow-hidden border border-border bg-muted hover:shadow-lg transition-all"
                          >
                            <div className="relative">
                              {imagePreviews[attachment.id] ? (
                                <img
                                  src={imagePreviews[attachment.id]}
                                  alt={fileName}
                                  className="w-full h-64 object-contain bg-background"
                                />
                              ) : (
                                <div className="w-full h-64 flex items-center justify-center bg-muted">
                                  <Image className="w-10 h-10 text-muted-foreground animate-pulse" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-background border-t border-border space-y-2">
                              <p className="text-sm font-medium truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {attachment.fileSize
                                  ? (attachment.fileSize / 1024).toFixed(2)
                                  : "N/A"}{" "}
                                KB
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    downloadAttachment(
                                      attachment.id,
                                      fileName,
                                    )
                                  }
                                  className="flex-1"
                                  size="sm"
                                  variant="outline"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                                <Button
                                  onClick={() =>
                                    setSelectedImage({
                                      id: attachment.id,
                                      name: fileName,
                                      url: imagePreviews[attachment.id],
                                    })
                                  }
                                  className="flex-1"
                                  size="sm"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PDFs */}
                {attachments.some(
                  (a) => a.fileType === "application/pdf",
                ) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Documents
                    </h3>
                    <div className="space-y-2">
                      {attachments.map((attachment) => {
                        const fileName = attachment.filePath.split("/").pop();
                        const fileSize = attachment.fileSize
                          ? (attachment.fileSize / 1024).toFixed(2)
                          : "N/A";

                        if (attachment.fileType !== "application/pdf")
                          return null;

                        return (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <File className="w-5 h-5 text-red-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {fileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {fileSize} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                downloadAttachment(attachment.id, fileName)
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments Section - Full Width */}
      {(currentUser?.role === "staff" ||
        currentUser?.role === "department_manager" ||
        currentUser?.role === "admin") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Internal Comments
            </CardTitle>
            <CardDescription>
              Staff notes and internal discussion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddComment} className="space-y-3 pb-4 border-b">
              {commentError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {commentError}
                </div>
              )}

              {commentSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Comment added
                </div>
              )}

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add an internal comment..."
                disabled={addingComment}
                className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 text-sm"
                rows="3"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!newComment.trim() || addingComment}
              >
                {addingComment ? "Adding..." : "Add Comment"}
              </Button>
            </form>

            {commentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {comment.updatedByUser?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {comment.updatedByUser?.email}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                    {comment.updatedByUser?.role && (
                      <Badge variant="outline" className="text-xs">
                        {comment.updatedByUser.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No comments yet
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attachment Upload Section */}
      {(currentUser?.role === 'complainant') && (
        <AttachmentUpload
          onFilesSelected={(files) => {
            // Handle file selection
            console.log('Files selected:', files);
            addToast('Files ready to upload', 'success');
          }}
          maxFiles={5}
          maxSize={10485760}
        />
      )}

      {/* Internal Notes Section */}
      {/* {(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'staff') && (
        <InternalNotes
          complaintId={complaint.id}
          notes={complaint.internalNotes || []}
          onAddNote={(noteData) => {
            console.log('Adding note:', noteData);
            addToast('Internal note added', 'success');
          }}
          loading={false}
          isVisible={true}
        />
      )} */}

      {/* Feedback Section */}
      {/* {complaint.status === 'Resolved' || complaint.status === 'Closed' && currentUser?.role === 'complainant' ? (
        <FeedbackForm
          complaintId={complaint.id}
          onSubmit={(feedbackData) => {
            console.log('Submitting feedback:', feedbackData);
            addToast('Thank you for your feedback!', 'success');
          }}
          loading={feedbackLoading}
        />
      ) : null} */}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-foreground truncate">
                {selectedImage.name}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center">
              {selectedImage.url && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
              <Button
                onClick={() =>
                  downloadAttachment(selectedImage.id, selectedImage.name)
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
