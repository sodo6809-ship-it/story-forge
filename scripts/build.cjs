const { build, Platform } = require('electron-builder');
const { getMakeNsisPath } = require('app-builder-lib/out/toolsets/windows');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  await build({ targets: Platform.WINDOWS.createTarget('dir'), publish: 'never' });
  const nsis = await getMakeNsisPath();
  const version = require('../package.json').version;
  const output = path.resolve(`release/StoryForge-Setup-${version}.exe`);
  const input = path.resolve('release/win-unpacked');
  if (!fs.existsSync(path.join(input, 'Story Forge.exe'))) throw Error('Packaged app is missing');
  const generated = path.resolve('build/installer.generated.nsi');
  const script = fs.readFileSync(path.resolve('build/installer.nsi'), 'utf8')
    .replace('../release/win-unpacked/*', path.join(input, '*'))
    .replace('../release/StoryForge-Setup-${APP_VERSION}.exe', output);
  fs.writeFileSync(generated, '\ufeff' + script);
  fs.rmSync(output, { force: true });
  try {
    const result = spawnSync(nsis.path, ['-V3', '-DAPP_VERSION=' + version, generated], {
      cwd: path.resolve('build'), env: { ...process.env, ...nsis.env }, stdio: 'inherit'
    });
    if (result.error) throw result.error;
    if (result.status !== 0 || !fs.existsSync(output)) throw Error(`Installer build failed (${result.status})`);
  } finally { fs.rmSync(generated, { force: true }); }
})().catch(error => { console.error(error); process.exit(1); });
