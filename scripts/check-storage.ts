
import { createAdminClient } from '../src/lib/supabase/admin';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkStorage() {
    console.log('Checking Supabase Storage...');

    try {
        const supabase = createAdminClient();

        // 1. List Buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            return;
        }

        console.log('Buckets found:', buckets.map(b => b.name));

        const brandBucket = buckets.find(b => b.name === 'brand-assets');

        if (!brandBucket) {
            console.error('❌ Bucket "brand-assets" NOT found!');

            // Try to create it
            console.log('Attempting to create bucket "brand-assets"...');
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('brand-assets', {
                public: true, // Make it public for publicUrl
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/*']
            });

            if (createError) {
                console.error('Failed to create bucket:', createError);
            } else {
                console.log('✅ Bucket "brand-assets" created successfully!');
            }

        } else {
            console.log('✅ Bucket "brand-assets" exists.');
            console.log('Public:', brandBucket.public);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkStorage();
