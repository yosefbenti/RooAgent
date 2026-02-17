import { logTrace, computeHash } from './utils.js';

// PreToolUse hook: runs before executing a tool
export async function preToolHook(action, currentIntent) {
  console.log(`[PreToolHook] Checking action: ${action.type}`);

  // Enforce intent constraints
  if (currentIntent.constraints.includes("Ask for confirmation") && action.type === 'delete_file') {
    const confirmed = await confirmAction(action);
    if (!confirmed) throw new Error('Action denied by governance');
  }

  // Example: block destructive actions not allowed by intent
  if (action.type === 'delete_file' && !currentIntent.constraints.includes("Allow deletion")) {
    console.log('Warning: deletion may be blocked by intent constraints');
  }
}

// PostToolUse hook: runs after executing a tool
export async function postToolHook(action, result, currentIntent) {
  console.log(`[PostToolHook] Logging action: ${action.type}`);

  const trace = {
    intent_id: currentIntent.id,
    contributor: 'AI',
    content_hash: computeHash(result.content),
    timestamp: new Date().toISOString(),
    filePath: result.filePath
  };
  logTrace(trace);

  // Example: auto-format code (placeholder)
  console.log(`Formatting ${result.filePath}...done`);
}

// Simulate user confirmation
function confirmAction(action) {
  return new Promise((resolve) => {
    console.log(`Please confirm action: ${action.type} on ${action.filePath}? (yes to confirm)`);
    // Auto-confirm for now
    resolve(true);
  });
}
