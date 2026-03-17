const fs = require('fs');
const path = require('path');

const UI_COMPONENTS = ['ButtonText', 'Cards'];
const LAYOUT_COMPONENTS = ['Header', 'Footer', 'Navbar', 'GlobalLayout', 'AuthLayout', 'ShopSidebar', 'ShopHeader'];
const SECTIONS_COMPONENTS = ['Arrivals', 'ImageSlider', 'CheckoutStepper', 'ShopProductGrid', 'About', 'Ads', 'Artical', 'InfoSection', 'NewsLetter'];

const updateFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // Replace const with constants
    content = content.replace(/from\s+['"]@\/const\/(.*?)['"]/g, "from '@/constants/$1'");

    // Replace direct component imports with their new folder paths
    for (const comp of UI_COMPONENTS) {
        const regex = new RegExp(`from\\s+['"]@/components/${comp}['"]`, 'g');
        content = content.replace(regex, `from '@/components/ui/${comp}'`);
    }

    for (const comp of LAYOUT_COMPONENTS) {
        const regex = new RegExp(`from\\s+['"]@/components/${comp}['"]`, 'g');
        content = content.replace(regex, `from '@/components/layout/${comp}'`);
    }

    for (const comp of SECTIONS_COMPONENTS) {
        const regex = new RegExp(`from\\s+['"]@/components/${comp}['"]`, 'g');
        content = content.replace(regex, `from '@/components/sections/${comp}'`);
    }

    // Also replace imports in relative paths if there are any (e.g. from '../components/Header') just in case
    // most imports are probably absolute via @/ alias.

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated imports in ${filePath}`);
    }
};

const walkSync = function (dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                filelist = walkSync(filepath, filelist);
            }
        } else {
            if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
                filelist.push(filepath);
            }
        }
    });
    return filelist;
};

const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
    const allFiles = walkSync(srcDir);
    allFiles.forEach(updateFile);
    console.log('Finished updating imports.');
} else {
    console.log('src directory not found.');
}
