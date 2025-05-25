const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Function to recursively find all route.ts files
async function findRouteFiles(dir) {
  const files = fs.readdirSync(dir);
  let routeFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      routeFiles = routeFiles.concat(await findRouteFiles(filePath));
    } else if (file === 'route.ts' && filePath.includes('[')) {
      routeFiles.push(filePath);
    }
  }

  return routeFiles;
}

// Function to fix route handlers in a file
async function fixRouteHandler(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    let content = await readFileAsync(filePath, 'utf8');
    
    // Extract the dynamic parameter name from the path
    const pathParts = filePath.split('\\');
    const dynamicSegmentIndex = pathParts.findIndex(part => part.startsWith('[') && part.endsWith(']'));
    
    if (dynamicSegmentIndex === -1) {
      console.log(`No dynamic segment found in ${filePath}, skipping...`);
      return;
    }
    
    const paramName = pathParts[dynamicSegmentIndex].replace('[', '').replace(']', '');
    console.log(`Found dynamic parameter: ${paramName}`);
    
    // Fix GET handlers
    content = content.replace(
      /export async function GET\(\s*request:\s*NextRequest,\s*(?:context:|{\s*params\s*}:)\s*{\s*params\s*:.*}\s*\)\s*{/g,
      `export async function GET(request: NextRequest) {\n  // Extract the ${paramName} from the URL path\n  const ${paramName} = request.nextUrl.pathname.split('/').pop();`
    );
    
    // Fix POST handlers
    content = content.replace(
      /export async function POST\(\s*request:\s*NextRequest,\s*(?:context:|{\s*params\s*}:)\s*{\s*params\s*:.*}\s*\)\s*{/g,
      `export async function POST(request: NextRequest) {\n  // Extract the ${paramName} from the URL path\n  const ${paramName} = request.nextUrl.pathname.split('/').pop();`
    );
    
    // Fix PUT handlers
    content = content.replace(
      /export async function PUT\(\s*request:\s*NextRequest,\s*(?:context:|{\s*params\s*}:)\s*{\s*params\s*:.*}\s*\)\s*{/g,
      `export async function PUT(request: NextRequest) {\n  // Extract the ${paramName} from the URL path\n  const ${paramName} = request.nextUrl.pathname.split('/').pop();`
    );
    
    // Fix DELETE handlers
    content = content.replace(
      /export async function DELETE\(\s*request:\s*NextRequest,\s*(?:context:|{\s*params\s*}:)\s*{\s*params\s*:.*}\s*\)\s*{/g,
      `export async function DELETE(request: NextRequest) {\n  // Extract the ${paramName} from the URL path\n  const ${paramName} = request.nextUrl.pathname.split('/').pop();`
    );
    
    // Fix PATCH handlers
    content = content.replace(
      /export async function PATCH\(\s*request:\s*NextRequest,\s*(?:context:|{\s*params\s*}:)\s*{\s*params\s*:.*}\s*\)\s*{/g,
      `export async function PATCH(request: NextRequest) {\n  // Extract the ${paramName} from the URL path\n  const ${paramName} = request.nextUrl.pathname.split('/').pop();`
    );
    
    // Fix references to context.params or params
    content = content.replace(
      /const\s*(?:resolvedParams\s*=\s*await\s*context\.params;|{\s*(?:slug|id)\s*}\s*=\s*(?:context\.params|params|resolvedParams));/g,
      `// ${paramName} is already extracted from the URL path above`
    );
    
    // Write the updated content back to the file
    await writeFileAsync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function
async function main() {
  try {
    const apiDir = path.join(__dirname, 'src', 'app', 'api');
    const routeFiles = await findRouteFiles(apiDir);
    
    console.log(`Found ${routeFiles.length} route files to process`);
    
    for (const file of routeFiles) {
      await fixRouteHandler(file);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
