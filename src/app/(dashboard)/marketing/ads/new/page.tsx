"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input, Label, Textarea, Select } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewAdCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "GOOGLE_ADS",
    type: "SEARCH",
    status: "DRAFT",
    budget: "",
    dailyBudget: "",
    startDate: "",
    endDate: "",
    targetAudience: "",
    keywords: "",
    adCopy: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/marketing/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          dailyBudget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : null,
          startDate: formData.startDate ? new Date(formData.startDate) : null,
          endDate: formData.endDate ? new Date(formData.endDate) : null,
          keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const campaign = await res.json();
        router.push(`/marketing/ads/${campaign.id}`);
      } else {
        alert("Failed to create ad campaign");
      }
    } catch (error) {
      console.error("Error creating ad campaign:", error);
      alert("Error creating ad campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Ad Campaign"
        subtitle="Create a new advertising campaign"
        action={
          <Link href="/marketing/ads">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="Q4 Google Ads Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    options={[
                      { value: "GOOGLE_ADS", label: "Google Ads" },
                      { value: "FACEBOOK", label: "Facebook Ads" },
                      { value: "LINKEDIN", label: "LinkedIn Ads" },
                      { value: "TWITTER", label: "Twitter Ads" },
                      { value: "INSTAGRAM", label: "Instagram Ads" },
                      { value: "YOUTUBE", label: "YouTube Ads" },
                    ]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Ad Type *</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    options={[
                      { value: "SEARCH", label: "Search" },
                      { value: "DISPLAY", label: "Display" },
                      { value: "VIDEO", label: "Video" },
                      { value: "SOCIAL", label: "Social" },
                      { value: "REMARKETING", label: "Remarketing" },
                    ]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: "DRAFT", label: "Draft" },
                      { value: "SCHEDULED", label: "Scheduled" },
                      { value: "ACTIVE", label: "Active" },
                      { value: "PAUSED", label: "Paused" },
                      { value: "COMPLETED", label: "Completed" },
                    ]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Total Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                  <Input
                    id="dailyBudget"
                    type="number"
                    placeholder="100"
                    value={formData.dailyBudget}
                    onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="Small business owners, 25-55, interested in financing"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="merchant cash advance, business funding (comma-separated)"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="adCopy">Ad Copy *</Label>
                  <Textarea
                    id="adCopy"
                    placeholder="Your compelling ad message here..."
                    value={formData.adCopy}
                    onChange={(e) => setFormData({ ...formData, adCopy: e.target.value })}
                    rows={6}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/marketing/ads">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
