import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const outputDir = './public/images';

async function generateImages() {
  console.log('🎨 Starting image generation...');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const zai = await ZAI.create();
  
  const images = [
    {
      prompt: 'Fresh colorful ingredients on rustic wooden kitchen table, tomatoes, basil leaves, garlic, olive oil bottle, warm natural lighting, food photography style, high quality, appetizing',
      filename: 'hero-ingredients.png',
      size: '1440x720' as const
    },
    {
      prompt: 'Delicious healthy salad bowl with fresh vegetables, quinoa, avocado, cherry tomatoes, microgreens, professional food photography, top view, clean white background, appetizing',
      filename: 'category-recipe.png',
      size: '1024x1024' as const
    },
    {
      prompt: 'Chef hands chopping fresh vegetables on wooden cutting board, kitchen scene, warm lighting, professional cooking, culinary art, high quality photography',
      filename: 'category-tips.png',
      size: '1024x1024' as const
    },
    {
      prompt: 'Trending food bowl, poke bowl with salmon, avocado, edamame, sesame seeds, colorful and vibrant, social media style food photography, top view',
      filename: 'category-trending.png',
      size: '1024x1024' as const
    },
    {
      prompt: 'Modern kitchen scene with chef preparing gourmet dish, professional restaurant kitchen, warm ambient lighting, culinary excellence, high quality',
      filename: 'category-news.png',
      size: '1024x1024' as const
    },
    {
      prompt: 'Colorful fresh vegetables and fruits arranged beautifully, farmers market style, healthy eating concept, vibrant colors, natural lighting, overhead view',
      filename: 'cta-background.png',
      size: '1344x768' as const
    }
  ];
  
  for (let i = 0; i < images.length; i++) {
    const { prompt, filename, size } = images[i];
    const outputPath = path.join(outputDir, filename);
    
    console.log(`\n📷 Generating ${i + 1}/${images.length}: ${filename}`);
    console.log(`   Prompt: ${prompt.substring(0, 60)}...`);
    
    try {
      const response = await zai.images.generations.create({
        prompt,
        size
      });
      
      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`   ✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`);
    }
  }
  
  console.log('\n🎉 Image generation complete!');
}

generateImages().catch(console.error);
