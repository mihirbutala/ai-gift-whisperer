import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Database, Shield } from 'lucide-react';
import { checkSupabaseConnection, checkSupabaseAuth } from '@/utils/supabaseCheck';

interface ConnectionStatus {
  success: boolean;
  message: string;
  data?: any;
}

export const SupabaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [authStatus, setAuthStatus] = useState<ConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = async () => {
    setIsChecking(true);
    
    try {
      const [connResult, authResult] = await Promise.all([
        checkSupabaseConnection(),
        checkSupabaseAuth()
      ]);
      
      setConnectionStatus(connResult);
      setAuthStatus(authResult);
    } catch (error) {
      console.error('Error running checks:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: ConnectionStatus | null) => {
    if (!status) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return status.success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: ConnectionStatus | null) => {
    if (!status) return <Badge variant="secondary">Checking...</Badge>;
    return status.success ? 
      <Badge variant="default" className="bg-green-500">Connected</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Supabase Connection Status</h3>
        <Button 
          onClick={runChecks} 
          disabled={isChecking}
          variant="outline"
          size="sm"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {/* Database Connection */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Database Connection</p>
              <p className="text-sm text-muted-foreground">
                {connectionStatus?.message || 'Checking connection...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            {getStatusBadge(connectionStatus)}
          </div>
        </div>

        {/* Auth Service */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Authentication Service</p>
              <p className="text-sm text-muted-foreground">
                {authStatus?.message || 'Checking auth service...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(authStatus)}
            {getStatusBadge(authStatus)}
          </div>
        </div>
      </div>

      {/* Environment Variables Check */}
      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <h4 className="font-medium mb-2">Environment Variables</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>VITE_SUPABASE_URL:</span>
            <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
              {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>VITE_SUPABASE_ANON_KEY:</span>
            <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {(connectionStatus?.success === false || authStatus?.success === false) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Debug Information</h4>
          <div className="text-sm text-red-700 space-y-1">
            <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
            <p>Check your .env file and restart the development server if needed.</p>
          </div>
        </div>
      )}
    </Card>
  );
};