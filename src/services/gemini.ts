interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
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

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }
  }

  async generateGiftRecommendations(query: string): Promise<GiftRecommendation[]> {
    return this.generateGiftRecommendationsWithRetry(query, 5, 2000);
  }

  private async generateGiftRecommendationsWithRetry(
    query: string, 
    retries: number = 3, 
    delay: number = 1000
  ): Promise<GiftRecommendation[]> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = this.createPrompt(query);

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.generateGiftRecommendationsWithRetry(query, retries - 1, delay * 2);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No content received from Gemini API');
      }

      return this.parseGiftRecommendations(content);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
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

Important: Return ONLY the JSON array, no additional text or explanation.
`;
  }

  private parseGiftRecommendations(content: string): GiftRecommendation[] {
    try {
      // Clean the content and extract JSON
      const cleanContent = content.trim();
      
      // Try to find JSON array in the response
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // If no JSON array found, try parsing the entire content
        const recommendations = JSON.parse(cleanContent);
        if (!Array.isArray(recommendations)) {
          throw new Error('Response is not an array');
        }
        return this.validateRecommendations(recommendations);
      }

      const jsonString = jsonMatch[0];
      const recommendations = JSON.parse(jsonString);

      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }

      return this.validateRecommendations(recommendations);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response content:', content);
      // Return fallback recommendations if parsing fails
      return this.getFallbackRecommendations();
    }
  }

  private validateRecommendations(recommendations: any[]): GiftRecommendation[] {
    return recommendations.map((rec: any, index: number) => ({
      title: rec.title || `Gift Recommendation ${index + 1}`,
      description: rec.description || 'No description available',
      category: rec.category || 'General',
      priceRange: rec.priceRange || '₹1,000-2,000',
      rating: typeof rec.rating === 'number' ? Math.min(Math.max(rec.rating, 1), 5) : 4.0,
      features: Array.isArray(rec.features) ? rec.features.slice(0, 5) : [],
      suitableFor: Array.isArray(rec.suitableFor) ? rec.suitableFor.slice(0, 3) : [],
      availability: rec.availability || 'Available in India'
    }));
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
      },
      {
        title: "Digital Health Monitoring Kit",
        description: "Modern health monitoring devices with Indian language support and telemedicine integration for healthcare professionals.",
        category: "Technology",
        priceRange: "₹4,200-6,800",
        rating: 4.7,
        features: ["Digital Integration", "Multi-language Support", "Telemedicine Ready"],
        suitableFor: ["Digital Health Initiatives", "Modern Healthcare"],
        availability: "Major Indian cities"
      }
    ];
  }
}

export const geminiService = new GeminiService();