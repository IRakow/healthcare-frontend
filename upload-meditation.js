const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadMeditationAudio() {
  const filePath = '/Users/ianrakow/Downloads/focus-enhancement-1.mp3';
  const fileName = 'focus-enhancement-1.mp3';
  const storagePath = `focus/${fileName}`;

  console.log('Reading file...');
  const fileBuffer = fs.readFileSync(filePath);

  console.log('Uploading to Supabase storage...');
  const { data, error } = await supabase.storage
    .from('meditation-audio')
    .upload(storagePath, fileBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (error) {
    console.error('Upload failed:', error);
    return;
  }

  console.log('File uploaded successfully!');
  console.log('Storage path:', storagePath);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('meditation-audio')
    .getPublicUrl(storagePath);

  console.log('Public URL:', publicUrl);

  // Update database record
  const { error: dbError } = await supabase
    .from('meditation_audio')
    .update({ audio_url: storagePath })
    .eq('type', 'focus')
    .eq('name', 'Focus Enhancement 1');

  if (dbError) {
    console.error('Database update failed:', dbError);
  } else {
    console.log('Database updated successfully!');
  }
}

// Create bucket if needed
async function createBucketIfNeeded() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  if (!buckets?.find(b => b.name === 'meditation-audio')) {
    console.log('Creating meditation-audio bucket...');
    const { error: createError } = await supabase.storage.createBucket('meditation-audio', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/*']
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError);
    } else {
      console.log('Bucket created successfully!');
    }
  } else {
    console.log('Bucket already exists');
  }
}

// Run the upload
(async () => {
  console.log('Starting meditation audio upload...');
  console.log('Please update SUPABASE_URL and SUPABASE_ANON_KEY in this script first!');
  
  // Uncomment these lines after updating the credentials:
  // await createBucketIfNeeded();
  // await uploadMeditationAudio();
})();