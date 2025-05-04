import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Lesson } from "@/models/Lesson";
import { Course } from "@/models/Course";
import { UserProgress } from "@/models/UserProgress";
import mongoose from "mongoose";

// POST /api/progress/lesson/[lessonId]/complete - Mark a lesson as completed
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const resolvedParams = await context.params;
    const lessonId = resolvedParams.lessonId;

    // Get the lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Get the course
    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is enrolled in the course
    const isEnrolled = course.enrolledUsers.includes(session.user.id);
    if (!isEnrolled) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Get user progress for this course
    let userProgress = await UserProgress.findOne({
      userId: session.user.id,
      courseId: lesson.courseId,
    });

    // If no progress record exists, create one
    if (!userProgress) {
      userProgress = await UserProgress.create({
        userId: session.user.id,
        courseId: lesson.courseId,
        completedLessons: [new mongoose.Types.ObjectId(lessonId)],
        lastAccessedLesson: new mongoose.Types.ObjectId(lessonId),
        lastAccessedAt: new Date(),
        progress: 0, // Will be calculated below
        isCompleted: false,
      });
    } else {
      // Add lesson to completed lessons if not already there
      if (
        !userProgress.completedLessons.includes(
          new mongoose.Types.ObjectId(lessonId)
        )
      ) {
        userProgress.completedLessons.push(
          new mongoose.Types.ObjectId(lessonId)
        );
      }
      userProgress.lastAccessedLesson = new mongoose.Types.ObjectId(lessonId);
      userProgress.lastAccessedAt = new Date();
    }

    // Get total number of lessons in the course
    const totalLessons = await Lesson.countDocuments({
      courseId: lesson.courseId,
      isPublished: true,
    });

    // Calculate progress percentage
    const completedCount = userProgress.completedLessons.length;
    userProgress.progress = Math.round((completedCount / totalLessons) * 100);

    // Check if course is completed
    if (userProgress.progress === 100) {
      userProgress.isCompleted = true;
      userProgress.completedAt = new Date();
    }

    // Save progress
    await userProgress.save();

    return NextResponse.json({
      success: true,
      progress: userProgress.progress,
      isCompleted: userProgress.isCompleted,
    });
  } catch (error) {
    console.error("Error marking lesson as completed:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as completed" },
      { status: 500 }
    );
  }
}
