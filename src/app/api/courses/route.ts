import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Course } from "@/models/Course";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/courses - Get all courses (with filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    // Get query parameters
    const url = new URL(request.url);
    const communityId = url.searchParams.get("communityId");
    const isPublished = url.searchParams.get("isPublished");
    const tag = url.searchParams.get("tag");
    const enrolled = url.searchParams.get("enrolled") === "true";
    
    // Build query
    const query: any = {};
    
    if (communityId) {
      query.communityId = new mongoose.Types.ObjectId(communityId);
    }
    
    if (isPublished === "true") {
      query.isPublished = true;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (enrolled) {
      query.enrolledUsers = session.user.id;
    }
    
    // Execute query
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { title, description, communityId, thumbnail, isPublic, tags } = await request.json();

    if (!title || !communityId) {
      return NextResponse.json(
        { error: "Title and community ID are required" },
        { status: 400 }
      );
    }

    // Check if user is admin or sub-admin of the community
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id);

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Only admins and sub-admins can create courses" },
        { status: 403 }
      );
    }

    // Create the course
    const newCourse = await Course.create({
      title,
      description,
      communityId: new mongoose.Types.ObjectId(communityId),
      createdBy: session.user.id,
      thumbnail,
      isPublished: false,
      isPublic: isPublic || false,
      enrolledUsers: [session.user.id], // Creator is automatically enrolled
      tags: tags || [],
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
