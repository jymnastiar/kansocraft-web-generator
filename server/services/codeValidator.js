// Post-generation code validator and auto-fixer
// Repairs common AI code generation errors before saving to DB using regex checks

// Void HTML elements that must be self-closed in JSX
const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

// Validate and auto-fix common AI-generated code issues
export function validateAndFixCode(code, filePath, context) {
  const warnings = [];
  const isCSS = filePath.endsWith(".css");
  const isJS = filePath.endsWith(".js") || filePath.endsWith(".jsx");

  // 1. Strip markdown code fences that some models wrap around code
  const fencePattern =
    /^```(?:jsx?|javascript|css|html|tsx?|react)?\s*\n([\s\S]*?)\n```\s*$/;
  const fenceMatch = code.match(fencePattern);
  if (fenceMatch) {
    code = fenceMatch[1];
    warnings.push(`${filePath}: Stripped markdown code fences`);
  }

  // Also handle cases where fences appear at the very start/end with other content
  code = code.replace(/^```(?:jsx?|javascript|css|html|tsx?|react)?\s*\n/, "");
  code = code.replace(/\n```\s*$/, "");

  if (isCSS) {
    // CSS-specific fixes — minimal, just trim and return
    return { code: code.trim() + "\n", warnings };
  }

  if (!isJS) {
    return { code, warnings };
  }

  // --- JS/JSX-specific fixes ---

  // 1.5. Convert markdown headers/comments (e.g. ## component for Header.js or # File) to valid JS comments (// ...)
  const markdownHeadingRegex = /^(\s*)#{1,6}\s+(.*)$/gm;
  if (markdownHeadingRegex.test(code)) {
    code = code.replace(/^(\s*)#{1,6}\s+(.*)$/gm, (match, indent, text) => {
      warnings.push(
        `${filePath}: Converted markdown header '# ${text}' to JavaScript comment '// ${text}'`,
      );
      return `${indent}// ${text}`;
    });
  }

  // 2. Fix `class=` → `className=` in JSX (but not inside strings or comments)
  // Match class= that appears inside JSX tags (after < and before >)
  const classFixRegex = /(<[a-zA-Z][^>]*?)\bclass=/g;
  if (classFixRegex.test(code)) {
    code = code.replace(/(<[a-zA-Z][^>]*?)\bclass=/g, "$1className=");
    warnings.push(`${filePath}: Fixed 'class=' → 'className='`);
  }

  // 3. Fix `for=` → `htmlFor=` in JSX labels
  const forFixRegex = /(<label[^>]*?)\bfor=/gi;
  if (forFixRegex.test(code)) {
    code = code.replace(/(<label[^>]*?)\bfor=/gi, "$1htmlFor=");
    warnings.push(`${filePath}: Fixed 'for=' → 'htmlFor='`);
  }

  // 4. Self-close void elements that aren't self-closed
  for (const tag of VOID_ELEMENTS) {
    // Match <tag ... > that is NOT already self-closed (no / before >)
    const voidRegex = new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi");
    if (voidRegex.test(code)) {
      code = code.replace(
        new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi"),
        (match, attrs) => `<${tag}${attrs || ""} />`,
      );
      warnings.push(`${filePath}: Self-closed <${tag}> elements`);
    }
  }

  // 5. Ensure exactly one default export exists
  const defaultExportCount = (code.match(/export\s+default\s+/g) || []).length;
  if (defaultExportCount === 0 && !filePath.endsWith(".css")) {
    // Try to find the main function/component and add default export
    const funcMatch = code.match(/^function\s+([A-Z]\w*)\s*\(/m);
    const constMatch = code.match(/^const\s+([A-Z]\w*)\s*=\s*(?:\(|function)/m);
    const componentName = funcMatch?.[1] || constMatch?.[1];

    if (componentName) {
      // Check if there's already a named export
      const namedExportRegex = new RegExp(
        `export\\s+(function|const)\\s+${componentName}`,
      );
      if (namedExportRegex.test(code)) {
        // Convert `export function X` → `export default function X`
        code = code.replace(
          new RegExp(`export\\s+(function|const)\\s+${componentName}`),
          `export default $1 ${componentName}`,
        );
      } else {
        // Add default export at the end
        code = code.trimEnd() + `\n\nexport default ${componentName};\n`;
      }
      warnings.push(
        `${filePath}: Added missing default export for '${componentName}'`,
      );
    }
  }

  // 6. Remove stray HTML comments inside JSX return blocks
  // Pattern: <!-- comment --> which is invalid in JSX
  const htmlCommentRegex = /<!--[\s\S]*?-->/g;
  if (htmlCommentRegex.test(code)) {
    code = code.replace(htmlCommentRegex, "");
    warnings.push(`${filePath}: Removed HTML comments (invalid in JSX)`);
  }

  // 7. Fix common TypeScript syntax that slips in
  // Remove `: React.FC` or `: FC` type annotations from function declarations
  code = code.replace(/:\s*React\.FC(?:<[^>]*>)?\s*=/g, (match) => {
    warnings.push(`${filePath}: Removed TypeScript React.FC annotation`);
    return " =";
  });

  // Remove simple type annotations from function parameters like (props: any)
  // But be careful not to break destructured defaults like { name = 'default' }
  code = code.replace(
    /(\([^)]*?)\s*:\s*(?:string|number|boolean|any|object|void)\s*([,)])/g,
    (match, before, after) => {
      warnings.push(`${filePath}: Removed TypeScript type annotation`);
      return `${before}${after}`;
    },
  );

  // 8. Ensure React import exists if JSX is used
  const hasJSX = /<[A-Za-z]/.test(code);
  const hasReactImport = /import\s+React/.test(code);
  if (hasJSX && !hasReactImport) {
    code = `import React from 'react';\n${code}`;
    warnings.push(`${filePath}: Added missing React import`);
  }

  // 9. Remove stray HTML void tags (<br />, <br>) inserted into JS data structures or expressions
  const strayBrRegex = /(?:,\s*|<br\s*\/?>\s*,\s*|:\s*)<br\s*\/?>/gi;
  if (strayBrRegex.test(code)) {
    code = code.replace(/,\s*<br\s*\/?>\s*/gi, ", ");
    code = code.replace(/<br\s*\/?>\s*,/gi, ", ");
    code = code.replace(/:\s*<br\s*\/?>\s*/gi, ": ");
    warnings.push(
      `${filePath}: Removed stray <br /> tags from JavaScript data structures`,
    );
  }

  // 10. Fix raw multiline single/double-quote strings in JS (which cause SyntaxError: Unterminated string constant)
  code = code.replace(/:\s*'([^']*\n[^']*)'/g, (match, content) => {
    const singleLine = content.replace(/\s*\n\s*/g, " ");
    warnings.push(
      `${filePath}: Converted multiline single-quote string to single line`,
    );
    return `: '${singleLine}'`;
  });
  code = code.replace(/:\s*"([^"]*\n[^"]*)"/g, (match, content) => {
    const singleLine = content.replace(/\s*\n\s*/g, " ");
    warnings.push(
      `${filePath}: Converted multiline double-quote string to single line`,
    );
    return `: "${singleLine}"`;
  });

  // 11. Fix cases where opening tag was duplicated instead of closing: e.g. <h3 ...>{title}<h3>
  const badClosingTagRegex =
    /(<(h[1-6]|p|span|strong|b|em|i)\b[^>]*>[^<]*?)<(\2)>/gi;
  if (badClosingTagRegex.test(code)) {
    code = code.replace(
      /(<(h[1-6]|p|span|strong|b|em|i)\b[^>]*>[^<]*?)<(\2)>/gi,
      "$1</$2>",
    );
    warnings.push(
      `${filePath}: Corrected duplicated opening tags into closing tags (e.g. <h3>...</h3>)`,
    );
  }

  // 12. Fix style="{...}" string syntax in JSX into style={{...}}
  const badStyleRegex = /style="\{([^"]+)\}"/g;
  if (badStyleRegex.test(code)) {
    code = code.replace(/style="\{([^"]+)\}"/g, (match, inner) => {
      const cleanInner = inner.replace(/;\s*$/, "");
      warnings.push(
        `${filePath}: Fixed JSX style string into style={{...}} object`,
      );
      return `style={{ ${cleanInner} }}`;
    });
  }

  // 13. Fix Unsplash photo ID missing 'photo-' prefix in URLs
  const unsplashRegex =
    /https:\/\/images\.unsplash\.com\/([0-9]{10,}-[a-f0-9]+)/gi;
  if (unsplashRegex.test(code)) {
    code = code.replace(
      /https:\/\/images\.unsplash\.com\/([0-9]{10,}-[a-f0-9]+)/gi,
      "https://images.unsplash.com/photo-$1",
    );
    warnings.push(
      `${filePath}: Added missing 'photo-' prefix to Unsplash image URL`,
    );
  }

  // 14. Fix import paths that point to incorrect folders/paths compared to what was planned
  if (context?.allPlannedFiles) {
    const fixResult = fixImportPaths(code, filePath, context.allPlannedFiles);
    code = fixResult.code;
    warnings.push(...fixResult.warnings);
  }

  return { code: code.trim() + "\n", warnings };
}

