// src/actions/createLinearIssue.ts
var LINEAR_API_KEY = process.env.LINEAR_API_KEY;
var LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
async function createLinearIssue(title, description) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: LINEAR_API_KEY
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
      variables: { title, description, teamId: LINEAR_TEAM_ID }
    })
  });
  return (await res.json()).data.issueCreate;
}
var autoSprintAction = {
  name: "CREATE_LINEAR_TICKET",
  similes: ["MAKE_TICKET", "LOG_TASK", "CREATE_ISSUE"],
  description: "Creates a Linear ticket when someone suggests building something",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("we should build") || text.includes("someone should make");
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    const text = message.content.text || "";
    const title = text.slice(0, 80);
    const result = await createLinearIssue(title, `Auto-captured from chat:

"${text}"`);
    const responseText = result.success ? `Created a Linear ticket for that: ${result.issue.url}` : `Hmm, couldn't create the ticket — check the Linear API key/team ID.`;
    if (callback) {
      await callback({
        text: responseText,
        actions: ["CREATE_LINEAR_TICKET"],
        source: message.content.source
      });
    }
    return {
      text: responseText,
      success: result.success,
      data: { issue: result.issue }
    };
  },
  examples: [
    [
      {
        name: "{{userName}}",
        content: { text: "we should build a dark mode toggle", actions: [] }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Created a Linear ticket for that: https://linear.app/team/issue/AGE-1",
          actions: ["CREATE_LINEAR_TICKET"]
        }
      }
    ]
  ]
};

// src/plugin.ts
import { logger, ModelType, Service } from "@elizaos/core";
import { z } from "zod";

// src/e2e/plugin-my-plugin.e2e.ts
var StarterPluginTestSuite = {
  name: "plugin_my_plugin_test_suite",
  tests: [
    {
      name: "example_test",
      fn: async (runtime) => {
        if (runtime.character.name !== "Eliza") {
          throw new Error(`Expected character name to be "Eliza" but got "${runtime.character.name}"`);
        }
        const service = runtime.getService("starter");
        if (!service) {
          throw new Error("Starter service not found");
        }
      }
    },
    {
      name: "should_have_hello_world_action",
      fn: async (runtime) => {
        const actionExists = runtime.actions.some((a) => a.name === "HELLO_WORLD");
        if (!actionExists) {
          throw new Error("Hello world action not found in runtime actions");
        }
      }
    },
    {
      name: "hello_world_action_test",
      fn: async (runtime) => {
        const testMessage = {
          entityId: "12345678-1234-1234-1234-123456789012",
          roomId: "12345678-1234-1234-1234-123456789012",
          content: {
            text: "Can you say hello?",
            source: "test",
            actions: ["HELLO_WORLD"]
          }
        };
        const testState = {
          values: {},
          data: {},
          text: ""
        };
        let responseText = "";
        let responseReceived = false;
        const helloWorldAction = runtime.actions.find((a) => a.name === "HELLO_WORLD");
        if (!helloWorldAction) {
          throw new Error("Hello world action not found in runtime actions");
        }
        const callback = async (response) => {
          responseReceived = true;
          responseText = response.text || "";
          const responseActions = response.actions;
          if (!responseActions?.includes("HELLO_WORLD")) {
            throw new Error("Response did not include HELLO_WORLD action");
          }
          return Promise.resolve([]);
        };
        await helloWorldAction.handler(runtime, testMessage, testState, {}, callback);
        if (!responseReceived) {
          throw new Error("Hello world action did not produce a response");
        }
        if (!responseText.toLowerCase().includes("hello world")) {
          throw new Error(`Expected response to contain "hello world" but got: "${responseText}"`);
        }
      }
    },
    {
      name: "hello_world_provider_test",
      fn: async (runtime) => {
        const testMessage = {
          entityId: "12345678-1234-1234-1234-123456789012",
          roomId: "12345678-1234-1234-1234-123456789012",
          content: {
            text: "What can you provide?",
            source: "test"
          }
        };
        const testState = {
          values: {},
          data: {},
          text: ""
        };
        const helloWorldProvider = runtime.providers.find((p) => p.name === "HELLO_WORLD_PROVIDER");
        if (!helloWorldProvider) {
          throw new Error("Hello world provider not found in runtime providers");
        }
        const result = await helloWorldProvider.get(runtime, testMessage, testState);
        if (result.text !== "I am a provider") {
          throw new Error(`Expected provider to return "I am a provider", got "${result.text}"`);
        }
      }
    },
    {
      name: "starter_service_test",
      fn: async (runtime) => {
        const service = runtime.getService("starter");
        if (!service) {
          throw new Error("Starter service not found");
        }
        if (service.capabilityDescription !== "This is a starter service which is attached to the agent through the starter plugin.") {
          throw new Error("Incorrect service capability description");
        }
        await service.stop();
      }
    }
  ]
};

