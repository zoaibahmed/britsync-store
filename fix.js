const fs = require('fs');
const files = [
  'src/app/page.tsx', 
  'src/app/gi-certified/page.tsx', 
  'src/app/products/[id]/page.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // We want to replace \`url(${...})\` + ' center/cover'
  // with `url(${...}) center/cover`
  
  // The exact string in the files is: \`url(\${
  // We can just replace all instances of \` with ` and \${ with ${
  c = c.replace(/\\`/g, '`');
  c = c.replace(/\\\$/g, '$');
  
  fs.writeFileSync(f, c);
  console.log('Fixed', f);
});
