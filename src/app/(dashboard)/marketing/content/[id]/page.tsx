import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Calendar, Eye, ThumbsUp, Share2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, email: true },
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
      case "REVIEW":
        return "warning";
      case "DRAFT":
        return "default";
      case "ARCHIVED":
        return "danger";
      default:
        return "default";
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "BLOG_POST":
        return "info";
      case "CASE_STUDY":
        return "success";
      case "WHITE_PAPER":
        return "warning";
      case "VIDEO":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={content.title}
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
                <div className="flex gap-2">
                  <Badge variant={getStatusVariant(content.status)}>
                    {content.status}
                  </Badge>
                  <Badge variant={getTypeVariant(content.type)}>
                    {content.type.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="text-lg font-semibold">{content.title}</p>
              </div>

              {content.excerpt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Excerpt</p>
                  <p className="text-gray-700 italic">{content.excerpt}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Content</p>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-800 whitespace-pre-wrap">{content.content}</p>
                </div>
              </div>

              {content.tags && content.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {content.author && (
                  <div>
                    <p className="text-sm text-gray-500">Author</p>
                    <p className="font-medium">{content.author.name}</p>
                  </div>
                )}

                {content.publishDate && (
                  <div>
                    <p className="text-sm text-gray-500">Publish Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDate(content.publishDate)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(content.createdAt)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(content.updatedAt)}</p>
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
                    <p className="text-2xl font-bold">{content.views || 0}</p>
                    <p className="text-sm text-gray-500">Views</p>
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
                    <p className="text-2xl font-bold">{content.likes || 0}</p>
                    <p className="text-sm text-gray-500">Likes</p>
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
                    <p className="text-2xl font-bold">{content.shares || 0}</p>
                    <p className="text-sm text-gray-500">Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {content.url && (
              <Card>
                <CardHeader>
                  <CardTitle>Public URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {content.url}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
