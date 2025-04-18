import { NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchIssueDetails } from "@/utils/linear";
import { createClient } from "@/utils/supabase/server";

console.log("OpenAI API Key configured:", !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TONE_PROMPTS = {
  executive:
    "Write a formal, business-focused update that highlights key achievements and their impact on business goals.",
  casual:
    "Write a friendly, conversational update that makes technical changes accessible to everyone.",
  changelog:
    "Write a technical, detailed update that clearly lists all changes and their technical implications.",
  marketing:
    "Write an engaging, promotional update that highlights the value and benefits of the changes.",
};

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("Authentication failed:", { authError, hasUser: !!user });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { selectedTickets, tone, linearApiKey } = await request.json();

    if (!selectedTickets?.length) {
      return NextResponse.json(
        { error: "No tickets selected" },
        { status: 400 }
      );
    }

    if (!tone || !TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS]) {
      return NextResponse.json(
        { error: "Invalid tone selected" },
        { status: 400 }
      );
    }

    if (!linearApiKey) {
      return NextResponse.json(
        { error: "Linear API key is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Fetch ticket details from Linear using our utility function
    const ticketDetails = await Promise.all(
      selectedTickets.map(async (ticketId: string) => {
        try {
          return await fetchIssueDetails(linearApiKey, ticketId);
        } catch (error) {
          console.error(`Error fetching ticket ${ticketId}:`, error);
          throw new Error("Failed to fetch ticket details from Linear");
        }
      })
    );

    // Prepare the prompt for GPT
    const prompt = `
${TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS]}

Here are the completed tickets to include in the update:
${ticketDetails
  .map(
    (ticket: any) => `
- ${ticket.title}
${ticket.description ? `  ${ticket.description}` : ""}
`
  )
  .join("\n")}

Please generate a concise update that incorporates these changes in the specified tone.
`;

    // Generate the update using GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a product manager writing updates about recently shipped features and improvements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const update = completion.choices[0].message.content;

    return NextResponse.json({ update });
  } catch (error) {
    console.error("Error generating update:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