// src/plugin.ts
var configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z.string().min(1, "Example plugin variable is not provided").optional().transform((val) => {
    if (!val) {
      logger.warn("Example plugin variable is not provided (this is expected)");
    }
    return val;
  })
});
var helloWorldAction = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "Responds with a simple hello world message",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    const response = "Hello world!";
    if (callback) {
      await callback({
        text: response,
        actions: ["HELLO_WORLD"],
        source: message.content.source
      });
    }
    return {
      text: response,
      success: true,
      data: {
        actions: ["HELLO_WORLD"],
        source: message.content.source
      }
    };
  },
  examples: [
    [
      {
        name: "{{userName}}",
        content: {
          text: "hello",
          actions: []
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Hello world!",
          actions: ["HELLO_WORLD"]
        }
      }
    ]
  ]
};
var helloWorldProvider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",
  get: async (_runtime, _message, _state) => {
    return {
      text: "I am a provider",
      values: {},
      data: {}
    };
  }
};

class StarterService extends Service {
  static serviceType = "starter";
  capabilityDescription = "This is a starter service which is attached to the agent through the starter plugin.";
  static async start(runtime) {
    return new StarterService(runtime);
  }
  async stop() {
    logger.debug("StarterService stopped");
  }
}
var starterPlugin = {
  name: "plugin-my-plugin",
  description: "My Plugin plugin for elizaOS",
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE ?? null
  },
  async init(config) {
    logger.debug("Plugin initialized");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value)
          process.env[key] = String(value);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorIssues = error.issues;
        const errorMessages = errorIssues?.map((e) => e.message).join(", ") || "Unknown validation error";
        throw new Error(`Invalid plugin configuration: ${errorMessages}`);
      }
      throw new Error(`Invalid plugin configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (_runtime, { prompt: _prompt, stopSequences: _stopSequences = [] }) => {
      return "Small text model fixture response.";
    },
    [ModelType.TEXT_LARGE]: async (_runtime, {
      prompt: _prompt,
      stopSequences: _stopSequences = [],
      maxTokens: _maxTokens = 8192,
      temperature: _temperature = 0.7,
      frequencyPenalty: _frequencyPenalty = 0.7,
      presencePenalty: _presencePenalty = 0.7
    }) => {
      return "Large text model fixture response.";
    }
  },
  routes: [
    {
      name: "hello-world-route",
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    },
    {
      name: "current-time-route",
      path: "/api/time",
      type: "GET",
      handler: async (_req, res) => {
        const now = new Date;
        res.json({
          timestamp: now.toISOString(),
          unix: Math.floor(now.getTime() / 1000),
          formatted: now.toLocaleString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug("MESSAGE_RECEIVED event received");
        logger.debug({ keys: Object.keys(params) }, "MESSAGE_RECEIVED param keys");
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug("VOICE_MESSAGE_RECEIVED event received");
        logger.debug({ keys: Object.keys(params) }, "VOICE_MESSAGE_RECEIVED param keys");
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.debug("WORLD_CONNECTED event received");
        logger.debug({ keys: Object.keys(params) }, "WORLD_CONNECTED param keys");
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.debug("WORLD_JOINED event received");
        logger.debug({ keys: Object.keys(params) }, "WORLD_JOINED param keys");
      }
    ]
  },
  actions: [helloWorldAction, autoSprintAction],
  providers: [helloWorldProvider],
  services: [StarterService],
  tests: [StarterPluginTestSuite]
};

// src/index.ts
var src_default = starterPlugin;
export {
  starterPlugin,
  src_default as default
};

//# debugId=EB1C262C27E9FCD564756E2164756E21
//# sourceMappingURL=index.js.map
