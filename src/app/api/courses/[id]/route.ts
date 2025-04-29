import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Course } from "@/models/Course";
import { Module } from "@/models/Module";
import { Lesson } from "@/models/Lesson";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/courses/[id] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const courseId = params.id;

    // Get the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user has access to the course
    const community = await Community.findById(course.communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const isMember = community.members.includes(session.user.id);
    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id);
    const isEnrolled = course.enrolledUsers.includes(session.user.id);
    const isCreator = course.createdBy === session.user.id;

    // If course is not published, only creator, admin, or sub-admin can access
    if (!course.isPublished && !isCreator && !isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Course is not published" },
        { status: 403 }
      );
    }

    // If user is not a member of the community, they can't access the course
    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this community" },
        { status: 403 }
      );
    }

    // If course is not public and user is not enrolled, they can't access
    if (!course.isPublic && !isEnrolled && !isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Get modules for this course
    const modules = await Module.find({ 
      courseId: new mongoose.Types.ObjectId(courseId),
      ...((!isAdmin && !isSubAdmin && !isCreator) ? { isPublished: true } : {})
    }).sort({ order: 1 });

    // Get lessons for this course
    const lessons = await Lesson.find({ 
      courseId: new mongoose.Types.ObjectId(courseId),
      ...((!isAdmin && !isSubAdmin && !isCreator) ? { isPublished: true } : {})
    }).sort({ order: 1 });

    // Return course with modules and lessons
    return NextResponse.json({
      course,
      modules,
      lessons
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const courseId = params.id;
    const { title, description, thumbnail, isPublished, isPublic, tags } = await request.json();

    // Get the course
    const course = await Course.findById(courseId);
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
        { error: "Only admins, sub-admins, and the creator can update courses" },
        { status: 403 }
      );
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnail && { thumbnail }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isPublic !== undefined && { isPublic }),
        ...(tags && { tags }),
      },
      { new: true }
    );

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const courseId = params.id;

    // Get the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is admin or creator
    const community = await Community.findById(course.communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const isAdmin = community.admin === session.user.id;
    const isCreator = course.createdBy === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: "Only admins and the creator can delete courses" },
        { status: 403 }
      );
    }

    // Delete all modules and lessons for this course
    await Module.deleteMany({ courseId: new mongoose.Types.ObjectId(courseId) });
    await Lesson.deleteMany({ courseId: new mongoose.Types.ObjectId(courseId) });

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
