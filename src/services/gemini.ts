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
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
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
You are an AI assistant specialized in Indian pharmaceutical market analysis. 
${description ? `Analyze this product: "${description}"` : 'Analyze the product in the image'} for the Indian pharmaceutical gifting market.

You must respond with ONLY a valid JSON object, no other text.

Required JSON structure:
{
  "productName": "Identified or suggested product name",
  "suggestedPrice": "₹2,500-3,800",
  "marketComparison": "5% below Indian market average",
  "confidence": 85,
  "recommendations": [
    "Specific recommendation 1 for Indian market",
    "Specific recommendation 2 with GST considerations",
    "Specific recommendation 3 for pharmaceutical gifting"
  ],
  "category": "Product category",
  "features": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "competitorPrices": ["Competitor 1: ₹2,800-3,200", "Competitor 2: ₹3,500-4,000", "Market range: ₹2,500-4,500"]
}

Requirements:
- Focus on Indian pharmaceutical industry standards
- Include 18% GST implications
- Consider regional pricing variations
- Include bulk pricing options
- Ensure regulatory compliance
- Use price ranges (e.g., ₹2,500-3,800) instead of single prices
- All prices should be in INR with proper formatting
- Price ranges should reflect market reality: ₹1,000 to ₹15,000

CRITICAL: Return ONLY the JSON object. No explanations, no markdown, no additional text.
`;
  }

  private parseProductQuoteResult(content: string): ProductQuoteResult {
    try {
      // Clean the content more aggressively
      let cleanContent = content.trim();
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove any leading/trailing text that's not JSON
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd);
      }
      
      const result = JSON.parse(cleanContent);
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
      suggestedPrice: result.suggestedPrice || 'Price analysis unavailable',
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
      suggestedPrice: "₹2,500-4,000",
      marketComparison: "8% below Indian market average",
      confidence: 78,
      recommendations: [
        "Consider bulk pricing for orders over 50 units (GST inclusive)",
        "Add custom pharmaceutical branding for 15% premium",
        "Similar products range from ₹2,800-4,200 in current Indian market"
      ],
      category: "Medical Accessories",
      features: ["GST Compliant", "Pharmaceutical Grade", "Indian Market Optimized"],
      competitorPrices: ["Market Leader: ₹3,500-4,200", "Local Supplier: ₹2,800-3,200", "Import Range: ₹4,000-5,500"]
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
            temperature: 0.3,
            topK: 32,
            topP: 0.8,
            maxOutputTokens: 2048,
            candidateCount: 1,
            stopSequences: []
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
You are an AI assistant specialized in Indian pharmaceutical gifting and medical products. Based on this query: "${query}"

Generate exactly 3-4 highly relevant and specific gift recommendations for Indian pharmaceutical professionals. You must respond with ONLY a valid JSON array, no other text.

Required JSON structure:

[
  {
    "title": "Specific product name (e.g., 'Premium Digital Stethoscope with Bluetooth')",
    "description": "Detailed 2-3 sentence description explaining why this gift is perfect for Indian pharmaceutical professionals, including specific benefits and use cases",
    "category": "Specific category (e.g., 'Medical Equipment', 'Educational Materials', 'Wellness Products')",
    "priceRange": "₹1,000-5,000",
    "rating": 4.5,
    "features": ["Specific feature 1", "Specific feature 2", "Specific feature 3", "Indian market specific feature"],
    "suitableFor": ["Specific professional role 1", "Specific professional role 2"],
    "availability": "Specific availability info (e.g., 'Available in major Indian cities', 'Pan-India delivery available')",
    "imageUrl": "https://images.pexels.com/photos/[specific-relevant-photo-id]/pexels-photo-[id].jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
  }
]

Requirements:
- Focus specifically on Indian pharmaceutical industry needs
- Include GST compliance and regulatory considerations
- Price ranges: ₹1,000 to ₹15,000 (realistic Indian market prices)
- Consider Indian cultural preferences and regional variations
- Include Ayurvedic/traditional elements where culturally relevant
- Ensure gifts are suitable for medical conferences, hospitals, and healthcare professionals
- Provide specific, actionable product recommendations
- Include real, relevant image URLs from Pexels that match the product type
- Make descriptions compelling and specific to Indian pharmaceutical context
- Consider seasonal factors (monsoon, festivals, etc.) if relevant to the query

CRITICAL: Return ONLY the JSON array. No explanations, no markdown, no additional text.
`;
  }

  private parseGiftRecommendations(content: string): GiftRecommendation[] {
    try {
      // Clean the content more aggressively
      let cleanContent = content.trim();
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove any leading/trailing text that's not JSON
      const jsonStart = cleanContent.indexOf('[');
      const jsonEnd = cleanContent.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd);
      }
      
      const recommendations = JSON.parse(cleanContent);

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
      availability: rec.availability || 'Available in India',
      imageUrl: rec.imageUrl || this.getDefaultImageForCategory(rec.category || 'General')
    }));
  }

  private getDefaultImageForCategory(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('medical') || lowerCategory.includes('equipment')) {
      return 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerCategory.includes('wellness') || lowerCategory.includes('ayurvedic')) {
      return 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerCategory.includes('conference') || lowerCategory.includes('educational')) {
      return 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerCategory.includes('technology') || lowerCategory.includes('digital')) {
      return 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerCategory.includes('book') || lowerCategory.includes('education')) {
      return 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    // Default medical/pharmaceutical image
    return 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
  }

  private getFallbackRecommendations(): GiftRecommendation[] {
    return [
      {
        title: "Premium Digital Stethoscope with Bluetooth Connectivity",
        description: "Advanced digital stethoscope with Bluetooth connectivity and mobile app integration, perfect for modern Indian healthcare professionals. Features noise cancellation and recording capabilities for better patient care documentation.",
        category: "Conference Gifts",
        priceRange: "₹8,500-12,200",
        rating: 4.8,
        features: ["Bluetooth Connectivity", "Mobile App Integration", "Noise Cancellation", "GST Compliant", "2-Year Warranty"],
        suitableFor: ["Cardiologists", "General Physicians", "Medical Students"],
        availability: "Available across India with same-day delivery in metro cities",
        imageUrl: "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
      },
      {
        title: "Ayurvedic Stress Relief & Immunity Booster Gift Set",
        description: "Carefully curated collection of authentic Ayurvedic products including Ashwagandha supplements, herbal teas, and aromatherapy oils. Specifically designed for healthcare professionals dealing with high-stress environments in Indian hospitals.",
        category: "Wellness",
        priceRange: "₹3,200-4,800",
        rating: 4.6,
        features: ["100% Natural Ingredients", "AYUSH Certified", "Stress Relief Formula", "Immunity Boosting", "Premium Packaging"],
        suitableFor: ["Hospital Staff", "Pharmaceutical Researchers", "Healthcare Administrators"],
        availability: "Pan-India delivery with temperature-controlled shipping",
        imageUrl: "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
      },
      {
        title: "Smart Health Monitoring Kit with Indian Language Support",
        description: "Comprehensive digital health monitoring system including BP monitor, glucometer, and pulse oximeter with Hindi and regional language support. Ideal for telemedicine initiatives and rural healthcare programs in India.",
        category: "Technology",
        priceRange: "₹6,500-9,200",
        rating: 4.7,
        features: ["Multi-language Display", "Bluetooth Connectivity", "Mobile App Integration", "Cloud Data Storage", "BIS Certified"],
        suitableFor: ["Rural Healthcare Workers", "Telemedicine Practitioners", "Community Health Officers"],
        availability: "Available in 28 states with local service support",
        imageUrl: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
      }
    ];
  }
}

export const geminiService = new GeminiService();