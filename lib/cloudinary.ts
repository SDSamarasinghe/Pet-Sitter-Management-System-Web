// Test function to check Cloudinary connectivity via our API route
export const testCloudinaryConnection = async () => {
  console.log('=== TESTING CLOUDINARY VIA API ROUTE ===');
  
  try {
    // Create a minimal test file
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile);
    
    console.log('📤 Testing upload via /api/upload...');
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    console.log('📥 Response Status:', response.status);
    const responseData = await response.json();
    console.log('📥 Response Data:', responseData);
    
    if (response.ok) {
      console.log('✅ TEST PASSED - Cloudinary API route is working!');
      return true;
    } else {
      console.log('❌ TEST FAILED:', responseData.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
};

// Updated Cloudinary upload utility using our API route
export const uploadToCloudinary = async (file: File): Promise<string> => {
  console.log('📤 Uploading via secure API route...');
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error}`);
    }
    
    const data = await response.json();
    console.log('✅ Upload successful:', data.secure_url);
    return data.secure_url;
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw new Error('Failed to upload image');
  }
};
