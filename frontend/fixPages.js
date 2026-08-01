const fs = require('fs');
const path = require('path');

const categories = ['earrings', 'necklaces', 'rings'];

categories.forEach(cat => {
  const filePath = path.join(__dirname, 'src', 'app', cat, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add the variable declaration if it's missing
    if (!content.includes('const allProducts =')) {
      const targetStr = 'return (';
      const replacementStr = `const hardcoded = mockProducts.filter(p => p.categoryId === '${cat}');\n  const allProducts = [...hardcoded, ...products];\n\n  return (`;
      content = content.replace(targetStr, replacementStr);
      fs.writeFileSync(filePath, content);
      console.log('Fixed ' + cat);
    }
  }
});
