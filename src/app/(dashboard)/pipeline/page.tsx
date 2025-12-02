"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, GripVertical, Building2 } from "lucide-react";
import Link from "next/link";

type DealStage =
  | "NEW_LEAD"
  | "DOCS_REQUESTED"
  | "DOCS_RECEIVED"
  | "IN_UNDERWRITING"
  | "APPROVED"
  | "CONTRACT_SENT"
  | "CONTRACT_SIGNED"
  | "FUNDED"
  | "DECLINED"
  | "DEAD";

interface Deal {
  id: string;
  requestedAmount: string;
  approvedAmount: string | null;
  stage: DealStage;
  createdAt: string;
  merchant: {
    id: string;
    legalName: string;
    dbaName: string | null;
  };
}

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: "NEW_LEAD", label: "New Leads", color: "bg-gray-500" },
  { id: "DOCS_REQUESTED", label: "Docs Requested", color: "bg-yellow-500" },
  { id: "DOCS_RECEIVED", label: "Docs Received", color: "bg-blue-500" },
  { id: "IN_UNDERWRITING", label: "In Underwriting", color: "bg-purple-500" },
  { id: "APPROVED", label: "Approved", color: "bg-green-500" },
  { id: "CONTRACT_SENT", label: "Contract Sent", color: "bg-cyan-500" },
  { id: "CONTRACT_SIGNED", label: "Contract Signed", color: "bg-indigo-500" },
  { id: "FUNDED", label: "Funded", color: "bg-emerald-500" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [draggedOverStage, setDraggedOverStage] = useState<DealStage | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const res = await fetch("/api/deals");
      const data = await res.json();
      setDeals(data);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateDealStage(dealId: string, newStage: DealStage) {
    try {
      // Optimistically update UI
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId ? { ...deal, stage: newStage } : deal
        )
      );

      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        // Revert on error
        fetchDeals();
      }
    } catch (error) {
      console.error("Failed to update deal:", error);
      // Revert on error
      fetchDeals();
    }
  }

  const getDealsByStage = (stage: DealStage) =>
    deals.filter((deal) => deal.stage === stage);

  const getStageTotal = (stage: DealStage) => {
    const stageDeals = getDealsByStage(stage);
    return stageDeals.reduce(
      (sum, deal) => sum + parseFloat(deal.requestedAmount),
      0
    );
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = "move";
    // Add a subtle opacity to the dragged element
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggedDeal(null);
    setDraggedOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDraggedOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    if (draggedDeal) {
      const deal = deals.find((d) => d.id === draggedDeal);
      if (deal && deal.stage !== newStage) {
        updateDealStage(draggedDeal, newStage);
      }
    }
    setDraggedDeal(null);
    setDraggedOverStage(null);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Pipeline"
        subtitle="Drag and drop deals between stages"
        action={
          <Link href="/deals/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const total = getStageTotal(stage.id);
            const isDropTarget = draggedOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`w-72 flex flex-col rounded-lg transition-all ${
                  isDropTarget
                    ? "bg-blue-50 ring-2 ring-blue-400"
                    : "bg-gray-100"
                }`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-medium text-gray-900">{stage.label}</h3>
                    <Badge variant="default" className="ml-auto">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(total)}
                  </p>
                </div>

                {/* Deals List */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                  {loading ? (
                    <div className="text-center py-4 text-gray-400">
                      Loading...
                    </div>
                  ) : stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      {isDropTarget ? "Drop here" : "No deals in this stage"}
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-move ${
                          draggedDeal === deal.id ? "opacity-50" : ""
                        }`}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <Link
                                    href={`/deals/${deal.id}`}
                                    className="font-medium text-gray-900 truncate text-sm hover:text-blue-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {deal.merchant.legalName}
                                  </Link>
                                </div>
                                {deal.merchant.dbaName && (
                                  <p className="text-xs text-gray-500 truncate mb-2">
                                    DBA: {deal.merchant.dbaName}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(parseFloat(deal.requestedAmount))}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(deal.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
