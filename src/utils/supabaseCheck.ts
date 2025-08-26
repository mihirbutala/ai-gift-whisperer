export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('📋 Environment Variables:');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Test basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🌐 Connection Test:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      return { success: true, message: 'Connection successful' };
    } else {
      const errorText = await response.text();
      console.log('❌ Connection failed:', errorText);
      return { success: false, message: `Connection failed: ${response.status} ${response.statusText}` };
    }
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown connection error' 
    };
  }
};

export const checkSupabaseAuth = async () => {
  try {
    console.log('🔐 Checking Supabase Auth...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Test auth endpoint
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    console.log('🔐 Auth Test:');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const settings = await response.json();
      console.log('✅ Auth endpoint accessible!');
      console.log('Auth settings:', settings);
      return { success: true, message: 'Auth endpoint accessible', data: settings };
    } else {
      const errorText = await response.text();
      console.log('❌ Auth check failed:', errorText);
      return { success: false, message: `Auth check failed: ${response.status}` };
    }
    
  } catch (error) {
    console.error('❌ Supabase auth check error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown auth error' 
    };
  }
};