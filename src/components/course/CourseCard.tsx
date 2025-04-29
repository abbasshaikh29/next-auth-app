"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Book, Users, Clock, CheckCircle } from "lucide-react";

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    communityId: string;
    communitySlug?: string;
    enrolledUsers: string[];
    isPublished: boolean;
  };
  progress?: {
    progress: number;
    isCompleted: boolean;
  };
  lessonCount?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  progress, 
  lessonCount = 0 
}) => {
  const router = useRouter();
  const { _id, title, description, thumbnail, communitySlug } = course;

  // Default thumbnail if none provided
  const thumbnailUrl = thumbnail || "/images/course-placeholder.jpg";

  // Handle click on the card
  const handleClick = () => {
    router.push(`/Newcompage/${communitySlug}/Courses/${_id}`);
  };

  return (
    <div 
      className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <figure className="relative h-40 w-full">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!course.isPublished && (
          <div className="absolute top-2 right-2 bg-warning text-warning-content text-xs px-2 py-1 rounded">
            Draft
          </div>
        )}
        {progress?.isCompleted && (
          <div className="absolute top-2 left-2 bg-success text-success-content text-xs px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle size={12} />
            <span>Completed</span>
          </div>
        )}
      </figure>
      
      <div className="card-body p-4">
        <h2 className="card-title text-lg">{title}</h2>
        
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Book size={14} />
            <span>{lessonCount} lessons</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{course.enrolledUsers.length} enrolled</span>
          </div>
        </div>
        
        {progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
