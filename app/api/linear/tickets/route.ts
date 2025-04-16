import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Linear API key is required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: `
          query {
            issues(
              filter: {
                state: { type: { eq: "completed" } }
              }
              first: 50
            ) {
              nodes {
                id
                title
                description
                state {
                  name
                }
                url
              }
            }
          }
        `,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: "Failed to fetch tickets from Linear" },
        { status: 500 }
      );
    }

    const tickets = data.data.issues.nodes.map((ticket: any) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      state: ticket.state.name,
      url: ticket.url,
    }));

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching Linear tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
