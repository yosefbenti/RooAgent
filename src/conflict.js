// Simple in-memory conflict tracker
const activeFiles = new Map();

// Register an agent working on a file
export function acquireFile(agentName, filePath) {
  if (activeFiles.has(filePath)) {
    const owner = activeFiles.get(filePath);
    return { conflict: true, owner };
  }
  activeFiles.set(filePath, agentName);
  return { conflict: false };
}

// Release the file when done
export function releaseFile(agentName, filePath) {
  if (activeFiles.get(filePath) === agentName) {
    activeFiles.delete(filePath);
  }
}
