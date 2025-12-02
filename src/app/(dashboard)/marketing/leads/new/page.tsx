"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input, Label, Textarea, Select } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    source: "WEBSITE",
    status: "NEW",
    estimatedValue: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        }),
      });

      if (res.ok) {
        const lead = await res.json();
        router.push(`/marketing/leads/${lead.id}`);
      } else {
        alert("Failed to create lead");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Error creating lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Lead"
        subtitle="Create a new marketing lead"
        action={
          <Link href="/marketing/leads">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="CEO"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="source">Lead Source *</Label>
                  <Select
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="COLD_CALL">Cold Call</option>
                    <option value="EMAIL">Email Campaign</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="TRADE_SHOW">Trade Show</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="UNQUALIFIED">Unqualified</option>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    placeholder="50000"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about this lead..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={6}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/marketing/leads">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
