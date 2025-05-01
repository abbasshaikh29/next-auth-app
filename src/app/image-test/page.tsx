"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ProfileAvatar from "@/components/ProfileAvatar";
import CommunityIcon from "@/components/communitynav/CommunityIcon";
import { addCacheBusting } from "@/utils/crossBrowserImageUtils";

export default function ImageTestPage() {
  const { data: session } = useSession();
  const [googleImageUrl, setGoogleImageUrl] = useState<string>(
    "https://lh3.googleusercontent.com/a/ACg8ocLvbdSzu-bibdcM2AnJgreZfcE0a3jgnVbfK2B9wY8YnL1W9tLF=s96-c"
  );

  const [imageKitUrl, setImageKitUrl] = useState<string>(
    "https://ik.imagekit.io/14xwj7huz/images/image_XiSvEM7D6"
  );

  const [s3ImageUrl, setS3ImageUrl] = useState<string>("");

  // Get the S3 image URL from the session if available
  useEffect(() => {
    if (
      session?.user?.profileImage &&
      session.user.profileImage.includes("amazonaws.com")
    ) {
      setS3ImageUrl(session.user.profileImage);
    }
  }, [session]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Image Loading Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Google Profile Images</h2>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-medium mb-2">ProfileAvatar Component</h3>
                <div className="flex gap-4 items-center">
                  <ProfileAvatar
                    imageUrl={googleImageUrl}
                    name="Google User"
                    size="md"
                  />
                  <ProfileAvatar
                    imageUrl={googleImageUrl}
                    name="Google User"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  CSS Background Image (Recommended)
                </h3>
                <div className="flex gap-4 items-center">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      backgroundImage: `url(${googleImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="text-green-600 text-sm">
                    ✓ Works in all browsers
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Our tests show that CSS background images are the most
                  reliable way to display Google profile images. This is the
                  approach used in the ProfileAvatar component.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">ImageKit Images</h2>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-medium mb-2">CommunityIcon Component</h3>
                <div className="flex gap-4 items-center">
                  <CommunityIcon
                    iconUrl={imageKitUrl}
                    name="Test Community"
                    size="md"
                  />
                  <CommunityIcon
                    iconUrl={imageKitUrl}
                    name="Test Community"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Regular IMG Tag</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-md overflow-hidden">
                    <img
                      src={imageKitUrl}
                      alt="ImageKit"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "ImageKit image failed to load with regular img tag"
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="w-10 h-10 rounded-md overflow-hidden">
                    <img
                      src={addCacheBusting(imageKitUrl)}
                      alt="ImageKit with cache busting"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "ImageKit image with cache busting failed to load"
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">CSS Background Image</h3>
                <div className="flex gap-4 items-center">
                  <div
                    className="w-10 h-10 rounded-md"
                    style={{
                      backgroundImage: `url(${imageKitUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* S3 Image Testing Section */}
        {s3ImageUrl && (
          <div className="mt-8 p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              AWS S3 Images (Your Profile)
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-medium mb-2">Image URL:</h3>
                <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                  {s3ImageUrl}
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">ProfileAvatar Component</h3>
                <div className="flex gap-4 items-center">
                  <ProfileAvatar
                    imageUrl={s3ImageUrl}
                    name="S3 User"
                    size="md"
                  />
                  <ProfileAvatar
                    imageUrl={s3ImageUrl}
                    name="S3 User"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Regular IMG Tag</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={s3ImageUrl}
                      alt="S3 Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "S3 image failed to load with regular img tag"
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={addCacheBusting(s3ImageUrl)}
                      alt="S3 Image with cache busting"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "S3 image with cache busting failed to load"
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">CSS Background Image</h3>
                <div className="flex gap-4 items-center">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      backgroundImage: `url(${s3ImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test Your Own URLs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="googleImageUrl" className="block mb-2">
                Google Image URL:
              </label>
              <input
                id="googleImageUrl"
                type="text"
                value={googleImageUrl}
                onChange={(e) => setGoogleImageUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Google profile image URL"
                title="Google profile image URL"
              />
            </div>

            <div>
              <label htmlFor="imageKitUrl" className="block mb-2">
                ImageKit URL:
              </label>
              <input
                id="imageKitUrl"
                type="text"
                value={imageKitUrl}
                onChange={(e) => setImageKitUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter ImageKit URL"
                title="ImageKit image URL"
              />
            </div>

            <div>
              <label htmlFor="s3ImageUrl" className="block mb-2">
                S3 Image URL:
              </label>
              <input
                id="s3ImageUrl"
                type="text"
                value={s3ImageUrl}
                onChange={(e) => setS3ImageUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter S3 image URL"
                title="S3 image URL"
              />
            </div>
          </div>

          <div className="mt-4">
            <a
              href="/google-image-test.html"
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              Open Advanced Google Image Test Page
            </a>
            <p className="text-sm text-gray-500 mt-1">
              This page tests different approaches to loading Google profile
              images and shows which ones work best.
            </p>
          </div>

          {session && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-medium mb-2">Session Profile Image:</h3>
              <code className="block p-2 bg-white rounded text-sm break-all">
                {session.user?.profileImage || "No profile image in session"}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
