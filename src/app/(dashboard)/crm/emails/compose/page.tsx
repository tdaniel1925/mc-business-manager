"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input, Label, Textarea } from "@/components/ui";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ComposeEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/crm/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/crm/emails");
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Compose Email"
        subtitle="Send a new email message"
        action={
          <Link href="/crm/emails">
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
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  type="email"
                  placeholder="cc@example.com"
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  type="email"
                  placeholder="bcc@example.com"
                  value={formData.bcc}
                  onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  placeholder="Type your message here..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={12}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/crm/emails">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
