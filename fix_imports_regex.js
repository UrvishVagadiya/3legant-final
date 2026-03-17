const fs = require('fs');

function replaceInFile(file, searchRegex, replaceStr) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchRegex, replaceStr);
    fs.writeFileSync(file, content);
}

const filesToFix = [
    'src/components/layout/Header.tsx',
    'src/components/sections/Ads.tsx',
    'src/components/sections/Arrivals.tsx',
    'src/components/sections/Artical.tsx'
];

filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        replaceInFile(file, /from\s+['"]\.\/ButtonText['"]/g, "from '../ui/ButtonText'");
    }
});
