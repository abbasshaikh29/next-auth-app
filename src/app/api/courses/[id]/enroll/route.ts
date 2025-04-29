import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Course } from "@/models/Course";
import { Community } from "@/models/Community";
import { UserProgress } from "@/models/UserProgress";
import mongoose from "mongoose";

// POST /api/courses/[id]/enroll - Enroll in a course
export async function POST(
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

    // Check if user is already enrolled
    if (course.enrolledUsers.includes(session.user.id)) {
      return NextResponse.json(
        { error: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    // Check if user is a member of the community
    const community = await Community.findById(course.communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const isMember = community.members.includes(session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of the community to enroll in this course" },
        { status: 403 }
      );
    }

    // Enroll the user
    course.enrolledUsers.push(session.user.id);
    await course.save();

    // Create a progress record
    await UserProgress.create({
      userId: session.user.id,
      courseId: new mongoose.Types.ObjectId(courseId),
      completedLessons: [],
      progress: 0,
      isCompleted: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/enroll - Unenroll from a course
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

    // Check if user is enrolled
    if (!course.enrolledUsers.includes(session.user.id)) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 400 }
      );
    }

    // Check if user is the creator (creators can't unenroll)
    if (course.createdBy === session.user.id) {
      return NextResponse.json(
        { error: "Course creators cannot unenroll from their own courses" },
        { status: 403 }
      );
    }

    // Unenroll the user
    course.enrolledUsers = course.enrolledUsers.filter(
      (userId) => userId !== session.user.id
    );
    await course.save();

    // Delete progress record
    await UserProgress.deleteOne({
      userId: session.user.id,
      courseId: new mongoose.Types.ObjectId(courseId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    return NextResponse.json(
      { error: "Failed to unenroll from course" },
      { status: 500 }
    );
  }
}
