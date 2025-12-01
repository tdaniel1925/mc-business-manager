"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Textarea,
} from "@/components/ui";
import { MessageSquare, Send } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
  };
}

interface DealCommentsProps {
  dealId: string;
  comments: Comment[];
}

export function DealComments({ dealId, comments }: DealCommentsProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await fetch(`/api/deals/${dealId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <Button type="submit" loading={loading} disabled={!newComment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {getInitials(comment.user.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.user.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
