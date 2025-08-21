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

interface ProductQuoteResult {
  productName: string;
  suggestedPrice: string;
  marketComparison: string;
  confidence: number;
  recommendations: string[];
  category: string;
  features: string[];
  competitorPrices: string[];
}

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }
  }

  async generateGiftRecommendations(query: string): Promise<GiftRecommendation[]> {
    if (!this.apiKey) {
      console.error('Gemini API key is missing');
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    return this.generateGiftRecommendationsWithRetry(query, 5, 2000);
  }

  async analyzeProductForQuote(imageBase64?: string, description?: string): Promise<ProductQuoteResult> {
    if (!this.apiKey) {
      console.error('Gemini API key is missing');
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    if (!imageBase64 && !description?.trim()) {
      throw new Error('Either product image or description is required');
    }

    return this.analyzeProductWithRetry(imageBase64, description, 3, 2000);
  }

  private async analyzeProductWithRetry(
    imageBase64?: string,
    description?: string,
    retries: number = 3,
    delay: number = 1000
  ): Promise<ProductQuoteResult> {
    const prompt = this.createProductAnalysisPrompt(description);

    try {
      console.log('Making product analysis request to Gemini API...');
      
      const requestBody: any = {
        contents: [{
          parts: []
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 0.8,
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
      };

      // Add image if provided
      if (imageBase64) {
        requestBody.contents[0].parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
          }
        });
      }

      // Add text prompt
      requestBody.contents[0].parts.push({
        text: prompt
      });

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Product analysis response status:', response.status);

      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.analyzeProductWithRetry(imageBase64, description, retries - 1, delay * 2);
        }
        
        let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
          console.error('Gemini API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data: GeminiResponse = await response.json();
      console.log('Gemini product analysis response received:', data);
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        console.error('No content in Gemini response:', data);
        throw new Error('No content received from Gemini API. The response may have been blocked by safety filters.');
      }

      console.log('Raw product analysis content from Gemini:', content);
      return this.parseProductQuoteResult(content);
    } catch (error) {
      console.error('Error calling Gemini API for product analysis:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while calling Gemini API');
      }
    }
  }

  private createProductAnalysisPrompt(description?: string): string {
    return `
Analyze this product ${description ? `with description: "${description}"` : 'from the image'} for Indian pharmaceutical gifting market.

Please provide a detailed analysis in the following JSON format. Focus on Indian market pricing in INR, considering GST, local competition, and pharmaceutical industry standards.

Return ONLY a valid JSON object with this exact structure:

{
  "productName": "Identified or suggested product name",
  "suggestedPrice": "₹X,XXX",
  "marketComparison": "X% above/below Indian market average",
  "confidence": 85,
  "recommendations": [
    "Specific recommendation 1 for Indian market",
    "Specific recommendation 2 with GST considerations",
    "Specific recommendation 3 for pharmaceutical gifting"
  ],
  "category": "Product category",
  "features": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "competitorPrices": ["Competitor 1: ₹X,XXX", "Competitor 2: ₹X,XXX", "Market range: ₹X,XXX-X,XXX"]
}

Consider:
- Indian pharmaceutical industry standards
- GST implications (18% for most medical products)
- Regional pricing variations across Indian states
- Bulk pricing for pharmaceutical companies
- Compliance with Indian medical device regulations
- Cultural preferences in Indian healthcare sector
- Seasonal pricing (festivals, conferences)
- Local manufacturing vs imported product pricing

Important: Return ONLY the JSON object, no additional text or explanation.
`;
  }

  private parseProductQuoteResult(content: string): ProductQuoteResult {
    try {
      // Clean the content and extract JSON
      const cleanContent = content.trim();
      
      // Try to find JSON object in the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON object found, try parsing the entire content
        const result = JSON.parse(cleanContent);
        return this.validateProductQuoteResult(result);
      }

      const jsonString = jsonMatch[0];
      const result = JSON.parse(jsonString);
      return this.validateProductQuoteResult(result);
    } catch (error) {
      console.error('Error parsing Gemini product analysis response:', error);
      console.log('Raw response content:', content);
      // Return fallback result if parsing fails
      return this.getFallbackProductQuote();
    }
  }

  private validateProductQuoteResult(result: any): ProductQuoteResult {
    return {
      productName: result.productName || 'Analyzed Product',
      suggestedPrice: result.suggestedPrice || '₹2,500',
      marketComparison: result.marketComparison || 'Competitive with market average',
      confidence: typeof result.confidence === 'number' ? Math.min(Math.max(result.confidence, 1), 100) : 85,
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 5) : [],
      category: result.category || 'Medical Product',
      features: Array.isArray(result.features) ? result.features.slice(0, 5) : [],
      competitorPrices: Array.isArray(result.competitorPrices) ? result.competitorPrices.slice(0, 3) : []
    };
  }

  private getFallbackProductQuote(): ProductQuoteResult {
    return {
      productName: "Medical Gift Product",
      suggestedPrice: "₹3,200",
      marketComparison: "8% below Indian market average",
      confidence: 78,
      recommendations: [
        "Consider bulk pricing for orders over 50 units (GST inclusive)",
        "Add custom pharmaceutical branding for 15% premium",
        "Similar products range from ₹2,800-4,200 in current Indian market"
      ],
      category: "Medical Accessories",
      features: ["GST Compliant", "Pharmaceutical Grade", "Indian Market Optimized"],
      competitorPrices: ["Market Leader: ₹3,800", "Local Supplier: ₹2,900", "Import Range: ₹3,500-4,500"]
    };
  }

  private async generateGiftRecommendationsWithRetry(
    query: string, 
    retries: number = 3, 
    delay: number = 1000
  ): Promise<GiftRecommendation[]> {

    const prompt = this.createPrompt(query);

    try {
      console.log('Making request to Gemini API...');
      
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

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.generateGiftRecommendationsWithRetry(query, retries - 1, delay * 2);
        }
        
        let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
          console.error('Gemini API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data: GeminiResponse = await response.json();
      console.log('Gemini API response received:', data);
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        console.error('No content in Gemini response:', data);
        throw new Error('No content received from Gemini API. The response may have been blocked by safety filters.');
      }

      console.log('Raw content from Gemini:', content);
      return this.parseGiftRecommendations(content);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while calling Gemini API');
      }
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