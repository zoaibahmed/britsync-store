const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath  = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const INPUT_VIDEO = path.join(__dirname, '..', 'ElevenLabs_video_gemini-omni-flash_You have been p_2026-07-29T11_15_37.mp4');
const OUTPUT_DIR  = path.join(__dirname, '..', '..', 'public', 'hero-frames');

// Clean old frames
console.log('🧹 Cleaning old frames...');
if (fs.existsSync(OUTPUT_DIR)) {
  const old = fs.readdirSync(OUTPUT_DIR);
  old.forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
  console.log(`   Removed ${old.length} old frames`);
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('🎬 Probing video...');

ffmpeg.ffprobe(INPUT_VIDEO, (err, meta) => {
  if (err) { console.error('Probe error:', err.message); process.exit(1); }
  
  const duration = meta.format.duration;
  const vstream  = meta.streams.find(s => s.codec_type === 'video');
  console.log(`   Duration : ${duration.toFixed(2)}s`);
  console.log(`   Source   : ${vstream?.width}x${vstream?.height} @ ${vstream?.r_frame_rate}`);
  console.log(`   Output   : 160 frames @ 20fps → ~8 seconds`);
  console.log('');
  console.log('⚙️  Extracting 160 high-quality frames...');

  let lastPct = 0;

  ffmpeg(INPUT_VIDEO)
    .outputOptions([
      '-vf',      'fps=20,scale=1920:-1:flags=lanczos',  // 20fps, 1920px wide, lanczos resampling
      '-q:v',     '1',          // JPEG quality 1/31 = maximum (browser tools use ~15)
      '-frames:v', '160',       // cap at 160 frames
      '-pix_fmt', 'yuvj420p',   // full-range JPEG color
    ])
    .output(path.join(OUTPUT_DIR, 'frame-%04d.jpg'))
    .on('start', cmd => console.log('   FFmpeg command ready'))
    .on('progress', p => {
      const pct = Math.round(p.percent || 0);
      if (pct >= lastPct + 10) {
        lastPct = pct;
        process.stdout.write(`   Progress: ${pct}%\r`);
      }
    })
    .on('end', () => {
      const frames = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
      console.log(`\n✅ Done! Extracted ${frames.length} frames`);
      console.log(`   Location: ${OUTPUT_DIR}`);
      
      // Show file sizes to verify quality
      const sizes = frames.slice(0, 3).map(f => {
        const s = fs.statSync(path.join(OUTPUT_DIR, f)).size;
        return `${f}: ${(s/1024).toFixed(0)}KB`;
      });
      console.log('\n📊 Sample frame sizes (larger = better quality):');
      sizes.forEach(s => console.log('   ', s));
      console.log('\n🚀 Refresh your browser — hero is ready!');
    })
    .on('error', (err) => {
      console.error('\n❌ Error:', err.message);
      process.exit(1);
    })
    .run();
});
