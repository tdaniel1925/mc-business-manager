"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Modal,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { DealStage } from "@prisma/client";
import { MoreVertical, Edit, Trash2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

interface DealActionsProps {
  deal: {
    id: string;
    stage: DealStage;
    requestedAmount: unknown;
    approvedAmount: unknown;
    factorRate: unknown;
    termDays: number | null;
  };
}

const stageTransitions: Record<DealStage, DealStage[]> = {
  NEW_LEAD: ["DOCS_REQUESTED", "DECLINED", "DEAD"],
  DOCS_REQUESTED: ["DOCS_RECEIVED", "DECLINED", "DEAD"],
  DOCS_RECEIVED: ["IN_UNDERWRITING", "DOCS_REQUESTED", "DECLINED", "DEAD"],
  IN_UNDERWRITING: ["APPROVED", "DECLINED", "DEAD"],
  APPROVED: ["CONTRACT_SENT", "DECLINED", "DEAD"],
  CONTRACT_SENT: ["CONTRACT_SIGNED", "DECLINED", "DEAD"],
  CONTRACT_SIGNED: ["FUNDED", "DECLINED", "DEAD"],
  FUNDED: [],
  DECLINED: ["NEW_LEAD"],
  DEAD: ["NEW_LEAD"],
};

export function DealActions({ deal }: DealActionsProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newStage, setNewStage] = useState<DealStage>(deal.stage);
  const [approveData, setApproveData] = useState({
    approvedAmount: deal.requestedAmount?.toString() || "",
    factorRate: "1.35",
    termDays: "120",
  });
  const [declineReason, setDeclineReason] = useState("");

  const availableTransitions = stageTransitions[deal.stage];

  async function handleStageChange() {
    setLoading(true);
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      router.refresh();
      setShowStageModal(false);
    } catch (error) {
      console.error("Failed to update stage:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    setLoading(true);
    try {
      const factorRate = parseFloat(approveData.factorRate);
      const approvedAmount = parseFloat(approveData.approvedAmount);
      const termDays = parseInt(approveData.termDays);
      const paybackAmount = approvedAmount * factorRate;
      const dailyPayment = paybackAmount / termDays;

      await fetch(`/api/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "APPROVED",
          approvedAmount,
          factorRate,
          termDays,
          paybackAmount,
          dailyPayment,
          paperGrade: "B",
        }),
      });
      router.refresh();
      setShowApproveModal(false);
    } catch (error) {
      console.error("Failed to approve deal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    setLoading(true);
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "DECLINED",
          declineReasons: declineReason ? [declineReason] : [],
        }),
      });
      router.refresh();
      setShowDeclineModal(false);
    } catch (error) {
      console.error("Failed to decline deal:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
              {availableTransitions.length > 0 && (
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setShowMenu(false);
                    setShowStageModal(true);
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                  Change Stage
                </button>
              )}
              {deal.stage === "IN_UNDERWRITING" && (
                <>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                    onClick={() => {
                      setShowMenu(false);
                      setShowApproveModal(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Deal
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeclineModal(true);
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    Decline Deal
                  </button>
                </>
              )}
              <hr className="my-1" />
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this deal?")) {
                    fetch(`/api/deals/${deal.id}`, { method: "DELETE" }).then(
                      () => router.push("/deals")
                    );
                  }
                  setShowMenu(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Deal
              </button>
            </div>
          </>
        )}
      </div>

      {/* Change Stage Modal */}
      <Modal
        isOpen={showStageModal}
        onClose={() => setShowStageModal(false)}
        title="Change Deal Stage"
      >
        <div className="space-y-4">
          <Select
            label="New Stage"
            options={availableTransitions.map((s) => ({
              value: s,
              label: s.replace(/_/g, " "),
            }))}
            value={newStage}
            onChange={(e) => setNewStage(e.target.value as DealStage)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowStageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStageChange} loading={loading}>
              Update Stage
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Deal"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Approved Amount"
            type="number"
            value={approveData.approvedAmount}
            onChange={(e) =>
              setApproveData({ ...approveData, approvedAmount: e.target.value })
            }
          />
          <Input
            label="Factor Rate"
            type="number"
            step="0.01"
            value={approveData.factorRate}
            onChange={(e) =>
              setApproveData({ ...approveData, factorRate: e.target.value })
            }
          />
          <Input
            label="Term (Days)"
            type="number"
            value={approveData.termDays}
            onChange={(e) =>
              setApproveData({ ...approveData, termDays: e.target.value })
            }
          />
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Calculated Values</p>
            <p className="font-medium">
              Payback:{" "}
              {(
                parseFloat(approveData.approvedAmount || "0") *
                parseFloat(approveData.factorRate || "0")
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
            <p className="font-medium">
              Daily Payment:{" "}
              {(
                (parseFloat(approveData.approvedAmount || "0") *
                  parseFloat(approveData.factorRate || "0")) /
                parseInt(approveData.termDays || "1")
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} loading={loading}>
              Approve Deal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Decline Deal"
      >
        <div className="space-y-4">
          <Textarea
            label="Reason for Decline"
            placeholder="Enter the reason for declining this deal..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeclineModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              loading={loading}
            >
              Decline Deal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
