import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Lesson } from "@/models/Lesson";
import { Module } from "@/models/Module";
import { Course } from "@/models/Course";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// POST /api/lessons - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const {
      title,
      description,
      moduleId,
      courseId,
      order,
      content,
      videoUrl,
      attachments,
      duration,
      releaseDate,
    } = await request.json();

    if (!title || !moduleId || !courseId) {
      return NextResponse.json(
        { error: "Title, module ID, and course ID are required" },
        { status: 400 }
      );
    }

    // Get the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get the module
    const courseModule = await Module.findById(moduleId);
    if (!courseModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if module belongs to the course
    if (courseModule.courseId.toString() !== courseId) {
      return NextResponse.json(
        { error: "Module does not belong to the course" },
        { status: 400 }
      );
    }

    // Check if user is admin, sub-admin, or creator
    const community = await Community.findById(course.communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id);
    const isCreator = course.createdBy === session.user.id;

    if (!isAdmin && !isSubAdmin && !isCreator) {
      return NextResponse.json(
        { error: "Only admins, sub-admins, and the creator can add lessons" },
        { status: 403 }
      );
    }

    // If order is not provided, get the highest order and add 1
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const highestOrderLesson = await Lesson.findOne({
        moduleId: new mongoose.Types.ObjectId(moduleId),
      }).sort({ order: -1 });

      lessonOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 0;
    }

    // Create the lesson
    const newLesson = await Lesson.create({
      title,
      description,
      moduleId: new mongoose.Types.ObjectId(moduleId),
      courseId: new mongoose.Types.ObjectId(courseId),
      order: lessonOrder,
      content,
      videoUrl,
      attachments,
      isPublished: false,
      duration,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
    });

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/reorder - Reorder lessons
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { moduleId, lessonOrders } = await request.json();

    if (!moduleId || !lessonOrders || !Array.isArray(lessonOrders)) {
      return NextResponse.json(
        { error: "Module ID and lesson orders array are required" },
        { status: 400 }
      );
    }

    // Get the module
    const courseModule = await Module.findById(moduleId);
    if (!courseModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Get the course
    const course = await Course.findById(courseModule.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is admin, sub-admin, or creator
    const community = await Community.findById(course.communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id);
    const isCreator = course.createdBy === session.user.id;

    if (!isAdmin && !isSubAdmin && !isCreator) {
      return NextResponse.json(
        {
          error: "Only admins, sub-admins, and the creator can reorder lessons",
        },
        { status: 403 }
      );
    }

    // Update the order of each lesson
    const updatePromises = lessonOrders.map(
      ({ lessonId, order }: { lessonId: string; order: number }) => {
        return Lesson.findByIdAndUpdate(lessonId, { order });
      }
    );

    await Promise.all(updatePromises);

    // Get the updated lessons
    const updatedLessons = await Lesson.find({
      moduleId: new mongoose.Types.ObjectId(moduleId),
    }).sort({ order: 1 });

    return NextResponse.json(updatedLessons);
  } catch (error) {
    console.error("Error reordering lessons:", error);
    return NextResponse.json(
      { error: "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}
