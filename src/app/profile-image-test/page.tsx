"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { addCacheBusting } from "@/utils/crossBrowserImageUtils";

export default function ProfileImageTestPage() {
  const { data: session } = useSession();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (session?.user?.profileImage) {
      setProfileImageUrl(session.user.profileImage);
      testImageLoading(session.user.profileImage);
    }
  }, [session]);

  const testImageLoading = async (url: string) => {
    if (!url) return;

    const results: {[key: string]: boolean} = {};
    
    // Test 1: Direct image load
    try {
      const img1 = new Image();
      await new Promise((resolve, reject) => {
        img1.onload = () => resolve(true);
        img1.onerror = () => reject(new Error("Failed to load image"));
        img1.src = url;
      });
      results["Direct URL"] = true;
    } catch (error) {
      results["Direct URL"] = false;
    }

    // Test 2: With cache busting
    try {
      const img2 = new Image();
      await new Promise((resolve, reject) => {
        img2.onload = () => resolve(true);
        img2.onerror = () => reject(new Error("Failed to load image"));
        img2.src = addCacheBusting(url);
      });
      results["With Cache Busting"] = true;
    } catch (error) {
      results["With Cache Busting"] = false;
    }

    // Test 3: As background image
    try {
      const div = document.createElement("div");
      div.style.backgroundImage = `url(${url})`;
      document.body.appendChild(div);
      // Wait a bit to let the browser try to load the image
      await new Promise(resolve => setTimeout(resolve, 1000));
      document.body.removeChild(div);
      results["As Background Image"] = true;
    } catch (error) {
      results["As Background Image"] = false;
    }

    setTestResults(results);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Profile Image Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Current Profile Image</h2>
          
          {profileImageUrl ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Image URL:</h3>
                <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                  {profileImageUrl}
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">ProfileAvatar Component:</h3>
                <div className="flex gap-4 items-center">
                  <ProfileAvatar
                    imageUrl={profileImageUrl}
                    name={session?.user?.name || "User"}
                    size="md"
                  />
                  <ProfileAvatar
                    imageUrl={profileImageUrl}
                    name={session?.user?.name || "User"}
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Regular IMG Tag:</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Profile image failed to load with regular img tag");
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">CSS Background Image:</h3>
                <div className="flex gap-4 items-center">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      backgroundImage: `url(${profileImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Load Test Results:</h3>
                <ul className="space-y-2">
                  {Object.entries(testResults).map(([test, success]) => (
                    <li key={test} className="flex items-center gap-2">
                      <span className={success ? "text-green-500" : "text-red-500"}>
                        {success ? "✓" : "✗"}
                      </span>
                      <span>{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>No profile image found in session.</p>
          )}
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
