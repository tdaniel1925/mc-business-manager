"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { ArrowLeft, Building2, Plus } from "lucide-react";
import Link from "next/link";

interface Merchant {
  id: string;
  legalName: string;
  dbaName: string | null;
}

interface Broker {
  id: string;
  companyName: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);

  const [formData, setFormData] = useState({
    merchantId: "",
    requestedAmount: "",
    source: "DIRECT",
    brokerId: "",
  });

  useEffect(() => {
    fetchMerchants();
    fetchBrokers();
  }, []);

  async function fetchMerchants() {
    try {
      const res = await fetch("/api/merchants");
      const data = await res.json();
      setMerchants(data);
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
    }
  }

  async function fetchBrokers() {
    try {
      const res = await fetch("/api/brokers");
      const data = await res.json();
      setBrokers(data);
    } catch (error) {
      console.error("Failed to fetch brokers:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requestedAmount: parseFloat(formData.requestedAmount),
          brokerId: formData.source === "BROKER" ? formData.brokerId : undefined,
        }),
      });

      if (res.ok) {
        const deal = await res.json();
        router.push(`/deals/${deal.id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create deal");
      }
    } catch (error) {
      console.error("Failed to create deal:", error);
      alert("Failed to create deal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Deal"
        subtitle="Create a new funding deal"
        action={
          <Link href="/deals">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Deal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Select
                    label="Merchant"
                    options={merchants.map((m) => ({
                      value: m.id,
                      label: m.dbaName
                        ? `${m.legalName} (DBA: ${m.dbaName})`
                        : m.legalName,
                    }))}
                    value={formData.merchantId}
                    onChange={(e) =>
                      setFormData({ ...formData, merchantId: e.target.value })
                    }
                    placeholder="Select a merchant"
                    required
                  />
                  {merchants.length === 0 && (
                    <div className="mt-2">
                      <Link
                        href="/merchants/new"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Create a new merchant first
                      </Link>
                    </div>
                  )}
                </div>

                <Input
                  label="Requested Amount"
                  type="number"
                  min="1000"
                  step="100"
                  placeholder="50000"
                  value={formData.requestedAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedAmount: e.target.value })
                  }
                  required
                />

                <Select
                  label="Lead Source"
                  options={[
                    { value: "DIRECT", label: "Direct" },
                    { value: "BROKER", label: "Broker/ISO" },
                    { value: "REFERRAL", label: "Referral" },
                    { value: "WEBSITE", label: "Website" },
                    { value: "EMAIL", label: "Email Campaign" },
                  ]}
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                />

                {formData.source === "BROKER" && (
                  <Select
                    label="Broker/ISO"
                    options={brokers.map((b) => ({
                      value: b.id,
                      label: b.companyName,
                    }))}
                    value={formData.brokerId}
                    onChange={(e) =>
                      setFormData({ ...formData, brokerId: e.target.value })
                    }
                    placeholder="Select a broker"
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Create Deal
              </Button>
              <Link href="/deals">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
