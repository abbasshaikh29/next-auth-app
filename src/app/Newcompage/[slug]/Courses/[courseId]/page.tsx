"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import CommunityNav from "@/components/communitynav/CommunityNav";
import Image from "next/image";
import Link from "next/link";
import { 
  Book, 
  Users, 
  Clock, 
  ChevronRight, 
  Play, 
  Edit, 
  Plus, 
  Settings,
  CheckCircle,
  Lock
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  communityId: string;
  createdBy: string;
  isPublished: boolean;
  isPublic: boolean;
  enrolledUsers: string[];
  tags?: string[];
  createdAt: string;
}

interface Module {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  isPublished: boolean;
}

interface Lesson {
  _id: string;
  title: string;
  moduleId: string;
  courseId: string;
  order: number;
  isPublished: boolean;
  duration?: number;
}

interface Progress {
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  lastAccessedLesson?: string;
  lastAccessedAt?: string;
  lessons: {
    _id: string;
    isCompleted: boolean;
  }[];
}

export default function CourseDetail() {
  const { slug, courseId } = useParams<{ slug: string; courseId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }
        
        const data = await response.json();
        setCourse(data.course);
        setModules(data.modules);
        setLessons(data.lessons);
        
        // Check if user is admin or creator
        if (session?.user?.id) {
          const isUserAdmin = data.course.createdBy === session.user.id;
          setIsAdmin(isUserAdmin);
          
          // Check if user is enrolled
          const userEnrolled = data.course.enrolledUsers.includes(session.user.id);
          setIsEnrolled(userEnrolled);
          
          // If enrolled, fetch progress
          if (userEnrolled) {
            try {
              const progressResponse = await fetch(`/api/progress/course/${courseId}`);
              
              if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                setProgress(progressData);
              }
            } catch (err) {
              console.error("Error fetching progress:", err);
            }
          }
        }
        
        // Expand the first module by default
        if (data.modules.length > 0) {
          setExpandedModules({ [data.modules[0]._id]: true });
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && session) {
      fetchCourseDetails();
    }
  }, [courseId, session]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enroll in course');
      }
      
      showNotification('Successfully enrolled in course', 'success');
      setIsEnrolled(true);
      
      // Refresh course data to update enrolled users count
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const data = await courseResponse.json();
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      showNotification('Failed to enroll in course', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getLessonsForModule = (moduleId: string) => {
    return lessons
      .filter(lesson => lesson.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false;
    return progress.lessons.some(lesson => lesson._id === lessonId && lesson.isCompleted);
  };

  const getContinueLessonId = () => {
    if (!progress || !progress.lastAccessedLesson) {
      // If no progress, return the first lesson
      if (modules.length > 0 && lessons.length > 0) {
        const firstModule = modules.sort((a, b) => a.order - b.order)[0];
        const firstLesson = lessons
          .filter(lesson => lesson.moduleId === firstModule._id)
          .sort((a, b) => a.order - b.order)[0];
        
        return firstLesson?._id;
      }
      return null;
    }
    
    return progress.lastAccessedLesson;
  };

  if (loading) {
    return (
      <div>
        <CommunityNav />
        <div className="flex justify-center items-center py-20">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div>
        <CommunityNav />
        <div className="alert alert-error max-w-md mx-auto m-4">
          <span>{error || "Course not found"}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CommunityNav />
      
      <div className="container mx-auto px-4 py-6">
        {/* Course Header */}
        <div className="relative mb-6">
          {/* Course Thumbnail */}
          <div className="relative h-48 md:h-64 w-full rounded-lg overflow-hidden mb-4">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Book size={48} className="text-gray-400" />
              </div>
            )}
            
            {/* Draft badge */}
            {!course.isPublished && (
              <div className="absolute top-4 right-4 bg-warning text-warning-content px-3 py-1 rounded-full text-sm font-medium">
                Draft
              </div>
            )}
          </div>
          
          {/* Course Info */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              
              {course.description && (
                <p className="text-gray-600 mb-4">{course.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.enrolledUsers.length} enrolled</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Book size={16} />
                  <span>{lessons.length} lessons</span>
                </div>
                
                {progress && (
                  <div className="flex items-center gap-1">
                    {progress.isCompleted ? (
                      <>
                        <CheckCircle size={16} className="text-success" />
                        <span className="text-success">Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        <span>{progress.progress}% complete</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map(tag => (
                    <span key={tag} className="badge badge-outline">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {isAdmin && (
                <Link
                  href={`/Newcompage/${slug}/Courses/${courseId}/edit`}
                  className="btn btn-outline gap-2"
                >
                  <Edit size={16} />
                  <span>Edit Course</span>
                </Link>
              )}
              
              {isEnrolled ? (
                <Link
                  href={`/Newcompage/${slug}/Courses/${courseId}/lesson/${getContinueLessonId()}`}
                  className="btn btn-primary gap-2"
                >
                  <Play size={16} />
                  <span>{progress?.progress ? 'Continue Learning' : 'Start Learning'}</span>
                </Link>
              ) : (
                <button
                  className="btn btn-primary gap-2"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Enroll Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {isEnrolled && progress && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Your Progress</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Course Content */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Course Content</h2>
              
              {isAdmin && (
                <Link
                  href={`/Newcompage/${slug}/Courses/${courseId}/modules/create`}
                  className="btn btn-sm btn-outline gap-1"
                >
                  <Plus size={14} />
                  <span>Add Module</span>
                </Link>
              )}
            </div>
            
            {modules.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No content yet</h3>
                {isAdmin ? (
                  <>
                    <p className="text-gray-500 mb-4">Start building your course by adding modules and lessons.</p>
                    <Link
                      href={`/Newcompage/${slug}/Courses/${courseId}/modules/create`}
                      className="btn btn-primary"
                    >
                      <Plus size={16} />
                      <span>Add First Module</span>
                    </Link>
                  </>
                ) : (
                  <p className="text-gray-500">Check back later for course content.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {modules
                  .sort((a, b) => a.order - b.order)
                  .map(module => {
                    const moduleId = module._id;
                    const moduleLessons = getLessonsForModule(moduleId);
                    const isExpanded = expandedModules[moduleId];
                    
                    return (
                      <div key={moduleId} className="border rounded-lg overflow-hidden">
                        {/* Module Header */}
                        <div 
                          className="bg-base-200 p-4 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleModule(moduleId)}
                        >
                          <div>
                            <h3 className="font-medium">{module.title}</h3>
                            {module.description && (
                              <p className="text-sm text-gray-500">{module.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {moduleLessons.length} {moduleLessons.length === 1 ? 'lesson' : 'lessons'}
                            </span>
                            <ChevronRight 
                              size={20} 
                              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                            />
                          </div>
                        </div>
                        
                        {/* Module Lessons */}
                        {isExpanded && (
                          <div className="divide-y">
                            {moduleLessons.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                {isAdmin ? (
                                  <div>
                                    <p className="mb-2">No lessons in this module yet.</p>
                                    <Link
                                      href={`/Newcompage/${slug}/Courses/${courseId}/modules/${moduleId}/lessons/create`}
                                      className="btn btn-sm btn-outline"
                                    >
                                      <Plus size={14} />
                                      <span>Add Lesson</span>
                                    </Link>
                                  </div>
                                ) : (
                                  <p>No lessons available yet.</p>
                                )}
                              </div>
                            ) : (
                              moduleLessons.map(lesson => {
                                const isCompleted = isLessonCompleted(lesson._id);
                                
                                return (
                                  <Link
                                    key={lesson._id}
                                    href={isEnrolled || isAdmin ? `/Newcompage/${slug}/Courses/${courseId}/lesson/${lesson._id}` : '#'}
                                    className={`p-4 flex justify-between items-center hover:bg-base-200 ${!isEnrolled && !isAdmin ? 'cursor-not-allowed opacity-70' : ''}`}
                                    onClick={(e) => {
                                      if (!isEnrolled && !isAdmin) {
                                        e.preventDefault();
                                        showNotification('You need to enroll in this course first', 'warning');
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {isCompleted ? (
                                        <CheckCircle size={18} className="text-success" />
                                      ) : (
                                        <Play size={18} />
                                      )}
                                      <span>{lesson.title}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      {lesson.duration && (
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                          <Clock size={14} />
                                          {lesson.duration} min
                                        </span>
                                      )}
                                      
                                      {!isEnrolled && !isAdmin && (
                                        <Lock size={16} />
                                      )}
                                    </div>
                                  </Link>
                                );
                              })
                            )}
                            
                            {isAdmin && (
                              <div className="p-3 bg-base-200">
                                <Link
                                  href={`/Newcompage/${slug}/Courses/${courseId}/modules/${moduleId}/lessons/create`}
                                  className="btn btn-sm btn-outline w-full"
                                >
                                  <Plus size={14} />
                                  <span>Add Lesson</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
