const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const publicZip = path.join(rootDir, 'public', 'workspeak-portugal.zip');
const rootZip = path.join(rootDir, 'workspeak-portugal.zip');

console.log('Archiving project files...');

// Use tar or powershell Compress-Archive on filtered files
const tempDir = path.join(require('os').tmpdir(), 'workspeak_archive_' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });

const ignoreList = new Set(['node_modules', '.next', '.git', 'public/workspeak-portugal.zip', 'workspeak-portugal.zip']);

function copyFiltered(src, dst) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git' || entry.name.endsWith('.zip')) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true });
      copyFiltered(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

copyFiltered(rootDir, tempDir);

// Compress using powershell
try {
  if (fs.existsSync(publicZip)) fs.unlinkSync(publicZip);
  if (fs.existsSync(rootZip)) fs.unlinkSync(rootZip);
  
  const cmd = `powershell -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${publicZip}' -Force"`;
  execSync(cmd, { stdio: 'inherit' });
  fs.copyFileSync(publicZip, rootZip);
  console.log(`Successfully generated zip at ${publicZip} and ${rootZip}`);
  const stat = fs.statSync(publicZip);
  console.log(`Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
