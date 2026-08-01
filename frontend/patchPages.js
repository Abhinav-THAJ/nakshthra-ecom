const fs = require('fs');
const path = require('path');

const categories = ['earrings', 'necklaces', 'rings'];

categories.forEach(cat => {
  const filePath = path.join(__dirname, 'src', 'app', cat, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Make sure we import mockProducts
    if (!content.includes('import { mockProducts }')) {
      content = content.replace("import { prisma } from '@/lib/prisma';", "import { prisma } from '@/lib/prisma';\nimport { mockProducts } from '@/data/mockProducts';");
    }

    // Add filter logic
    if (!content.includes('const hardcoded')) {
      const targetStr = `    deliveryTime: 'Tomorrow'\n  }));`;
      const replacementStr = `    deliveryTime: 'Tomorrow'\n  }));\n\n  const hardcoded = mockProducts.filter(p => p.categoryId === '${cat}');\n  const allProducts = [...hardcoded, ...products];`;
      content = content.replace(targetStr, replacementStr);
      
      // Update the prop passed
      content = content.replace(`products={products}`, `products={allProducts}`);
      
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + cat);
    }
  }
});