// Validate and fix code specifically for revision operations
export function validateRevisionContent(content, filePath, op) {
  if (op === "delete") return { content, warnings: [] };

  if (op === "create") {
    const result = validateAndFixCode(content, filePath);
    return { content: result.code, warnings: result.warnings };
  }

  // For update ops (search/replace content), only apply safe fixes
  // that won't break the partial context
  const warnings = [];

  // Convert markdown headers/comments to valid JS comments in JS files
  const isJS = filePath.endsWith(".js") || filePath.endsWith(".jsx");
  if (isJS) {
    const markdownHeadingRegex = /^(\s*)#{1,6}\s+(.*)$/gm;
    if (markdownHeadingRegex.test(content)) {
      content = content.replace(/^(\s*)#{1,6}\s+(.*)$/gm, (match, indent, text) => {
        warnings.push(
          `${filePath}: Converted markdown header '# ${text}' to JavaScript comment '// ${text}'`,
        );
        return `${indent}// ${text}`;
      });
    }
  }

  // Fix class → className
  const classFixRegex = /(<[a-zA-Z][^>]*?)\bclass=/g;
  if (classFixRegex.test(content)) {
    content = content.replace(/(<[a-zA-Z][^>]*?)\bclass=/g, "$1className=");
    warnings.push(`${filePath}: Fixed 'class=' → 'className=' in replacement`);
  }

  // Fix for → htmlFor
  const forFixRegex = /(<label[^>]*?)\bfor=/gi;
  if (forFixRegex.test(content)) {
    content = content.replace(/(<label[^>]*?)\bfor=/gi, "$1htmlFor=");
    warnings.push(`${filePath}: Fixed 'for=' → 'htmlFor=' in replacement`);
  }

  // Self-close void elements
  for (const tag of VOID_ELEMENTS) {
    const voidRegex = new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi");
    if (voidRegex.test(content)) {
      content = content.replace(
        new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi"),
        (match, attrs) => `<${tag}${attrs || ""} />`,
      );
      warnings.push(`${filePath}: Self-closed <${tag}> in replacement`);
    }
  }

  return { content, warnings };
}

