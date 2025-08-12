const fs = require('fs');
const path = require('path');

// Configuration
const OLD_API_URL = 'http://localhost:5000';
const NEW_API_URL = 'https://your-backend-url.railway.app'; // Update this with your actual backend URL

// Directories to search
const directories = [
  'src/app',
  'src/app/components',
  'src/app/pages',
  'src/app/services',
  'src/app/guards',
  'src/app/interceptors'
];

// File extensions to process
const extensions = ['.ts', '.js'];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace the API URL
    content = content.replace(new RegExp(OLD_API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_API_URL);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          updateFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dir}:`, error.message);
  }
}

function main() {
  console.log('🔄 Updating API URLs for production...');
  console.log(`📝 Changing from: ${OLD_API_URL}`);
  console.log(`📝 Changing to: ${NEW_API_URL}`);
  console.log('');
  
  let updatedCount = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Processing directory: ${dir}`);
      processDirectory(dir);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  console.log('');
  console.log('✅ API URL update completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Update the NEW_API_URL in this script with your actual backend URL');
  console.log('2. Run this script again: node update-api-urls.js');
  console.log('3. Commit your changes to GitHub');
  console.log('4. Deploy to Vercel following the DEPLOYMENT.md guide');
}

// Run the script
main();
