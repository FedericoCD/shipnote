import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("Verify endpoint called");

  // Get the origin from the request
  const origin = request.headers.get("origin");
  console.log("Request origin:", origin);

  // Add CORS headers with the specific origin
  const headers = {
    "Access-Control-Allow-Origin": "http://app.localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { headers });
  }

  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("Auth check result:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.log("Authentication failed");
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers,
      });
    }

    let body;
    try {
      body = await request.json();
      console.log("Request body received:", { hasApiKey: !!body.apiKey });
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new NextResponse(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers }
      );
    }

    const { apiKey } = body;
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: "API key is required" }),
        { status: 400, headers }
      );
    }

    // Verify the API key by making a request to Linear's GraphQL API
    console.log("Making request to Linear API");
    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: `
          query {
            viewer {
              id
              name
              email
            }
          }
        `,
      }),
    });

    const data = await response.json();
    console.log("Linear API response:", {
      status: response.status,
      hasData: !!data.data,
      hasErrors: !!data.errors,
    });

    if (data.errors) {
      console.log("Linear API returned errors:", data.errors);
      throw new Error(data.errors[0]?.message || "Invalid API key");
    }

    if (!data.data?.viewer) {
      console.log("No viewer data in response");
      throw new Error("Failed to verify API key");
    }

    console.log("API key verified successfully");
    return new NextResponse(
      JSON.stringify({
        success: true,
        user: {
          name: data.data.viewer.name,
          email: data.data.viewer.email,
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Error in verify endpoint:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Invalid API key",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 401,
        headers,
      }
    );
  }
}
