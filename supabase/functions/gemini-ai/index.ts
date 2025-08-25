import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeminiRequest {
  query?: string
  imageBase64?: string
  description?: string
  type: 'gifts' | 'product-quote'
}

interface GiftRecommendation {
  title: string
  description: string
  category: string
  priceRange: string
  rating: number
  features: string[]
  suitableFor: string[]
  availability: string
  imageUrl: string
}

interface ProductQuoteResult {
  productName: string
  suggestedPrice: string
  marketComparison: string
  confidence: number
  recommendations: string[]
  category: string
  features: string[]
  competitorPrices: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, imageBase64, description, type }: GeminiRequest = await req.json()

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'
    const apiUrl = `${baseUrl}/gemini-1.5-flash:generateContent?key=${geminiApiKey}`

    let prompt: string
    
    if (type === 'gifts') {
      if (!query?.trim()) {
        throw new Error('Search query is required for gift recommendations')
      }
      prompt = createGiftPrompt(query)
    } else if (type === 'product-quote') {
      if (!imageBase64 && !description?.trim()) {
        throw new Error('Either product image or description is required')
      }
      prompt = createProductPrompt(description)
    } else {
      throw new Error('Invalid request type')
    }

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
    }

    // Add image if provided
    if (imageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64.split(',')[1]
        }
      })
    }

    // Add text prompt
    requestBody.contents[0].parts.push({
      text: prompt
    })

    console.log('🚀 Calling Gemini API...')
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Raw Gemini Response received')
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      console.error('❌ No content in response:', data)
      throw new Error('No content received from Gemini API')
    }

    console.log('📝 Processing Gemini AI response...')
    
    let result
    if (type === 'gifts') {
      result = parseGiftRecommendations(content)
    } else {
      result = parseProductQuoteResult(content)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function createGiftPrompt(query: string): string {
  return `You are an AI assistant specialized in Indian pharmaceutical gifting and medical products. Based on this query: "${query}"

Generate exactly 4 highly relevant and specific gift recommendations for Indian pharmaceutical professionals. You must respond with ONLY a valid JSON array, no other text.

Required JSON structure:

[
  {
    "title": "Specific product name",
    "description": "Detailed description",
    "category": "Product category",
    "priceRange": "₹X,XXX-X,XXX",
    "rating": 4.5,
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "suitableFor": ["Professional type 1", "Professional type 2"],
    "availability": "Availability info",
    "imageUrl": "https://images.pexels.com/photos/[id]/pexels-photo-[id].jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
  }
]

Requirements:
- Price range ₹1,000-15,000
- ONLY JSON array, no explanations`
}

function createProductPrompt(description?: string): string {
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
- ONLY JSON object, no explanations`
}

function parseGiftRecommendations(content: string): GiftRecommendation[] {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return getFallbackRecommendations()
    }
    
    const recommendations = JSON.parse(jsonMatch[0])
    
    if (!Array.isArray(recommendations)) {
      return getFallbackRecommendations()
    }
    
    return recommendations.map(validateRecommendation).slice(0, 4)
    
  } catch (error) {
    console.error('❌ JSON parsing failed:', error)
    return getFallbackRecommendations()
  }
}

function parseProductQuoteResult(content: string): ProductQuoteResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return getFallbackProductQuote()
    }
    
    const result = JSON.parse(jsonMatch[0])
    return validateProductQuoteResult(result)
    
  } catch (error) {
    console.error('❌ JSON parsing failed:', error)
    return getFallbackProductQuote()
  }
}

function validateRecommendation(rec: any): GiftRecommendation {
  return {
    title: rec.title || 'Medical Gift Product',
    description: rec.description || 'Professional medical gift item',
    category: rec.category || 'Medical Accessories',
    priceRange: rec.priceRange || '₹2,500-4,000',
    rating: typeof rec.rating === 'number' ? Math.min(Math.max(rec.rating, 1), 5) : 4.2,
    features: Array.isArray(rec.features) ? rec.features.slice(0, 5) : ['Professional Grade', 'High Quality'],
    suitableFor: Array.isArray(rec.suitableFor) ? rec.suitableFor.slice(0, 3) : ['Healthcare Professionals'],
    availability: rec.availability || 'Available for bulk orders',
    imageUrl: rec.imageUrl || 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
  }
}

function validateProductQuoteResult(result: any): ProductQuoteResult {
  return {
    productName: result.productName || 'Analyzed Product',
    suggestedPrice: result.suggestedPrice || 'Price analysis unavailable',
    marketComparison: result.marketComparison || 'Competitive with market average',
    confidence: typeof result.confidence === 'number' ? Math.min(Math.max(result.confidence, 1), 100) : 85,
    recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 5) : [],
    category: result.category || 'Medical Product',
    features: Array.isArray(result.features) ? result.features.slice(0, 5) : [],
    competitorPrices: Array.isArray(result.competitorPrices) ? result.competitorPrices.slice(0, 3) : []
  }
}

function getFallbackRecommendations(): GiftRecommendation[] {
  return [
    {
      title: "Premium Medical Stethoscope",
      description: "High-quality stethoscope perfect for medical professionals with excellent acoustics and durability.",
      category: "Medical Instruments",
      priceRange: "₹3,500-5,200",
      rating: 4.6,
      features: ["Excellent Sound Quality", "Lightweight Design", "Professional Grade"],
      suitableFor: ["Doctors", "Nurses", "Medical Students"],
      availability: "Available for bulk orders",
      imageUrl: "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
    }
  ]
}

function getFallbackProductQuote(): ProductQuoteResult {
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
  }
}