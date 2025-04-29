import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Module } from "@/models/Module";
import { Lesson } from "@/models/Lesson";
import { Course } from "@/models/Course";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/modules/[id] - Get module details
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
    const moduleId = params.id;

    // Get the module
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Get the course
    const course = await Course.findById(module.courseId);
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

    // If module is not published, only creator, admin, or sub-admin can access
    if (!module.isPublished && !isCreator && !isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Module is not published" },
        { status: 403 }
      );
    }

    // If user is not a member of the community, they can't access the module
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

    // Get lessons for this module
    const lessons = await Lesson.find({ 
      moduleId: new mongoose.Types.ObjectId(moduleId),
      ...((!isAdmin && !isSubAdmin && !isCreator) ? { isPublished: true } : {})
    }).sort({ order: 1 });

    // Return module with lessons
    return NextResponse.json({
      module,
      lessons
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id] - Update module details
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
    const moduleId = params.id;
    const { title, description, isPublished, releaseDate } = await request.json();

    // Get the module
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Get the course
    const course = await Course.findById(module.courseId);
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
        { error: "Only admins, sub-admins, and the creator can update modules" },
        { status: 403 }
      );
    }

    // Update the module
    const updatedModule = await Module.findByIdAndUpdate(
      moduleId,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isPublished !== undefined && { isPublished }),
        ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      },
      { new: true }
    );

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete a module
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
    const moduleId = params.id;

    // Get the module
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Get the course
    const course = await Course.findById(module.courseId);
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
        { error: "Only admins, sub-admins, and the creator can delete modules" },
        { status: 403 }
      );
    }

    // Delete all lessons for this module
    await Lesson.deleteMany({ moduleId: new mongoose.Types.ObjectId(moduleId) });

    // Delete the module
    await Module.findByIdAndDelete(moduleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
