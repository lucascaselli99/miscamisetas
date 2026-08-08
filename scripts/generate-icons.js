const path = require("path");
const sharp = require("sharp");

const OUT_DIR = path.join(__dirname, "..", "public", "icons");
const ROUNDED_SVG = path.join(__dirname, "icon-source.svg");
const SQUARE_SVG = path.join(__dirname, "icon-square-source.svg");

async function main() {
  await sharp(ROUNDED_SVG).resize(192, 192).png().toFile(path.join(OUT_DIR, "icon-192.png"));
  await sharp(ROUNDED_SVG).resize(512, 512).png().toFile(path.join(OUT_DIR, "icon-512.png"));
  await sharp(SQUARE_SVG).resize(512, 512).png().toFile(path.join(OUT_DIR, "icon-maskable-512.png"));
  await sharp(SQUARE_SVG).resize(180, 180).png().toFile(path.join(OUT_DIR, "apple-touch-icon.png"));
  await sharp(ROUNDED_SVG).resize(32, 32).png().toFile(path.join(OUT_DIR, "favicon-32.png"));
  console.log("Iconos generados en", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
