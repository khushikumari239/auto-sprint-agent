import { autoSprintAction } from "./src/actions/createLinearIssue";

// Fake message, just like what a real chat message would look like
const fakeMessage = {
  content: {
    text: "we should build a dark mode toggle",
    source: "test",
  },
} as any;

async function run() {
  console.log("Checking if action should trigger...");
  const shouldTrigger = await autoSprintAction.validate(null as any, fakeMessage, undefined);
  console.log("Should trigger:", shouldTrigger);

  if (shouldTrigger) {
    console.log("Running handler...");
    const result = await autoSprintAction.handler(
      null as any,
      fakeMessage,
      undefined,
      undefined,
      async (response) => {
        console.log("🤖 Agent would reply:", response.text);
      },
    );
    console.log("Result:", result);
  }
}

run();