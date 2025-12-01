import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import {
  Plus,
  MessageSquare,
  Calendar,
  Image,
  Video,
  FileText,
  ExternalLink,
  Eye,
  ThumbsUp,
  Share,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getContent() {
  const [posts, stats] = await Promise.all([
    prisma.contentPost.findMany({
      include: {
        campaign: true,
        platformPosts: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentPost.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return { posts, stats };
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  DRAFT: "default",
  SCHEDULED: "warning",
  PUBLISHING: "warning",
  PUBLISHED: "success",
  FAILED: "danger",
  ARCHIVED: "default",
};

const platformColors: Record<string, string> = {
  FACEBOOK: "bg-blue-500",
  INSTAGRAM: "bg-gradient-to-br from-purple-500 to-pink-500",
  LINKEDIN: "bg-blue-700",
  TWITTER: "bg-black",
  TIKTOK: "bg-black",
  YOUTUBE: "bg-red-600",
};

const mediaTypeIcons: Record<string, typeof Image> = {
  IMAGE: Image,
  VIDEO: Video,
  CAROUSEL: Image,
  DOCUMENT: FileText,
  LINK: ExternalLink,
};

export default async function ContentPage() {
  const { posts, stats } = await getContent();

  const publishedCount = stats.find((s) => s.status === "PUBLISHED")?._count || 0;
  const scheduledCount = stats.find((s) => s.status === "SCHEDULED")?._count || 0;
  const draftCount = stats.find((s) => s.status === "DRAFT")?._count || 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Content"
        subtitle="Create and manage social media content"
        action={
          <Link href="/marketing/content/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-3xl font-bold text-foreground">{posts.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-3xl font-bold text-foreground">{publishedCount}</p>
                </div>
                <Eye className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-3xl font-bold text-foreground">{scheduledCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-3xl font-bold text-foreground">{draftCount}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Content</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No content yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first post to start engaging your audience
                </p>
                <Link href="/marketing/content/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Content
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => {
                  const MediaIcon = post.mediaType
                    ? mediaTypeIcons[post.mediaType] || FileText
                    : FileText;

                  return (
                    <Link key={post.id} href={`/marketing/content/${post.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-4">
                          {/* Thumbnail / Media Preview */}
                          <div className="relative h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                            {post.thumbnailUrl ? (
                              <img
                                src={post.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <MediaIcon className="w-12 h-12 text-muted-foreground" />
                            )}
                            {post.aiGenerated && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs rounded">
                                AI Generated
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant={statusVariants[post.status]}>
                                {post.status}
                              </Badge>
                              {post.scheduledAt && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(post.scheduledAt)}
                                </span>
                              )}
                            </div>

                            {post.title && (
                              <h4 className="font-medium text-foreground line-clamp-1">
                                {post.title}
                              </h4>
                            )}

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.content}
                            </p>

                            {/* Platforms */}
                            <div className="flex items-center gap-1">
                              {post.platforms.map((platform) => (
                                <div
                                  key={platform}
                                  className={`w-5 h-5 rounded ${platformColors[platform]} flex items-center justify-center`}
                                  title={platform}
                                >
                                  <span className="text-white text-xs">
                                    {platform.charAt(0)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Stats */}
                            {post.status === "PUBLISHED" && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {post.impressions}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {post.engagements}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Share className="w-3 h-3" />
                                  {post.shares}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
