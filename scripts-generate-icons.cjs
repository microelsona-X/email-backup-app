const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const pngToIco = require('png-to-ico').default

async function main() {
  const root = process.cwd()
  const inputSvg = path.join(root, 'public', 'logo.svg')
  const buildDir = path.join(root, 'build')

  if (!fs.existsSync(inputSvg)) {
    throw new Error(`logo.svg not found: ${inputSvg}`)
  }

  fs.mkdirSync(buildDir, { recursive: true })

  const sizes = [16, 24, 32, 48, 64, 128, 256]
  const pngPaths = []

  for (const size of sizes) {
    const output = path.join(buildDir, `icon-${size}.png`)
    await sharp(inputSvg).resize(size, size).png().toFile(output)
    pngPaths.push(output)
  }

  const iconIco = await pngToIco(pngPaths)
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), iconIco)

  await sharp(inputSvg).resize(512, 512).png().toFile(path.join(buildDir, 'icon.png'))

  console.log('Generated build/icon.ico and build/icon.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
