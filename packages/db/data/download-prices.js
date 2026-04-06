// Paste this into Chrome DevTools console on any blackbasin.com/ammo-prices/ page.
// It downloads both JSON files to your Downloads folder.
// Then move them to packages/db/data/

async function downloadPriceData(slug, filename) {
  const res = await fetch(`https://ammopricesnow.com/ammodata/${filename}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`Downloaded ${filename}`);
}

await downloadPriceData('9mm', '9mm.json');
await downloadPriceData('556nato', '556nato.json');
console.log('Done! Move both files to packages/db/data/');
