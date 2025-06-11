import React, { useState, useEffect } from "react";
import "./App.css";

// Debug environment variables at the module level
console.log("Module level env check:", {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  allEnv: process.env,
});

function App() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug environment variables
  console.log("All env variables:", process.env);
  console.log("REACT_APP_API_URL value:", process.env.REACT_APP_API_URL);

  const [currentBackendUrl, setCurrentBackendUrl] = useState(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log("Setting initial backend URL to:", apiUrl);
    return apiUrl || "http://localhost:8000";
  });

  // Add this console log to help debug
  console.log("Initial backend URL:", currentBackendUrl);

  useEffect(() => {
    // Try to detect if the Render app is available
    const checkRenderApp = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL || "", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: "test" }),
        });
        if (response.ok) {
          console.log("Using Render app URL:", process.env.REACT_APP_API_URL);
          setCurrentBackendUrl(process.env.REACT_APP_API_URL || "");
        } else {
          throw new Error("Render app not available");
        }
      } catch (e) {
        console.log("Falling back to localhost");
        // If Render app is not available, try localhost
        for (let port = 8000; port < 8010; port++) {
          try {
            const response = await fetch(`http://localhost:${port}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: "test" }),
            });
            if (response.ok) {
              setCurrentBackendUrl(`http://localhost:${port}`);
              console.log("Using localhost URL:", `http://localhost:${port}`);
              break;
            }
          } catch (e) {
            // Port not available, try next one
            continue;
          }
        }
      }
    };
    checkRenderApp();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSummary("");

    try {
      console.log("Sending request to:", `${currentBackendUrl}/`);
      const response = await fetch(`${currentBackendUrl}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        console.error("Error response:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching the summary"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            YouTube Video Summarizer
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Get concise summaries of YouTube videos using AI
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Note: This app can only summarize videos that have captions
                  enabled. Look for the CC (Closed Captions) button in the
                  YouTube video player to check if a video can be summarized.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                YouTube URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? "Summarizing..." : "Summarize Video"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {summary && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Summary
              </h2>
              <div className="prose max-w-none">
                {summary.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