// --- Import Path Resolution Helpers ---

function getDir(p) {
  const parts = p.split("/");
  parts.pop();
  return parts.join("/") || "/";
}

function resolvePath(baseDir, relativePath) {
  const baseParts = baseDir.split("/").filter(Boolean);
  const relParts = relativePath.split("/").filter(Boolean);

  for (const part of relParts) {
    if (part === ".") {
      continue;
    } else if (part === "..") {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }
  return "/" + baseParts.join("/");
}

function getRelativePath(fromDir, toPath) {
  const fromParts = fromDir.split("/").filter(Boolean);
  const toParts = toPath.split("/").filter(Boolean);

  let commonLength = 0;
  while (
    commonLength < fromParts.length &&
    commonLength < toParts.length &&
    fromParts[commonLength] === toParts[commonLength]
  ) {
    commonLength++;
  }

  const upCount = fromParts.length - commonLength;
  const remainingTo = toParts.slice(commonLength);

  const relParts = [];
  for (let i = 0; i < upCount; i++) {
    relParts.push("..");
  }
  if (relParts.length === 0) {
    relParts.push(".");
  }
  relParts.push(...remainingTo);
  return relParts.join("/");
}

function cleanExtension(p) {
  return p.replace(/\.(js|jsx|css|ts|tsx)$/, "");
}

function fixImportPaths(code, filePath, allPlannedFiles) {
  const warnings = [];
  if (!allPlannedFiles || allPlannedFiles.length === 0) {
    return { code, warnings };
  }

  const currentDir = getDir(filePath);
  const plannedPaths = allPlannedFiles.map((f) =>
    f.path.startsWith("/") ? f.path : "/" + f.path,
  );

  // Matches lines like: import Header from './components/Header';
  // or import '../styles.css'; or require('./components/Header')
  const importRegex = /(from\s+['"]|import\s+['"])([^'"]+)(['"])/g;

  const newCode = code.replace(
    importRegex,
    (match, prefix, importTarget, suffix) => {
      // Skip absolute imports (non-relative packages like 'react')
      if (!importTarget.startsWith(".")) {
        return match;
      }

      // 1. Resolve relative import target path
      const resolvedTarget = resolvePath(currentDir, importTarget);
      const resolvedClean = cleanExtension(resolvedTarget);

      // Check if it already matches a planned file path exactly (with or without extension)
      const exactExists = plannedPaths.some(
        (p) => cleanExtension(p) === resolvedClean,
      );
      if (exactExists) {
        return match;
      }

      // 2. Mismatch! Try to find a planned file with the same filename
      const importFilename = resolvedClean.split("/").pop();
      if (!importFilename) {
        return match;
      }

      const foundPlannedPath = plannedPaths.find((p) => {
        const plannedClean = cleanExtension(p);
        const plannedFilename = plannedClean.split("/").pop();
        return plannedFilename === importFilename;
      });

      if (foundPlannedPath) {
        // Calculate relative path from current directory to actual planned file path
        const newRelative = getRelativePath(currentDir, foundPlannedPath);
        // Prefix relative prefix if missing
        const finalRelative = newRelative.startsWith(".")
          ? newRelative
          : "./" + newRelative;

        // Retain file extension if the original import target had it
        const hasExt = /\.(js|jsx|css|ts|tsx)$/.test(importTarget);
        const ext = hasExt ? "." + importTarget.split(".").pop() : "";

        const rewrittenTarget = cleanExtension(finalRelative) + ext;
        if (rewrittenTarget !== importTarget) {
          warnings.push(
            `${filePath}: Corrected import '${importTarget}' to '${rewrittenTarget}' (file planned at '${foundPlannedPath}')`,
          );
          return `${prefix}${rewrittenTarget}${suffix}`;
        }
      }

      return match;
    },
  );

  return { code: newCode, warnings };
}
