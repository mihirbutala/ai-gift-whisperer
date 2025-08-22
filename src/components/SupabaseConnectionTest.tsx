import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    hasAnonKey: false
  });

  useEffect(() => {
    // Check if Supabase is configured
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    setSupabaseConfig({
      url: url,
      hasAnonKey: !!anonKey
    });
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('user_searches')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase connection error:', error);
        setErrorMessage(error.message);
        setConnectionStatus('error');
      } else {
        console.log('Supabase connection successful');
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setConnectionStatus('error');
    }
  };

  const testAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Supabase Connection Test</h3>
      
      {/* Configuration Status */}
      <div className="space-y-2">
        <h4 className="font-medium">Configuration Status:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            {supabaseConfig.url ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Supabase URL: {supabaseConfig.url || 'Not configured'}</span>
          </div>
          <div className="flex items-center gap-2">
            {supabaseConfig.hasAnonKey ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Anon Key: {supabaseConfig.hasAnonKey ? 'Configured' : 'Not configured'}</span>
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button 
            onClick={testConnection} 
            disabled={connectionStatus === 'testing' || !supabaseConfig.url || !supabaseConfig.hasAnonKey}
            size="sm"
          >
            {connectionStatus === 'testing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          
          <Button onClick={testAuth} variant="outline" size="sm">
            Test Auth
          </Button>
        </div>

        {/* Connection Status */}
        {connectionStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-sm">
            {connectionStatus === 'testing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span>Testing connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Connected successfully!</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Connection failed</span>
              </>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Error Details:</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {(!supabaseConfig.url || !supabaseConfig.hasAnonKey) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Setup Required:</p>
              <ol className="mt-1 list-decimal list-inside space-y-1">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                <li>Copy your project URL and anon key</li>
                <li>Add them to your .env file as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                <li>Create the required database tables (user_searches, user_profiles)</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};