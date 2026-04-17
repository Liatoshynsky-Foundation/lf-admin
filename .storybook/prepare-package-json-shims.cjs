async function main() {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { createRequire } = await import('node:module');

  const localRequire = createRequire(__filename);

  function findPackageRoot(packageName) {
    let currentPath = path.dirname(localRequire.resolve(packageName, { paths: [process.cwd()] }));

    while (currentPath !== path.dirname(currentPath)) {
      const packageJsonPath = path.join(currentPath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        return currentPath;
      }

      currentPath = path.dirname(currentPath);
    }

    throw new Error(`Unable to locate package root for ${packageName}`);
  }

  function ensurePackageJsonShim(packageName) {
    const packageRoot = findPackageRoot(packageName);
    const sourcePath = path.join(packageRoot, 'package.json');
    const shimPath = path.join(packageRoot, 'package.json.js');

    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const currentShimContent = fs.existsSync(shimPath)
      ? fs.readFileSync(shimPath, 'utf8')
      : null;

    if (currentShimContent !== sourceContent) {
      fs.writeFileSync(shimPath, sourceContent);
    }
  }

  ensurePackageJsonShim('@mui/icons-material');
}

main().catch((error) => {
  process.stderr.write('[storybook] Failed to prepare package.json shims.\n');
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});