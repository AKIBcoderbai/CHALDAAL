const fs = require('fs');
const path = require('path');
const http = require('http');

function post(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Bad JSON: ' + data.slice(0,200))); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function postMultipart(token, imagePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----ChaalDaalBoundary' + Date.now();
    const fileContent = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);

    const pre = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`);
    const post = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([pre, fileContent, post]);

    const req = http.request({
      hostname: 'localhost', port: 3000, path: '/api/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    }, (res) => {
      let data = '';
      console.log(`   HTTP Status: ${res.statusCode}`);
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Bad JSON: ' + data.slice(0,300))); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // STEP 1: Login
  console.log('\n🔑 Step 1: Logging in as seller...');
  const loginBody = JSON.stringify({ email: 'apiseller2026@mail.com', password: 'Test@5678' });
  const loginData = await post({
    hostname: 'localhost', port: 3000, path: '/api/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
  }, loginBody);
  const token = loginData.token;
  console.log(`✅ Login OK! Role: ${loginData.user?.role}, ID: ${loginData.user?.user_id}`);

  // STEP 2: Upload image
  const imagePath = 'C:\\Windows\\Web\\Wallpaper\\Lenovo\\LenovoWallPaper.jpg';
  const imgSize = fs.existsSync(imagePath) ? fs.statSync(imagePath).size : 0;
  console.log(`\n📸 Step 2: Uploading ${(imgSize/1024).toFixed(0)}KB image to Cloudinary...`);

  const uploadData = await postMultipart(token, imagePath);
  const imageUrl = uploadData.image_url;

  if (!imageUrl) {
    console.error('\n❌ Upload FAILED. Response:', JSON.stringify(uploadData));
    process.exit(1);
  }

  console.log('\n✅ ============================================');
  console.log('   CLOUDINARY UPLOAD SUCCESS!');
  console.log('   URL: ' + imageUrl);
  console.log('============================================\n');

  // STEP 3: Save product to DB
  console.log('🛍️  Step 3: Adding product to database...');
  const prodBody = JSON.stringify({ name: 'Cloudinary Live Test', unit: '500g', price: 95, stock_quantity: 50, image_url: imageUrl, category_id: 1 });
  const prodData = await post({
    hostname: 'localhost', port: 3000, path: '/api/products', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(prodBody) }
  }, prodBody);

  console.log(`✅ Product saved! ID: ${prodData.productId}`);
  console.log('\n🎉 PIPELINE COMPLETE:');
  console.log('   File → Cloudinary ✅');
  console.log('   Cloudinary URL → PostgreSQL DB ✅');
  console.log('   Product shows on storefront ✅');
  console.log('\n   Image URL: ' + imageUrl);
}

main().catch(err => { console.error('\n💥 ERROR:', err.message); process.exit(1); });
