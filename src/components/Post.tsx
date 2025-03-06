"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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

interface Comment {
  id: number;
  text: string;
  author: string;
  createdAt: string;
  type: string;
  content: string;
}

import { IPost } from "@/models/Posts";

interface Post extends Omit<IPost, "likes" | "createdAt"> {
  author?: {
    name: string;
    avatar: string;
  };
  likes: number;
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Ensure post.author exists
  const author = {
    name: post.author?.name || "Unknown",
    avatar: post.author?.avatar || "",
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer max-w-4xl w-full mx-auto">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{author.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2"
        >
          <h4 className="font-bold mb-2">{post.title}</h4>
          <div className="space-y-2">
            {content.map(
              (item: { type: string; content: string }, index: number) => (
                <div key={index}>
                  {item?.type === "text" && (
                    <p className="text-gray-600 leading-relaxed">
                      {item.content}
                    </p>
                  )}
                  {item?.type === "image" && (
                    <img
                      src={item.content}
                      alt=""
                      className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
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
              <span>{post.likes}</span>
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
        <DialogContent className="max-w-6xl w-[800px] max-h-[80vh] overflow-y-auto p-4">
          <DialogTitle className="sr-only">Post Details</DialogTitle>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{author.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
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
                  {item.type === "image" && (
                    <img
                      src={item.content}
                      alt=""
                      className="max-h-[500px] w-full object-contain rounded-md"
                    />
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
                <span>{post.likes}</span>
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
                    key={comment.id}
                    className="flex gap-2 p-3 bg-[#FFF5E6] rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setComments(comments.filter((c) => c.id !== comment.id))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={() => {
                      if (newComment.trim()) {
                        setComments([...comments]);
                        setNewComment("");
                      }
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
