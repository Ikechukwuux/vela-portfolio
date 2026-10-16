const fs = require('fs');
const path = require('path');
const lucide = require('c:/Users/LENOVO/Downloads/vela-portfolio/node_modules/lucide');

const icons = {
  'menu': lucide.Menu,
  'x': lucide.X,
  'chevron-down': lucide.ChevronDown,
  'check': lucide.Check,
  'arrow-right': lucide.ArrowRight,
  'arrow-down': lucide.ArrowDown,
  'arrow-up-right': lucide.ArrowUpRight,
  'phone': lucide.Phone,
  'mail': lucide.Mail,
  'map-pin': lucide.MapPin,
  'circle-alert': lucide.CircleAlert,
  'circle-check': lucide.CircleCheck
};

const outDir = path.join('c:', 'Users', 'LENOVO', 'Downloads', 'vela-portfolio', 'assets', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const spriteSymbols = [];

Object.entries(icons).forEach(([name, def]) => {
  if (!def) {
    console.error('Missing icon:', name);
    return;
  }
  const childrenSvg = def.map(([tag, attrs]) => {
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `  <${tag} ${attrStr} />`;
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon--${name}">\n${childrenSvg}\n</svg>\n`;

  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg, 'utf8');
  console.log(`Wrote assets/icons/${name}.svg`);

  spriteSymbols.push(`  <symbol id="icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">\n${childrenSvg}\n  </symbol>`);
});

const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${spriteSymbols.join('\n')}\n</svg>\n`;
fs.writeFileSync(path.join(outDir, 'sprite.svg'), spriteSvg, 'utf8');
console.log('Wrote assets/icons/sprite.svg');
