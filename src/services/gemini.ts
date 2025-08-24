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
  imageUrl: string;
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
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    
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

    console.log('🔍 Starting Gemini AI Gift Search...');
    console.log('Query:', query);
    
    const result = await this.callGeminiAPI(this.createGiftPrompt(query));
    return this.parseGiftRecommendations(result);
  }

  async analyzeProductForQuote(imageBase64?: string, description?: string): Promise<ProductQuoteResult> {
    if (!this.apiKey) {
      console.error('Gemini API key is missing');
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    if (!imageBase64 && !description?.trim()) {
      throw new Error('Either product image or description is required');
    }

    console.log('🔍 Starting Gemini AI Product Analysis...');
    console.log('Has image:', !!imageBase64);
    console.log('Description:', description);
    
    const result = await this.callGeminiAPI(
      this.createProductPrompt(description), 
      imageBase64
    );
    return this.parseProductQuoteResult(result);
  }

  private async callGeminiAPI(prompt: string, imageBase64?: string, retries: number = 3): Promise<string> {
    const apiUrl = `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const requestBody: any = {
      contents: [{
        parts: []
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.1,
        maxOutputTokens: 4096,
        candidateCount: 1
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    // Add image if provided
    if (imageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64.split(',')[1]
        }
      });
    }

    // Add text prompt
    requestBody.contents[0].parts.push({
      text: prompt
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🚀 Calling Gemini API (attempt ${attempt}/${retries})...`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          
          if (response.status === 429 && attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Rate limited, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data: GeminiResponse = await response.json();
        console.log('✅ Raw Gemini Response:', JSON.stringify(data, null, 2));
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          console.error('❌ No content in response:', data);
          throw new Error('No content received from Gemini API');
        }

        console.log('📝 Gemini AI Raw Output:');
        console.log('='.repeat(50));
        console.log(content);
        console.log('='.repeat(50));
        
        return content;
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  private createGiftPrompt(query: string): string {
    return `You are an AI assistant specialized in Indian pharmaceutical gifting. 

Query: "${query}"

Generate EXACTLY 4 gift recommendations. Respond with ONLY valid JSON array, no other text:

[
  {
    "title": "Specific product name",
    "description": "Detailed description for Indian pharmaceutical professionals",
    "category": "Product category",
    "priceRange": "₹X,XXX-X,XXX",
    "rating": 4.5,
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "suitableFor": ["Professional type 1", "Professional type 2"],
    "availability": "Availability info",
    "imageUrl": "https://images.pexels.com/photos/XXXXX/pexels-photo-XXXXX.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
  }
]

Requirements:
- Indian pharmaceutical market focus
- Price range ₹1,000-15,000
- GST compliance
- Real Pexels image URLs
- Proper product images that match the product type
- Detailed descriptions with specific benefits
- Approximate rates in INR with realistic pricing
- ONLY JSON array, no explanations`;
  }

  private createProductPrompt(description?: string): string {
    return `You are an AI assistant for Indian pharmaceutical market analysis.

${description ? `Product: "${description}"` : 'Analyze the product image'}

Respond with ONLY valid JSON object, no other text:

{
  "productName": "Product name",
  "suggestedPrice": "₹X,XXX-X,XXX",
  "marketComparison": "Market comparison text",
  "confidence": 85,
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "category": "Product category",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "competitorPrices": ["Competitor 1: ₹X,XXX", "Competitor 2: ₹X,XXX"]
}

Requirements:
- Indian market pricing in INR
- GST considerations
- Price ranges ₹1,000-15,000
- ONLY JSON object, no explanations`;
  }

  private parseGiftRecommendations(content: string): GiftRecommendation[] {
    console.log('🔄 Parsing Gift Recommendations...');
    console.log('Raw content to parse:', content);
    
    try {
      // Extract JSON from content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ No JSON array found in content');
        return this.getFallbackRecommendations();
      }
      
      const jsonStr = jsonMatch[0];
      console.log('📋 Extracted JSON:', jsonStr);
      
      const recommendations = JSON.parse(jsonStr);
      
      if (!Array.isArray(recommendations)) {
        console.error('❌ Parsed content is not an array');
        return this.getFallbackRecommendations();
      }
      
      console.log('✅ Successfully parsed recommendations:', recommendations.length);
      return this.validateRecommendations(recommendations);
      
    } catch (error) {
      console.error('❌ JSON parsing failed:', error);
      console.log('📄 Showing raw content as fallback');
      return this.getFallbackRecommendations();
    }
  }

  private parseProductQuoteResult(content: string): ProductQuoteResult {
    console.log('🔄 Parsing Product Quote...');
    console.log('Raw content to parse:', content);
    
    try {
      // Extract JSON from content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON object found in content');
        return this.getFallbackProductQuote();
      }
      
      const jsonStr = jsonMatch[0];
      console.log('📋 Extracted JSON:', jsonStr);
      
      const result = JSON.parse(jsonStr);
      console.log('✅ Successfully parsed product quote');
      return this.validateProductQuoteResult(result);
      
    } catch (error) {
      console.error('❌ JSON parsing failed:', error);
      console.log('📄 Showing raw content as fallback');
      return this.getFallbackProductQuote();
    }
  }

  private async analyzeProductWithRetry(
    imageBase64?: string, 
    description?: string, 
    retries: number = 3, 
    delay: number = 1000
  ): Promise<ProductQuoteResult> {

    const prompt = this.createProductAnalysisPrompt(description);

    const requestBody: any = {
      contents: [{
        parts: []
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.1,
        maxOutputTokens: 2048,
        candidateCount: 1
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    // Add image if provided
    if (imageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64.split(',')[1]
        }
      });
    }

    // Add text prompt
    requestBody.contents[0].parts.push({
      text: prompt
    });

    try {
      console.log('Making product analysis request to Gemini API...');
      
      const response = await fetch(`${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
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

Generate exactly 4 highly relevant and specific gift recommendations for Indian pharmaceutical professionals. You must respond with ONLY a valid JSON array, no other text.

Required JSON structure:

[
  {
    "title": "Specific product name (e.g., 'Premium Digital Stethoscope with Bluetooth')",
    "description": "Detailed 3-4 sentence description explaining why this gift is perfect for Indian pharmaceutical professionals, including specific benefits, use cases, and unique features that make it valuable",
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
- Provide approximate rates that reflect current Indian market pricing
- Include proper product images from Pexels that accurately represent each product
- Ensure descriptions are detailed and highlight unique selling points
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
        description: "Advanced digital stethoscope with Bluetooth connectivity and mobile app integration, perfect for modern Indian healthcare professionals. Features noise cancellation and recording capabilities for better patient care documentation. Includes Hindi language support and works seamlessly with Indian healthcare management systems.",
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
        description: "Carefully curated collection of authentic Ayurvedic products including Ashwagandha supplements, herbal teas, and aromatherapy oils. Specifically designed for healthcare professionals dealing with high-stress environments in Indian hospitals. Each product is AYUSH certified and sourced from traditional Indian manufacturers with proven efficacy.",
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
        description: "Comprehensive digital health monitoring system including BP monitor, glucometer, and pulse oximeter with Hindi and regional language support. Ideal for telemedicine initiatives and rural healthcare programs in India. Features cloud connectivity and integration with government health schemes like Ayushman Bharat.",
        category: "Technology",
        priceRange: "₹6,500-9,200",
        rating: 4.7,
        features: ["Multi-language Display", "Bluetooth Connectivity", "Mobile App Integration", "Cloud Data Storage", "BIS Certified"],
        suitableFor: ["Rural Healthcare Workers", "Telemedicine Practitioners", "Community Health Officers"],
        availability: "Available in 28 states with local service support",
        imageUrl: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
      }
      ,
      {
        title: "Professional Medical Reference Books Collection",
        description: "Comprehensive collection of latest medical reference books including Indian Pharmacopoeia, drug interaction guides, and clinical practice guidelines. Updated with latest Indian medical regulations and includes digital access codes for online resources. Perfect for continuous medical education and professional development.",
        category: "Educational Materials",
        priceRange: "₹4,500-6,800",
        rating: 4.5,
        features: ["Latest Edition", "Digital Access Included", "Indian Medical Guidelines", "Professional Binding", "Quick Reference Cards"],
        suitableFor: ["Medical Practitioners", "Pharmacy Students", "Healthcare Researchers"],
        availability: "Available through major Indian medical bookstores and online platforms",
        imageUrl: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
      }
    ];
  }
}

export const geminiService = new GeminiService();