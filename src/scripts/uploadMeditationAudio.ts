import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Script to upload meditation audio files to Supabase Storage
// Run with: npx ts-node src/scripts/uploadMeditationAudio.ts

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for admin access

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AudioFile {
  localPath: string;
  type: string;
  name: string;
  description: string;
}

const audioFiles: AudioFile[] = [
  {
    localPath: '/Users/ianrakow/Downloads/focus-enhancement-1.mp3',
    type: 'focus',
    name: 'Focus Enhancement 1',
    description: 'Binaural beats and ambient sounds for enhanced concentration'
  },
  // Add more files here as needed
];

async function uploadAudioFiles() {
  console.log('Starting audio upload...');

  for (const audioFile of audioFiles) {
    try {
      console.log(`Uploading ${audioFile.name}...`);

      // Read file
      const fileBuffer = fs.readFileSync(audioFile.localPath);
      const fileName = path.basename(audioFile.localPath);
      const storagePath = `${audioFile.type}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('meditation-audio')
        .upload(storagePath, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`Failed to upload ${fileName}:`, uploadError);
        continue;
      }

      // Get file size
      const stats = fs.statSync(audioFile.localPath);
      const durationSeconds = Math.round(stats.size / 16000); // Rough estimate

      // Save to database
      const { error: dbError } = await supabase
        .from('meditation_audio')
        .insert({
          type: audioFile.type,
          name: audioFile.name,
          audio_url: storagePath,
          duration_seconds: durationSeconds,
          description: audioFile.description
        });

      if (dbError) {
        console.error(`Failed to save ${fileName} to database:`, dbError);
      } else {
        console.log(`✅ Successfully uploaded ${fileName}`);
      }
    } catch (error) {
      console.error(`Error processing ${audioFile.name}:`, error);
    }
  }

  console.log('Upload complete!');
}

// Create storage bucket if it doesn't exist
async function createBucketIfNeeded() {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (!buckets?.find(b => b.name === 'meditation-audio')) {
    const { error } = await supabase.storage.createBucket('meditation-audio', {
      public: true, // Make public for easy access
      fileSizeLimit: 52428800, // 50MB limit
      allowedMimeTypes: ['audio/*']
    });
    
    if (error) {
      console.error('Failed to create bucket:', error);
    } else {
      console.log('Created meditation-audio bucket');
    }
  }
}

// Run the upload
(async () => {
  await createBucketIfNeeded();
  await uploadAudioFiles();
})();