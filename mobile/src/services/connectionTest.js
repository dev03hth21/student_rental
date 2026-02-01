import api from './api';

/**
 * Test API connection
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function testConnection() {
  try {
    console.log('🔍 Testing API connection...');
    console.log('📡 API URL:', api.defaults.baseURL);
    
    const response = await api.get('/rooms', {
      params: { limit: 1 }
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Response status:', response.status);
    console.log('📊 Data received:', response.data ? 'Yes' : 'No');
    
    return {
      success: true,
      message: 'Connected successfully',
      data: response.data
    };
  } catch (error) {
    console.error('❌ Connection failed');
    
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
      return {
        success: false,
        message: `Server error: ${error.response.status}`,
        error: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - No response from server');
      console.error('Request config:', {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        timeout: error.config?.timeout
      });
      return {
        success: false,
        message: 'Cannot connect to server. Please check:\n1. Backend is running on port 5000\n2. You are on the same network\n3. Firewall allows connections',
        error: error.message
      };
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }
}

/**
 * Get current API configuration
 */
export function getApiConfig() {
  return {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers
  };
}
