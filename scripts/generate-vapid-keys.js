const webpush = require('web-push');

console.log('🔐 Generating VAPID keys for Web Push Notifications...\n');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('📋 Add these to your .env.local file:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('\n⚠️  Keep the private key secure and never commit it to version control!');
console.log('📝 The public key can be safely exposed in client-side code.\n');
