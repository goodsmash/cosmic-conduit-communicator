import axios from 'axios';
import { mastConfig, MAST_AUTH_SCOPE } from '@/config/mast.config';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
}

class MastAuthService {
  private static generateState() {
    return Math.random().toString(36).substring(2, 15);
  }

  static getAuthUrl() {
    const state = this.generateState();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: mastConfig.clientId,
      redirect_uri: mastConfig.redirectUri,
      scope: MAST_AUTH_SCOPE,
      state
    });

    return `${mastConfig.authUrl}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await axios.post('https://auth.mast.stsci.edu/oauth/token', {
        grant_type: 'authorization_code',
        code,
        client_id: mastConfig.clientId,
        redirect_uri: mastConfig.redirectUri
      });

      if (response.data?.access_token) {
        return response.data.access_token;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post('https://auth.mast.stsci.edu/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: mastConfig.clientId
      });

      if (response.data?.access_token) {
        return response.data.access_token;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  static validateToken(token: string): boolean {
    // Basic validation - check if token is a non-empty string
    // In a real app, you might want to decode and validate the JWT
    return typeof token === 'string' && token.length > 0;
  }

  static async checkAuthStatus(): Promise<AuthState> {
    const token = mastConfig.apiToken;
    
    if (!token) {
      return {
        isAuthenticated: false,
        token: null,
        error: 'No token found'
      };
    }

    if (!this.validateToken(token)) {
      return {
        isAuthenticated: false,
        token: null,
        error: 'Invalid token'
      };
    }

    try {
      // Make a test request to verify token
      const response = await axios.get('https://mast.stsci.edu/api/v0/invoke', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return {
        isAuthenticated: true,
        token,
        error: null
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        token: null,
        error: 'Token validation failed'
      };
    }
  }
}

export default MastAuthService;
