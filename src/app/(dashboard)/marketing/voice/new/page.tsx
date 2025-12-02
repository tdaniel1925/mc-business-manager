"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input, Label, Textarea, Select } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewVoiceCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    script: "",
    targetList: "",
    scheduledFor: "",
    maxCallsPerDay: "100",
    status: "DRAFT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/marketing/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxCallsPerDay: parseInt(formData.maxCallsPerDay),
          scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : null,
        }),
      });

      if (res.ok) {
        const campaign = await res.json();
        router.push(`/marketing/voice/${campaign.id}`);
      } else {
        alert("Failed to create voice campaign");
      }
    } catch (error) {
      console.error("Error creating voice campaign:", error);
      alert("Error creating voice campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Voice Campaign"
        subtitle="Create a new outbound calling campaign"
        action={
          <Link href="/marketing/voice">
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
                  placeholder="Q4 Outreach Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Campaign objectives and goals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="script">Call Script *</Label>
                <Textarea
                  id="script"
                  placeholder="Hi [Name], this is [Your Name] from [Company]..."
                  value={formData.script}
                  onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                  rows={8}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use [Name], [Company], and other merge tags for personalization
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="targetList">Target List</Label>
                  <Input
                    id="targetList"
                    placeholder="Lead segment or list name"
                    value={formData.targetList}
                    onChange={(e) => setFormData({ ...formData, targetList: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="maxCallsPerDay">Max Calls Per Day</Label>
                  <Input
                    id="maxCallsPerDay"
                    type="number"
                    placeholder="100"
                    value={formData.maxCallsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxCallsPerDay: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledFor">Schedule Start Date</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
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
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/marketing/voice">
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
