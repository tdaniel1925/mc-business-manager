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
        title="Social Media"
        subtitle="Connect and manage your social media accounts"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
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

        {/* Social Analytics Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Audience Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Connect your accounts to see audience analytics</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">
                    {accounts.reduce((sum, a) => sum + a.followers, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Followers</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">
                    {accounts.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Connected Accounts</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">--</p>
                  <p className="text-sm text-muted-foreground">Total Reach (This Month)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
