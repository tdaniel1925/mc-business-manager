"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input, Label, Textarea, Select } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "BLOG_POST",
    status: "DRAFT",
    content: "",
    excerpt: "",
    tags: "",
    publishDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          publishDate: formData.publishDate ? new Date(formData.publishDate) : null,
        }),
      });

      if (res.ok) {
        const content = await res.json();
        router.push(`/marketing/content/${content.id}`);
      } else {
        alert("Failed to create content");
      }
    } catch (error) {
      console.error("Error creating content:", error);
      alert("Error creating content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Create Content"
        subtitle="Create new marketing content"
        action={
          <Link href="/marketing/content">
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Content title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Content Type *</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    options={[
                      { value: "BLOG_POST", label: "Blog Post" },
                      { value: "CASE_STUDY", label: "Case Study" },
                      { value: "WHITE_PAPER", label: "White Paper" },
                      { value: "EBOOK", label: "eBook" },
                      { value: "VIDEO", label: "Video" },
                      { value: "INFOGRAPHIC", label: "Infographic" },
                      { value: "NEWSLETTER", label: "Newsletter" },
                      { value: "SOCIAL_POST", label: "Social Media Post" },
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
                      { value: "REVIEW", label: "In Review" },
                      { value: "SCHEDULED", label: "Scheduled" },
                      { value: "PUBLISHED", label: "Published" },
                      { value: "ARCHIVED", label: "Archived" },
                    ]}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Short description or summary..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Main content body..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="mca, funding, business (comma-separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/marketing/content">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Content"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
