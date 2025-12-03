const fs = require('fs');
const path = require('path');

const clientDir = path.join(process.cwd(), 'node_modules/.prisma/client');

if (fs.existsSync(clientDir)) {
  // Create TypeScript definition file
  const defaultTs = "export * from './client'";
  fs.writeFileSync(path.join(clientDir, 'default.d.ts'), defaultTs);
  console.log('✓ Created default.d.ts file');
} else {
  console.warn('⚠ .prisma/client directory not found');
}
