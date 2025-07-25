# Upload Meditation Audio - Browser Method

1. Open your application in the browser
2. Open Developer Console (F12)
3. Run this code in the console:

```javascript
// First, create the storage bucket if it doesn't exist
async function createMeditationBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (!buckets?.find(b => b.name === 'meditation-audio')) {
    const { error } = await supabase.storage.createBucket('meditation-audio', {
      public: true,
      fileSizeLimit: 52428800,
      allowedMimeTypes: ['audio/*']
    });
    
    if (error) {
      console.error('Failed to create bucket:', error);
    } else {
      console.log('Bucket created successfully!');
    }
  }
}

// Run this first
await createMeditationBucket();
```

4. Then use the file upload UI in the MeditationAudioPlayer component:
   - Navigate to a meditation session
   - Click "Upload Audio" button
   - Select your focus-enhancement-1.mp3 file

Or run this in console to upload programmatically:

```javascript
// Create a file input and trigger upload
const input = document.createElement('input');
input.type = 'file';
input.accept = 'audio/*';
input.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const fileName = `focus/${Date.now()}-${file.name}`;
  
  const { error } = await supabase.storage
    .from('meditation-audio')
    .upload(fileName, file);
    
  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload successful!');
    
    // Update database
    await supabase.from('meditation_audio').update({
      audio_url: fileName
    }).eq('type', 'focus').eq('name', 'Focus Enhancement 1');
  }
};
input.click();
```