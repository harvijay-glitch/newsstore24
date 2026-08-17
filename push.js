const { execSync } = require('child_process');

try {
  const result = execSync('"C:\\Program Files\\Git\\bin\\git.exe" push origin main', {
    cwd: 'c:\\Users\\Affnads\\news-portal',
    encoding: 'utf8'
  });
  console.log('✅ Push successful!');
  console.log(result);
} catch (error) {
  console.error('❌ Push failed:');
  console.error(error.message);
}
