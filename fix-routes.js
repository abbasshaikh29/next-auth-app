const fs = require('fs');
const path = require('path');

// Paths to the conflicting directories
const idPath = path.join(__dirname, 'src', 'app', 'api', 'community', '[id]');
const slugPath = path.join(__dirname, 'src', 'app', 'api', 'community', '[slug]');

// Function to rename a directory
function renameDirectory(oldPath, newName) {
  const dirName = path.dirname(oldPath);
  const newPath = path.join(dirName, newName);
  
  try {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Successfully renamed ${oldPath} to ${newPath}`);
      return true;
    } else {
      console.log(`Directory ${oldPath} does not exist`);
      return false;
    }
  } catch (error) {
    console.error(`Error renaming directory: ${error.message}`);
    return false;
  }
}

// Try to rename the [id] directory to by-id
if (renameDirectory(idPath, 'by-id')) {
  console.log('Successfully renamed [id] directory to by-id');
} else {
  console.log('Failed to rename [id] directory');
}

console.log('Route conflict resolution completed');
