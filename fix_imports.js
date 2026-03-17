const fs = require('fs');

function replaceInFile(file, search, replaceStr) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replaceStr);
    fs.writeFileSync(file, content);
}

// Fix blogsData
replaceInFile('src/app/blogs/[blogId]/page.tsx', "import { articles } from '@/constants/data';", "import { blogsData } from '@/constants/data';");
replaceInFile('src/app/blogs/page.tsx', "import { articles } from '@/constants/data';", "import { blogsData } from '@/constants/data';");

// Fix any implicitly typed as any in blogId/page.tsx
replaceInFile('src/app/blogs/[blogId]/page.tsx', "blogsData.find((b) =>", "blogsData.find((b: any) =>");

// Fix ButtonText
replaceInFile('src/components/layout/Header.tsx', "from './ButtonText'", "from '../ui/ButtonText'");
replaceInFile('src/components/sections/Ads.tsx', "from './ButtonText'", "from '../ui/ButtonText'");
replaceInFile('src/components/sections/Arrivals.tsx', "from './ButtonText'", "from '../ui/ButtonText'");
replaceInFile('src/components/sections/Artical.tsx', "from './ButtonText'", "from '../ui/ButtonText'");
