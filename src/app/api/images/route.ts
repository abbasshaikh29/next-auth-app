import { authOptions } from "@/lib/authoptions";
import { dbconnect } from "@/lib/db";
import Image, { IImage } from "@/models/Image";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  try {
    await dbconnect();

    const images = await Image.find();
    if (!images) {
      throw new Error("No images found");
    }

    return images;
  } catch (error) {
    return NextResponse.json(
      { error: "faild to load images " },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbconnect();
    const body: IImage = await req.json();
    const imageData = {
      ...body,
      imageUrl: body.imageUrl,
    };
    const newimage = await Image.create(imageData);
    if (!newimage) {
      throw new Error("No image found");
    }
    return NextResponse.json(newimage);
  } catch (error) {
    return NextResponse.json(
      { error: "faild to save image " },
      { status: 500 }
    );
  }
}
