import { loadIntents } from './utils.js';
import { preToolHook, postToolHook } from './hooks.js';

async function main() {
  // Load active intents
  const intents = loadIntents();
  const currentIntent = intents[0]; // Select first intent for demo
  console.log(`Current intent: ${currentIntent.id} - ${currentIntent.description}`);

  // Example tool action
  const action = {
    type: 'delete_file',
    filePath: 'temp/test.tmp'
  };

  // PreToolUse hook
  await preToolHook(action, currentIntent);

  // Simulate tool execution
  const result = {
    content: `Deleted ${action.filePath}`,
    filePath: action.filePath
  };
  console.log(`Executing action: ${result.content}`);

  // PostToolUse hook
  await postToolHook(action, result, currentIntent);

  console.log('Action completed successfully!');
}

main().catch(err => console.error('Error:', err.message));
