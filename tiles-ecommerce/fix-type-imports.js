const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: __dirname });

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match imports from types files that should be type-only
  // This regex matches imports that import interfaces/types from '../types' or similar
  const importRegex = /^import\s+{([^}]+)}\s+from\s+['"]([^'"]*types[^'"]*)['"]/gm;
  
  content = content.replace(importRegex, (match, imports, modulePath) => {
    // Check if this is already a type import
    if (match.startsWith('import type')) {
      return match;
    }

    // Parse the imports
    const importList = imports.split(',').map(i => i.trim());
    const typeImports = [];
    const valueImports = [];

    // Known value exports (not types)
    const knownValues = [
      'WASTAGE_OPTIONS',
      'MATERIAL_CONSUMPTION_RATES',
      'defaultSettings',
      'createDefaultSettings'
    ];

    importList.forEach(imp => {
      const cleanImport = imp.replace(/\s+as\s+.*/, '').trim();
      if (knownValues.includes(cleanImport)) {
        valueImports.push(imp);
      } else {
        // Assume it's a type if it starts with uppercase or is an interface
        typeImports.push(imp);
      }
    });

    // Reconstruct the import statement(s)
    const results = [];
    if (typeImports.length > 0) {
      results.push(`import type { ${typeImports.join(', ')} } from '${modulePath}'`);
    }
    if (valueImports.length > 0) {
      results.push(`import { ${valueImports.join(', ')} } from '${modulePath}'`);
    }

    if (results.length > 0) {
      modified = true;
      return results.join('\n');
    }
    
    return match;
  });

  // Also fix imports from specific type files that aren't caught by the above
  content = content.replace(
    /^import\s+{\s*Product\s*}\s+from\s+['"](.*?types.*?)['"]/gm,
    "import type { Product } from '$1'"
  );
  
  content = content.replace(
    /^import\s+{\s*([A-Z][^,}]*(?:,\s*[A-Z][^,}]*)*)\s*}\s+from\s+['"](.*?types.*?)['"]/gm,
    (match, imports, path) => {
      if (match.includes('import type')) return match;
      // Check if any of the imports are known values
      const importList = imports.split(',').map(i => i.trim());
      const hasValue = importList.some(imp => 
        ['WASTAGE_OPTIONS', 'MATERIAL_CONSUMPTION_RATES', 'defaultSettings', 'createDefaultSettings'].includes(imp)
      );
      if (!hasValue) {
        modified = true;
        return `import type { ${imports} } from '${path}'`;
      }
      return match;
    }
  );

  if (modified || content.includes('import type')) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done fixing type imports!');