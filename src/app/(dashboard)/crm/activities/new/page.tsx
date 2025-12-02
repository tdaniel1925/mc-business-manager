"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Activity, Phone, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface ContactData {
  id: string;
  firstName: string;
  lastName: string;
}

const activityTypes = [
  { value: "PHONE_CALL", label: "Phone Call", icon: Phone },
  { value: "PHONE_CALL_INBOUND", label: "Inbound Call", icon: Phone },
  { value: "PHONE_CALL_OUTBOUND", label: "Outbound Call", icon: Phone },
  { value: "EMAIL_SENT", label: "Email Sent", icon: Mail },
  { value: "EMAIL_RECEIVED", label: "Email Received", icon: Mail },
  { value: "MEETING", label: "Meeting", icon: Calendar },
  { value: "MEETING_SCHEDULED", label: "Meeting Scheduled", icon: Calendar },
  { value: "MEETING_COMPLETED", label: "Meeting Completed", icon: Calendar },
  { value: "SMS_SENT", label: "SMS Sent", icon: Phone },
  { value: "SMS_RECEIVED", label: "SMS Received", icon: Phone },
  { value: "NOTE", label: "Note", icon: Activity },
  { value: "SITE_VISIT", label: "Site Visit", icon: Activity },
  { value: "APPLICATION_RECEIVED", label: "Application Received", icon: Activity },
  { value: "DOCUMENT_REQUESTED", label: "Document Requested", icon: Activity },
  { value: "DOCUMENT_RECEIVED", label: "Document Received", icon: Activity },
  { value: "CREDIT_PULLED", label: "Credit Pulled", icon: Activity },
  { value: "OFFER_SENT", label: "Offer Sent", icon: Activity },
  { value: "CONTRACT_SENT", label: "Contract Sent", icon: Activity },
  { value: "CONTRACT_SIGNED", label: "Contract Signed", icon: Activity },
  { value: "FUNDING_COMPLETED", label: "Funding Completed", icon: Activity },
  { value: "COLLECTION_CALL", label: "Collection Call", icon: Phone },
];

const outcomes = [
  { value: "", label: "Select outcome" },
  { value: "SUCCESSFUL", label: "Successful" },
  { value: "LEFT_VOICEMAIL", label: "Left Voicemail" },
  { value: "NO_ANSWER", label: "No Answer" },
  { value: "BUSY", label: "Busy" },
  { value: "WRONG_NUMBER", label: "Wrong Number" },
  { value: "CALLBACK_REQUESTED", label: "Callback Requested" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "FOLLOW_UP_NEEDED", label: "Follow-up Needed" },
];

export default function NewActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get("contactId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);

  const [formData, setFormData] = useState({
    type: "PHONE_CALL",
    subject: "",
    description: "",
    outcome: "",
    duration: "",
    contactId: contactIdParam || "",
    scheduledAt: "",
    completedAt: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/crm/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
          contactId: formData.contactId || null,
          scheduledAt: formData.scheduledAt || null,
          completedAt: formData.completedAt || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to log activity");
      }

      if (contactIdParam) {
        router.push(`/crm/contacts/${contactIdParam}`);
      } else {
        router.push("/crm/activities");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Log Activity"
        subtitle="Record a new CRM activity"
        action={
          <Link href="/crm/activities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Activity Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  required
                >
                  {activityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="contactId">Contact</Label>
                <select
                  id="contactId"
                  name="contactId"
                  value={formData.contactId}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="">Select contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of the activity"
                />
              </div>

              <div>
                <Label htmlFor="description">Details</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any notes or details about this activity..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outcome">Outcome</Label>
                  <select
                    id="outcome"
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  >
                    {outcomes.map((outcome) => (
                      <option key={outcome.value} value={outcome.value}>
                        {outcome.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledAt">Scheduled At</Label>
                  <Input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="completedAt">Completed At</Label>
                  <Input
                    id="completedAt"
                    name="completedAt"
                    type="datetime-local"
                    value={formData.completedAt}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/crm/activities">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Log Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
