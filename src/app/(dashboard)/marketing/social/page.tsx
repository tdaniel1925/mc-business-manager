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
  Share2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  ExternalLink,
  Sparkles,
  Calendar,
  Image,
  Video,
  Send,
  Clock,
  TrendingUp,
  BarChart3,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { SocialPlatform } from "@prisma/client";

async function getSocialAccounts() {
  return prisma.socialAccount.findMany({
    orderBy: { createdAt: "desc" },
  });
}

const platformInfo: Record<string, { name: string; color: string; bgColor: string }> = {
  FACEBOOK: { name: "Facebook", color: "text-blue-600", bgColor: "bg-blue-100" },
  INSTAGRAM: { name: "Instagram", color: "text-pink-600", bgColor: "bg-pink-100" },
  LINKEDIN: { name: "LinkedIn", color: "text-blue-700", bgColor: "bg-blue-100" },
  TWITTER: { name: "Twitter/X", color: "text-gray-900", bgColor: "bg-gray-100" },
  TIKTOK: { name: "TikTok", color: "text-gray-900", bgColor: "bg-gray-100" },
  YOUTUBE: { name: "YouTube", color: "text-red-600", bgColor: "bg-red-100" },
};

const availablePlatforms: Array<{ id: SocialPlatform; name: string; description: string; icon: string }> = [
  { id: SocialPlatform.FACEBOOK, name: "Facebook", description: "Connect your Facebook Page", icon: "F" },
  { id: SocialPlatform.INSTAGRAM, name: "Instagram", description: "Connect your Instagram Business account", icon: "I" },
  { id: SocialPlatform.LINKEDIN, name: "LinkedIn", description: "Connect your LinkedIn Company Page", icon: "in" },
  { id: SocialPlatform.TWITTER, name: "Twitter/X", description: "Connect your Twitter/X account", icon: "X" },
];

export default async function SocialPage() {
  const accounts = await getSocialAccounts();

  const connectedPlatforms = accounts.map((a) => a.platform);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="AI-Powered Social Media Hub"
        subtitle="Create, schedule, and manage content with AI across all platforms"
        action={
          <div className="flex gap-2">
            <Link href="/marketing/social/content/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate Content
              </Button>
            </Link>
            <Link href="/marketing/social/calendar">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Content Calendar
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* AI Content Generator Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Writer</h3>
                  <p className="text-xs text-gray-600">Generate posts instantly</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Create engaging social media posts with AI in seconds</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Images</h3>
                  <p className="text-xs text-gray-600">Generate visuals</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Create stunning images and graphics with AI</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Videos</h3>
                  <p className="text-xs text-gray-600">Create video content</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Generate short-form videos automatically</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bulk Schedule</h3>
                  <p className="text-xs text-gray-600">30-day content plan</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Generate and schedule a month of content</p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Posts Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Upcoming Scheduled Posts
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Send className="w-3 h-3 mr-1" />
                  12 Scheduled
                </Badge>
                <Link href="/marketing/social/calendar">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample scheduled posts - In production, fetch from database */}
              {[
                {
                  id: 1,
                  content: "🚀 Did you know? MCA Manager helps businesses streamline their funding operations by 85%! Learn more about how we can help your business grow.",
                  platforms: ["Facebook", "LinkedIn"],
                  scheduledTime: "Today at 2:00 PM",
                  status: "pending",
                  image: true,
                },
                {
                  id: 2,
                  content: "💼 New blog post: 'Top 5 Tips for Managing Merchant Cash Advances in 2025' Check it out! #MCA #BusinessFunding",
                  platforms: ["Twitter", "LinkedIn"],
                  scheduledTime: "Tomorrow at 9:00 AM",
                  status: "pending",
                  image: false,
                },
                {
                  id: 3,
                  content: "🎯 Success Story: How one of our clients increased their funding approval rate by 40% using our AI-powered underwriting system.",
                  platforms: ["Facebook", "Instagram"],
                  scheduledTime: "Tomorrow at 3:00 PM",
                  status: "pending",
                  image: true,
                },
              ].map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.scheduledTime}
                      </div>
                      <div className="flex gap-1">
                        {post.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      {post.image && (
                        <Badge variant="outline" className="text-xs">
                          <Image className="w-3 h-3 mr-1" />
                          Image
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +12.5%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">24.3K</p>
              <p className="text-sm text-gray-600">Total Reach (7 days)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +8.2%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">3,847</p>
              <p className="text-sm text-gray-600">Engagements</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +15.8%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">6.2%</p>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  AI-Generated
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">186</p>
              <p className="text-sm text-gray-600">Content Pieces Created</p>
            </CardContent>
          </Card>
        </div>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Connected Accounts
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No accounts connected yet</p>
                <p className="text-sm mt-1">
                  Connect your social media accounts to start posting
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => {
                  const info = platformInfo[account.platform];
                  return (
                    <Card key={account.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-lg ${info?.bgColor} flex items-center justify-center`}
                            >
                              <span className={`text-xl font-bold ${info?.color}`}>
                                {account.platform.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {info?.name || account.platform}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                @{account.accountName}
                              </p>
                            </div>
                          </div>
                          {account.isConnected ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Followers</p>
                            <p className="text-lg font-semibold text-foreground">
                              {account.followers.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Following</p>
                            <p className="text-lg font-semibold text-foreground">
                              {account.following.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Last synced: {account.lastSyncedAt ? formatDate(account.lastSyncedAt) : "Never"}
                          </span>
                          {account.accountUrl && (
                            <a
                              href={account.accountUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        {account.errorMessage && (
                          <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                            {account.errorMessage}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connect New Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Connect New Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availablePlatforms.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                const info = platformInfo[platform.id];

                return (
                  <button
                    key={platform.id}
                    className={`p-4 rounded-lg border transition-colors text-left ${
                      isConnected
                        ? "border-success/50 bg-success/5 cursor-default"
                        : "border-border hover:border-primary hover:bg-accent"
                    }`}
                    disabled={isConnected}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg ${info?.bgColor} flex items-center justify-center`}
                      >
                        <span className={`text-lg font-bold ${info?.color}`}>
                          {platform.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          {platform.name}
                          {isConnected && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isConnected ? "Already connected" : platform.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Note: Social media integration requires API credentials to be configured in Settings.
            </p>
          </CardContent>
        </Card>

        {/* AI Content Generation Info Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Content Creation</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Generate up to 900+ pieces of optimized social media content with our AI engine. Create posts, images, videos, and entire content calendars in minutes.
                </p>
                <div className="flex gap-3">
                  <Link href="/marketing/social/content/new">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Start Creating
                    </Button>
                  </Link>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
