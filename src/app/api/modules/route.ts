import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Module } from "@/models/Module";
import { Course } from "@/models/Course";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// POST /api/modules - Create a new module
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { title, description, courseId, order, releaseDate } = await request.json();

    if (!title || !courseId) {
      return NextResponse.json(
        { error: "Title and course ID are required" },
        { status: 400 }
      );
    }

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
        { error: "Only admins, sub-admins, and the creator can add modules" },
        { status: 403 }
      );
    }

    // If order is not provided, get the highest order and add 1
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const highestOrderModule = await Module.findOne({ courseId: new mongoose.Types.ObjectId(courseId) })
        .sort({ order: -1 });
      
      moduleOrder = highestOrderModule ? highestOrderModule.order + 1 : 0;
    }

    // Create the module
    const newModule = await Module.create({
      title,
      description,
      courseId: new mongoose.Types.ObjectId(courseId),
      order: moduleOrder,
      isPublished: false,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}

// PUT /api/modules/reorder - Reorder modules
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { courseId, moduleOrders } = await request.json();

    if (!courseId || !moduleOrders || !Array.isArray(moduleOrders)) {
      return NextResponse.json(
        { error: "Course ID and module orders array are required" },
        { status: 400 }
      );
    }

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
        { error: "Only admins, sub-admins, and the creator can reorder modules" },
        { status: 403 }
      );
    }

    // Update the order of each module
    const updatePromises = moduleOrders.map(({ moduleId, order }: { moduleId: string, order: number }) => {
      return Module.findByIdAndUpdate(moduleId, { order });
    });

    await Promise.all(updatePromises);

    // Get the updated modules
    const updatedModules = await Module.find({ courseId: new mongoose.Types.ObjectId(courseId) })
      .sort({ order: 1 });

    return NextResponse.json(updatedModules);
  } catch (error) {
    console.error("Error reordering modules:", error);
    return NextResponse.json(
      { error: "Failed to reorder modules" },
      { status: 500 }
    );
  }
}
