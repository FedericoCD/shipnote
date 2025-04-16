import { NextResponse } from "next/server";
import OpenAI from "openai";

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
    const { selectedTickets, tone } = await request.json();

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

    // Fetch ticket details from Linear
    const ticketDetails = await Promise.all(
      selectedTickets.map(async (ticketId: string) => {
        const response = await fetch("https://api.linear.app/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINEAR_API_KEY}`,
          },
          body: JSON.stringify({
            query: `
              query {
                issue(id: "${ticketId}") {
                  title
                  description
                  url
                }
              }
            `,
          }),
        });

        const data = await response.json();
        return data.data.issue;
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
