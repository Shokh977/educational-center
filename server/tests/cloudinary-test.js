const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with the same credentials as your application
cloudinary.config({
  cloud_name: 'dlcxvzqhe',
  api_key: '471644667883611',
  api_secret: 'D1NqHFHxUIdEpCGkzkolY1GSyl4'
});

// Function to test Cloudinary connection by listing recent uploads
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Try to get account info
    const accountResult = await cloudinary.api.account_info();
    console.log('✅ Cloudinary connection successful!');
    console.log('Account info:', accountResult);
    
    // Try to list recent uploads
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 5,
      prefix: 'educational_website' // Match your folder name
    });
    
    console.log('\n✅ Successfully retrieved resources from Cloudinary');
    console.log('Recent uploads:');
    
    if (result.resources.length === 0) {
      console.log('No resources found in the specified folder. This might indicate you haven\'t uploaded any images yet.');
    } else {
      result.resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   URL: ${resource.secure_url}`);
        console.log(`   Format: ${resource.format}, Size: ${resource.bytes} bytes`);
        console.log('---');
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:');
    console.error(error);
    return false;
  }
}

// Run the test
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('\nYour Cloudinary setup appears to be working correctly.');
      console.log('If your profile images are still not appearing, the issue may be in how the URLs are being handled in your application.');
    } else {
      console.log('\nThere seems to be an issue with your Cloudinary configuration.');
    }
  });
