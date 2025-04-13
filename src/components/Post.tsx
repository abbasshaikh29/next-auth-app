"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit,
  Trash,
  X,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/date-utils";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import mongoose from "mongoose";

interface Comment {
  _id: string;
  text: string;
  authorName: string;
  createdAt: string;
  likes: mongoose.Types.ObjectId[];
  parentCommentId: string | null;
}

import { IPost } from "@/models/Posts";

interface Post extends Omit<IPost, "likes" | "createdAt"> {
  likes: mongoose.Types.ObjectId[];
  createdAt: string | Date;
}

interface CommunityCardProps {
  post: Post;
  onLike: (liked: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function PostCard({
  post,
  onLike,
  onDelete,
  onEdit,
}: CommunityCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { data: session } = useSession();

  // Ensure post.likes is always an array
  const likesArray = Array.isArray(post.likes) ? post.likes : [];

  useEffect(() => {
    setMounted(true);
    // Check if user has liked the post
    if (session?.user?.id) {
      const userId = new mongoose.Types.ObjectId(session.user.id);
      setIsLiked(
        likesArray.some((likeId) => {
          try {
            return likeId.toString() === userId.toString();
          } catch (error) {
            console.error("Error comparing like IDs:", error);
            return false;
          }
        })
      );
    }
  }, [likesArray, session?.user?.id]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post._id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${post._id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user?.id) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newComment,
          postId: post._id,
          parentCommentId: replyingTo,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          action: isLiked ? "unlike" : "like",
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId ? updatedComment : comment
          )
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: "Check out this post!",
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!mounted) {
    return null;
  }

  // Ensure post.content is an array
  const content = Array.isArray(post.content)
    ? post.content
    : typeof post.content === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(post.content);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error("Error parsing content:", error);
          return []; // Handle parsing errors gracefully
        }
      })()
    : [];

  // Ensure  post.authorName exist
  const authorName = post.authorName || "Unknown Author";

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer  max-w-4xl w-full mx-auto">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/user/${post._id}/profile `}
              className="flex items-center gap-4"
            >
              <div>
                <p>{authorName}</p>
                <p className="text-sm text-gray-500">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </Link>
          </div>
        </CardHeader>

        <CardContent
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2"
        >
          <div className="flex">
            <div className="w-3/4">
              <h2 className="font-bold text-2xl mb-2">{post.title}</h2>
              <div className="space-y-2">
                {content.map(
                  (item: { type: string; content: string }, index: number) => (
                    <div key={index}>
                      {item?.type === "text" && (
                        <p className=" leading-relaxed">{item.content}</p>
                      )}
                      {item?.type === "link" &&
                        (item.content.startsWith("http") ? (
                          <a
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.content}
                          </a>
                        ) : (
                          <Link
                            href={item.content}
                            className="text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.content}
                          </Link>
                        ))}
                      {item?.type === "file" && (
                        <a
                          href={item.content}
                          download
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-4 w-4" />
                          Download File
                        </a>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="w-1/4 flex justify-center">
              {content.map(
                (item: { type: string; content: string }, index: number) =>
                  item?.type === "image" && (
                    <img
                      key={index}
                      src={item.content}
                      alt=""
                      className="w-20 h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  )
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 px-4">
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onLike(!isLiked);
                setIsLiked(!isLiked);
              }}
              className={`flex items-center gap-2 ${
                isLiked ? "text-red-500" : ""
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likesArray.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} Comments</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-[800px] max-h-[80vh] backdrop-filter backdrop-blur-lg bg-opacity-30 bg-white/10 overflow-y-auto p-4">
          <DialogTitle className="sr-only">Post Details</DialogTitle>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold">{post.authorName}</h3>
                <p className="text-sm text-gray-500">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(post._id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(post._id)}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-xl font-bold mb-4">{post.title}</h2>
          <div className="space-y-4 mb-6">
            {content.map(
              (item: { type: string; content: string }, index: number) => (
                <div key={index}>
                  {item.type === "text" && (
                    <p className="text-gray-600">{item.content}</p>
                  )}
                  {item.type === "link" && (
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {item.content}
                    </a>
                  )}
                  {item.type === "file" && (
                    <a
                      href={item.content}
                      download
                      className="flex items-center gap-2 text-blue-500 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Download File
                    </a>
                  )}
                </div>
              )
            )}
            {content.map(
              (item: { type: string; content: string }, index: number) =>
                item.type === "image" && (
                  <img
                    key={index}
                    src={item.content}
                    alt=""
                    className="w-40 h-40 object-contain rounded-md"
                  />
                )
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onLike(!isLiked);
                  setIsLiked(!isLiked);
                }}
                className={`flex items-center gap-2 ${
                  isLiked ? "text-red-500" : ""
                }`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span>{likesArray.length}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length} Comments</span>
              </Button>
            </div>

            {showComments && (
              <div className="mt-4 space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex gap-2 p-3 bg-[#FFF5E6] rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (session?.user?.id) {
                              const userId = new mongoose.Types.ObjectId(
                                session.user.id
                              );
                              handleLikeComment(
                                comment._id,
                                comment.likes.some(
                                  (likeId) =>
                                    likeId.toString() === userId.toString()
                                )
                              );
                            }
                          }}
                          className={`flex items-center gap-2 ${
                            session?.user?.id &&
                            comment.likes.some(
                              (likeId) =>
                                likeId.toString() ===
                                new mongoose.Types.ObjectId(
                                  session.user.id
                                ).toString()
                            )
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          <Heart
                            className="h-4 w-4"
                            fill={
                              session?.user?.id &&
                              comment.likes.some(
                                (likeId) =>
                                  likeId.toString() ===
                                  new mongoose.Types.ObjectId(
                                    session.user.id
                                  ).toString()
                              )
                                ? "currentColor"
                                : "none"
                            }
                          />
                          <span>{comment.likes.length}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          Reply
                        </Button>
                      </div>
                      {replyingTo === comment._id && (
                        <div className="mt-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-white"
                          />
                          <Button onClick={handleAddComment} className="mt-2">
                            Send Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-white"
                  />
                  <Button onClick={handleAddComment}>Send</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
