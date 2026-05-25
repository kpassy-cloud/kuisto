import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/pasted_image_1779751644460.png');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this Vercel dashboard screenshot in detail. What settings, environment variables, or errors are shown? Focus on any configuration issues or deployment problems.' },
          { type: 'image_url', image_url: { url: 'data:image/png;base64,' + base64Image } }
        ]
      }
    ],
    thinking: { type: 'disabled' }
  });
  
  console.log(response.choices[0]?.message?.content);
}

main().catch(console.error);
