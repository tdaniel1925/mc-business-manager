import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Calendar, Eye, ThumbsUp, Share2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await prisma.contentPost.findUnique({
    where: { id },
    include: {
      campaign: {
        select: { id: true, name: true },
      },
    },
  });

  if (!content) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "SCHEDULED":
        return "info";
      case "DRAFT":
        return "default";
      case "ARCHIVED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={content.title || "Content Post"}
        subtitle="Content details and performance"
        action={
          <Link href="/marketing/content">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Content Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Information</CardTitle>
                <Badge variant={getStatusVariant(content.status)}>
                  {content.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.title && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Title</p>
                  <p className="text-lg font-semibold">{content.title}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Content</p>
                <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">{content.content}</p>
                </div>
              </div>

              {content.platforms && content.platforms.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Target Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {content.platforms.map((platform, index) => (
                      <Badge key={index} variant="info">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {content.mediaType && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Media Type</p>
                  <Badge variant="default">{content.mediaType}</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {content.campaign && (
                  <div>
                    <p className="text-sm text-gray-500">Campaign</p>
                    <Link href={`/marketing/campaigns/${content.campaign.id}`} className="font-medium text-blue-600 hover:underline">
                      {content.campaign.name}
                    </Link>
                  </div>
                )}

                {content.publishedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Published At</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDate(content.publishedAt)}</p>
                    </div>
                  </div>
                )}

                {content.scheduledAt && (
                  <div>
                    <p className="text-sm text-gray-500">Scheduled For</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDate(content.scheduledAt)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(content.createdAt)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">AI Generated</p>
                  <Badge variant={content.aiGenerated ? "info" : "default"}>
                    {content.aiGenerated ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{content.impressions}</p>
                    <p className="text-sm text-gray-500">Impressions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{content.engagements}</p>
                    <p className="text-sm text-gray-500">Engagements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{content.shares}</p>
                    <p className="text-sm text-gray-500">Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Eye className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{content.clicks}</p>
                    <p className="text-sm text-gray-500">Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
