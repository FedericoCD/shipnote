import { LinearClient } from "@linear/sdk";

export interface LinearTicket {
  id: string;
  title: string;
  description?: string;
  state: string;
  url: string;
  completedAt?: string;
}

export const createLinearClient = (apiKey: string) => {
  return new LinearClient({ apiKey });
};

export const fetchIssues = async (apiKey: string): Promise<LinearTicket[]> => {
  const client = createLinearClient(apiKey);

  try {
    const issues = await client.issues({
      filter: {
        state: { type: { eq: "completed" } },
      },
      first: 10,
    });

    const tickets: LinearTicket[] = [];
    for (const issue of issues.nodes) {
      const state = await issue.state;
      tickets.push({
        id: issue.id,
        title: issue.title,
        description: issue.description || "",
        state: state?.name || "Unknown",
        url: issue.url,
        completedAt: issue.completedAt?.toISOString(),
      });
    }
    return tickets;
  } catch (error) {
    console.error("Error fetching Linear issues:", error);
    throw error;
  }
};

export const fetchIssueDetails = async (apiKey: string, issueId: string) => {
  const client = createLinearClient(apiKey);

  try {
    const issue = await client.issue(issueId);
    return {
      title: issue.title,
      description: issue.description || "",
      url: issue.url,
    };
  } catch (error) {
    console.error("Error fetching Linear issue details:", error);
    throw error;
  }
};
