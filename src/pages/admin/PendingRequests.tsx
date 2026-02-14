import React, { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Store as StoreIcon,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Copy,
} from "lucide-react";
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  Alert,
  Badge,
  Loading,
} from "../../components/ui";
import {
  subscribeToPendingRequests,
  approveRequest,
  rejectRegistrationRequest,
} from "../../services/adminService";
import type { RegistrationRequest } from "../../config/supabase";
import { formatDateTime } from "../../utils/helpers";
import { APP_CONFIG } from "../../config/config";

const PendingRequests: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<RegistrationRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Real-time subscription
  useEffect(() => {
    const subscription = subscribeToPendingRequests((data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleApprove = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleReject = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  if (loading) {
    return <Loading text="Loading pending requests..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">
            Pending Requests
          </h2>
          <p className="text-text-secondary">
            Review and approve restaurant registrations
          </p>
        </div>
        <Badge variant="warning" className="text-lg px-4 py-2">
          {requests.length} Pending
        </Badge>
      </div>

      {/* Real-time indicator */}
      {requests.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-success">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Live updates enabled</span>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">
            All Caught Up!
          </h3>
          <p className="text-text-secondary">
            No pending registration requests at the moment.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Request Details */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-text mb-1">
                        {request.restaurant_name}
                      </h3>
                      <Badge variant="neutral">{request.restaurant_type}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary flex items-center justify-end">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDateTime(request.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-text-secondary">
                      <StoreIcon className="w-4 h-4" />
                      <span className="font-medium text-text">
                        {request.owner_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-text-secondary">
                      <Phone className="w-4 h-4" />
                      <a
                        href={`tel:${request.phone}`}
                        className="text-accent hover:underline"
                      >
                        {request.phone}
                      </a>
                    </div>
                    {request.email && (
                      <div className="flex items-center space-x-2 text-text-secondary">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${request.email}`}
                          className="text-accent hover:underline truncate"
                        >
                          {request.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {request.city}
                        {request.address && `, ${request.address}`}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info / Payment Proof */}
                  {(request.payment_proof_url || request.notes) && (
                    <div className="bg-bg-subtle rounded-xl p-4 space-y-4">
                      {request.requested_plan && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requested Plan:</span>
                          <Badge variant="success" className="font-black uppercase text-[10px]">
                            {APP_CONFIG.plans[request.requested_plan as keyof typeof APP_CONFIG.plans]?.name || request.requested_plan}
                          </Badge>
                        </div>
                      )}
                      
                      {request.payment_proof_url && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Settlement Proof:</p>
                          <div className="relative group w-48 h-48 rounded-xl overflow-hidden border-2 border-slate-200">
                            <img 
                              src={request.payment_proof_url} 
                              alt="Payment Proof" 
                              className="w-full h-full object-cover cursor-zoom-in"
                              onClick={() => window.open(request.payment_proof_url, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <p className="text-white text-[10px] font-black uppercase tracking-widest">View Full Size</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.notes && (
                        <p className="text-text-secondary text-sm">
                          <strong className="text-text">Internal Notes:</strong>{" "}
                          {request.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 md:min-w-[140px]">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleApprove(request)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<X className="w-4 h-4" />}
                    onClick={() => handleReject(request)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <ApproveModal
        isOpen={showApproveModal}
        request={selectedRequest}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedRequest(null);
        }}
        onSuccess={() => {
          setShowApproveModal(false);
          setSelectedRequest(null);
        }}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        request={selectedRequest}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
};

// Approve Modal Component
interface ApproveModalProps {
  isOpen: boolean;
  request: RegistrationRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  request,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    subscriptionPlan: "starter_pack",
    internalNotes: "",
  });

  useEffect(() => {
    if (request && isOpen) {
      setFormData((prev) => ({
        ...prev,
        subscriptionPlan: (request as any).requested_plan || "starter_pack"
      }));
    }
  }, [request, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!request) return;

    setLoading(true);
    
    const result = await approveRequest(request.id, {
      subscriptionPlan: formData.subscriptionPlan,
      internalNotes: formData.internalNotes,
    });

    setLoading(false);

    if (result.success) {
      alert("Restaurant activated successfully!");
      onSuccess();
    } else {
      setError(result.error || "Failed to process request");
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Restaurant Registration"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error" message={error} />}

        {/* Restaurant Info */}
        <div className="bg-bg-subtle rounded-lg p-4">
          <h4 className="font-semibold text-text mb-2">Restaurant Details</h4>
          <div className="space-y-1 text-sm">
            <p className="text-text">
              <strong>Name:</strong> {request.restaurant_name}
            </p>
            <p className="text-text-secondary">
              <strong>Owner:</strong> {request.owner_name}
            </p>
            <p className="text-text-secondary">
              <strong>Email:</strong> {request.email}
            </p>
          </div>
        </div>

        <Select
          label="Subscription Plan"
          value={formData.subscriptionPlan}
          onChange={(e) =>
            setFormData({ ...formData, subscriptionPlan: e.target.value })
          }
          options={Object.keys(APP_CONFIG.plans).map((key) => ({
            value: key,
            label: APP_CONFIG.plans[key as keyof typeof APP_CONFIG.plans].name,
          }))}
        />

        <Textarea
          label="Internal Notes (Optional)"
          value={formData.internalNotes}
          onChange={(e) =>
            setFormData({ ...formData, internalNotes: e.target.value })
          }
          placeholder="Add any internal notes..."
          rows={3}
        />

        {/* Info */}
        <div className="bg-accent-secondary/10 border border-accent-secondary/20 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 text-accent-secondary inline mr-2" />
          <span className="text-text-secondary">
            Approving this request will grant the restaurant owner access to their dashboard.
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" loading={loading} fullWidth>
            Approve & Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Reject Modal Component
interface RejectModalProps {
  isOpen: boolean;
  request: RegistrationRequest | null;
  onClose: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  request,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (!request) return;

    setLoading(true);
    const success = await rejectRegistrationRequest(request.id, reason);
    setLoading(false);

    if (success) {
      onClose();
      setReason("");
    } else {
      setError("Failed to reject request");
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Registration"
      size="md"
    >
      <div className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <p className="text-text-secondary">
          Are you sure you want to reject the registration for{" "}
          <strong className="text-text">{request.restaurant_name}</strong>?
        </p>

        <Textarea
          label="Reason for Rejection"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="Please provide a reason..."
          required
          rows={3}
        />

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            loading={loading}
            fullWidth
          >
            Reject Registration
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PendingRequests;
