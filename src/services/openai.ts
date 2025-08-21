interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface GiftRecommendation {
  title: string;
  description: string;
  category: string;
  priceRange: string;
  rating: number;
  features: string[];
  suitableFor: string[];
  availability: string;
}

export class OpenAIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.apiUrl = (import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }
  }

  async generateGiftRecommendations(query: string): Promise<GiftRecommendation[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = this.createPrompt(query);

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specialized in Indian pharmaceutical gifting solutions. You provide detailed gift recommendations with accurate INR pricing for the Indian market.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      return this.parseGiftRecommendations(content);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  private createPrompt(query: string): string {
    return `
Based on the following query for Indian pharmaceutical gifting: "${query}"

Please provide 3-4 gift recommendations in the following JSON format. Focus on products suitable for the Indian pharmaceutical industry, with pricing in INR and considering Indian market preferences, regulations, and cultural aspects.

Return ONLY a valid JSON array with this exact structure:

[
  {
    "title": "Product name",
    "description": "Detailed description focusing on Indian pharmaceutical context",
    "category": "Category name",
    "priceRange": "₹X,XXX-X,XXX",
    "rating": 4.5,
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "suitableFor": ["Target audience 1", "Target audience 2"],
    "availability": "Availability status in India"
  }
]

Consider:
- Indian pharmaceutical industry needs
- GST compliance and Indian regulations
- Cultural preferences and festivals
- Ayurvedic and traditional medicine integration
- Regional preferences across Indian states
- Professional medical conferences and events in India
- Price ranges appropriate for Indian market (₹1,000 to ₹10,000 range)
- Local suppliers and manufacturing capabilities
`;
  }

  private parseGiftRecommendations(content: string): GiftRecommendation[] {
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonString = jsonMatch[0];
      const recommendations = JSON.parse(jsonString);

      // Validate the structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }

      return recommendations.map((rec: any, index: number) => ({
        title: rec.title || `Gift Recommendation ${index + 1}`,
        description: rec.description || 'No description available',
        category: rec.category || 'General',
        priceRange: rec.priceRange || '₹1,000-2,000',
        rating: typeof rec.rating === 'number' ? rec.rating : 4.0,
        features: Array.isArray(rec.features) ? rec.features : [],
        suitableFor: Array.isArray(rec.suitableFor) ? rec.suitableFor : [],
        availability: rec.availability || 'Available in India'
      }));
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      // Return fallback recommendations if parsing fails
      return this.getFallbackRecommendations();
    }
  }

  private getFallbackRecommendations(): GiftRecommendation[] {
    return [
      {
        title: "Premium Indian Medical Conference Kit",
        description: "Comprehensive gift package including branded notebooks, premium pens, and educational materials specifically designed for Indian pharmaceutical conferences.",
        category: "Conference Gifts",
        priceRange: "₹3,500-5,200",
        rating: 4.8,
        features: ["GST Compliant", "Custom Branding", "Bulk Discounts"],
        suitableFor: ["Medical Conferences", "Pharmaceutical Events"],
        availability: "Available across India"
      },
      {
        title: "Ayurvedic Wellness Gift Collection",
        description: "Curated wellness products combining modern healthcare with traditional Ayurvedic elements, perfect for Indian healthcare professionals.",
        category: "Wellness",
        priceRange: "₹2,800-4,000",
        rating: 4.6,
        features: ["Ayurvedic Products", "Stress Relief", "Cultural Relevance"],
        suitableFor: ["Healthcare Professionals", "Wellness Programs"],
        availability: "Pan-India delivery"
      }
    ];
  }
}

export const openAIService = new OpenAIService();