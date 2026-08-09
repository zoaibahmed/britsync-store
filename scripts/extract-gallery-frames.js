const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath  = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const INPUT_VIDEO = 'd:/store/Adobe Express - Visitor_entering_Jewellery_Gallery_202608041836.mp4';
const OUTPUT_DIR  = path.join(__dirname, '..', 'public', 'gallery-frames');

// Clean old frames
console.log('Cleaning old gallery frames...');
if (fs.existsSync(OUTPUT_DIR)) {
  const old = fs.readdirSync(OUTPUT_DIR);
  old.forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
  console.log(`   Removed ${old.length} old frames`);
} else {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Clean test frames in public if they exist
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  fs.readdirSync(publicDir).forEach(f => {
    if (f.startsWith('test-frame-') && f.endsWith('.webp')) {
      fs.unlinkSync(path.join(publicDir, f));
    }
  });
}

console.log('🎬 Probing gallery video...');

ffmpeg.ffprobe(INPUT_VIDEO, (err, meta) => {
  if (err) {
    console.error('Probe error:', err.message);
    process.exit(1);
  }
  
  const duration = meta.format.duration;
  const vstream  = meta.streams.find(s => s.codec_type === 'video');
  console.log(`   Duration : ${duration.toFixed(2)}s`);
  console.log(`   Source   : ${vstream?.width}x${vstream?.height} @ ${vstream?.r_frame_rate}`);
  console.log(`   Output   : 2400 WebP frames @ 48fps → 50 seconds`);
  console.log('');
  console.log('⚙️  Extracting 2400 high-quality WebP frames...');

  let lastPct = 0;

  ffmpeg(INPUT_VIDEO)
    .outputOptions([
      '-vf',      'fps=48,scale=960:-1:flags=lanczos',  // 48fps, 960px wide
      '-c:v',     'libwebp',    // WebP codec
      '-q:v',     '75',         // WebP quality 75%
      '-frames:v', '2400',       // cap at 2400 frames
    ])
    .output(path.join(OUTPUT_DIR, 'frame-%04d.webp'))
    .on('start', cmd => console.log('   FFmpeg command ready'))
    .on('progress', p => {
      const pct = Math.round(p.percent || 0);
      if (pct >= lastPct + 10) {
        lastPct = pct;
        process.stdout.write(`   Progress: ${pct}%\r`);
      }
    })
    .on('end', () => {
      const frames = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp'));
      console.log(`\n✅ Done! Extracted ${frames.length} WebP frames`);
      console.log(`   Location: ${OUTPUT_DIR}`);
      
      // Show file sizes to verify quality
      const sizes = frames.slice(0, 3).map(f => {
        const s = fs.statSync(path.join(OUTPUT_DIR, f)).size;
        return `${f}: ${(s/1024).toFixed(0)}KB`;
      });
      console.log('\n📊 Sample frame sizes:');
      sizes.forEach(s => console.log('   ', s));
      console.log('\n🚀 Gallery WebP frames extraction complete!');
    })
    .on('error', (err) => {
      console.error('\n❌ Error:', err.message);
      process.exit(1);
    })
    .run();
});
