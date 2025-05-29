const fs = require('fs');

const a = JSON.parse(fs.readFileSync('./projectA/package.json'));
const b = JSON.parse(fs.readFileSync('./projectB/package.json'));

const merged = {
  ...a,
  dependencies: {
    ...a.dependencies,
    ...b.dependencies
  },
  devDependencies: {
    ...a.devDependencies,
    ...b.devDependencies
  },
  scripts: {
    ...a.scripts,
    ...b.scripts
  }
};

fs.writeFileSync('./merged-package.json', JSON.stringify(merged, null, 2));
console.log('Merged package.json created!');
console.log(merged);