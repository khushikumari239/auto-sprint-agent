import type {
  Action,
  ActionResult,
  HandlerCallback,
  HandlerOptions,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";

const LINEAR_API_KEY = process.env.LINEAR_API_KEY!;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID!;

async function createLinearIssue(title: string, description: string) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": LINEAR_API_KEY,
    },
    body: JSON.stringify({
      query: `
        mutation IssueCreate($title: String!, $description: String, $teamId: String!) {
          issueCreate(input: { title: $title, description: $description, teamId: $teamId }) {
            success
            issue { id title url }
          }
        }
      `,
      variables: { title, description, teamId: LINEAR_TEAM_ID },
    }),
  });
  return (await res.json()).data.issueCreate;
}

export const autoSprintAction: Action = {
  name: "CREATE_LINEAR_TICKET",
  similes: ["MAKE_TICKET", "LOG_TASK", "CREATE_ISSUE"],
  description: "Creates a Linear ticket when someone suggests building something",

  validate: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
  ): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("we should build") || text.includes("someone should make");
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: HandlerOptions | undefined,
    callback?: HandlerCallback,
    _responses?: Memory[],
  ): Promise<ActionResult> => {
    const text = message.content.text || "";
    const title = text.slice(0, 80);

    const result = await createLinearIssue(title, `Auto-captured from chat:\n\n"${text}"`);

    const responseText = result.success
      ? `Created a Linear ticket for that: ${result.issue.url}`
      : `Hmm, couldn't create the ticket — check the Linear API key/team ID.`;

    if (callback) {
      await callback({
        text: responseText,
        actions: ["CREATE_LINEAR_TICKET"],
        source: message.content.source,
      });
    }

    return {
      text: responseText,
      success: result.success,
      data: { issue: result.issue },
    };
  },

  examples: [
    [
      {
        name: "{{userName}}",
        content: { text: "we should build a dark mode toggle", actions: [] },
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Created a Linear ticket for that: https://linear.app/team/issue/AGE-1",
          actions: ["CREATE_LINEAR_TICKET"],
        },
      },
    ],
  ],
};

export default autoSprintAction;