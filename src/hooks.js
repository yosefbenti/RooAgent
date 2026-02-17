import { logTrace, computeHash, loadIntents } from './utils.js';

/**
 * PreToolUse hook
 * Checks constraints, automatically assigns intent if not provided
 */
export async function preToolHook(action, currentIntent) {
  if (!currentIntent) {
    // Auto-assign intent based on action type
    const intents = loadIntents();
    currentIntent = intents.find(i => i.constraints.some(c => action.type.includes(c.split(' ')[0]))) || intents[0];
    console.log(`[Auto-Assign] Intent assigned: ${currentIntent.id}`);
  }

  console.log(`[PreToolHook] Checking action: ${action.type}`);

  // Example: enforce constraints
  if (currentIntent.constraints.includes("Ask for confirmation") && action.type === 'delete_file') {
    const confirmed = await confirmAction(action);
    if (!confirmed) throw new Error('Action denied by governance');
  }
}

/**
 * PostToolUse hook
 * Logs trace, formats files, can handle multiple files
 */
export async function postToolHook(action, result, currentIntent) {
  const files = Array.isArray(result.filePath) ? result.filePath : [result.filePath];

  for (const file of files) {
    const trace = {
      intent_id: currentIntent.id,
      contributor: 'AI',
      content_hash: computeHash(result.content),
      timestamp: new Date().toISOString(),
      filePath: file
    };
    logTrace(trace);
    console.log(`[PostToolHook] Logging action: ${action.type} for ${file}`);
    console.log(`Formatting ${file}...done`);
  }
}

/**
 * Simulate user confirmation (auto-yes for demo)
 */
async function confirmAction(action) {
  console.log(`Please confirm action: ${action.type} on ${action.filePath}? (auto-confirmed)`);
  return true;
}
