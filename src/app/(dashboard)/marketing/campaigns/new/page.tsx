"use client";

import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Select,
} from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const campaignTypes = [
  { value: "VOICE_OUTBOUND", label: "Voice (Outbound)" },
  { value: "VOICE_INBOUND", label: "Voice (Inbound)" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "SOCIAL_ORGANIC", label: "Social (Organic)" },
  { value: "SOCIAL_PAID", label: "Social (Paid)" },
  { value: "CONTENT", label: "Content" },
  { value: "MULTI_CHANNEL", label: "Multi-Channel" },
];

const channels = [
  { value: "AI_VOICE_OUTBOUND", label: "AI Voice (Outbound)" },
  { value: "AI_VOICE_INBOUND", label: "AI Voice (Inbound)" },
  { value: "SMS_CAMPAIGN", label: "SMS" },
  { value: "EMAIL_CAMPAIGN", label: "Email" },
  { value: "SOCIAL_FACEBOOK", label: "Facebook" },
  { value: "SOCIAL_INSTAGRAM", label: "Instagram" },
  { value: "SOCIAL_LINKEDIN", label: "LinkedIn" },
  { value: "SOCIAL_TWITTER", label: "Twitter/X" },
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "FACEBOOK_ADS", label: "Facebook Ads" },
  { value: "LANDING_PAGE", label: "Landing Page" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    channel: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          startDate: formData.startDate || new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const campaign = await response.json();
        router.push(`/marketing/campaigns/${campaign.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Campaign"
        subtitle="Create a new marketing campaign"
        action={
          <Link href="/marketing/campaigns">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Campaign Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Q1 2025 Outbound Campaign"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the campaign objectives and strategy..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Campaign Type *"
                      options={campaignTypes}
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      placeholder="Select type"
                      required
                    />
                  </div>

                  <div>
                    <Select
                      label="Primary Channel *"
                      options={channels}
                      value={formData.channel}
                      onChange={(e) =>
                        setFormData({ ...formData, channel: e.target.value })
                      }
                      placeholder="Select channel"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Budget (USD)
                  </label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/marketing/campaigns">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
