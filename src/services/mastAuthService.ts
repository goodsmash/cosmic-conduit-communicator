import axios from 'axios'

const MAST_API_URL = 'https://mast.stsci.edu/api/v0'
const MAST_TOKEN = '8270ee02c1884d66a8cf890ccc23c487'

export interface MASTUserProfile {
  username: string
  email?: string
  permissions: string[]
  dataRights: string[]
}

class MASTAuthService {
  private token: string = MAST_TOKEN
  private userProfile: MASTUserProfile | null = null
  private axiosInstance = axios.create({
    baseURL: MAST_API_URL,
    headers: {
      'Authorization': `Token ${MAST_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  constructor() {
    // Initialize with stored token if available
    const storedToken = localStorage.getItem('mast_token')
    if (storedToken) {
      this.token = storedToken
      this.updateAxiosHeaders(storedToken)
    }
  }

  private updateAxiosHeaders(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Token ${token}`
  }

  async initialize() {
    if (!this.userProfile) {
      await this.fetchUserProfile()
    }
    return this.isAuthenticated()
  }

  async fetchUserProfile(): Promise<MASTUserProfile> {
    try {
      const response = await this.axiosInstance.post('/invoke', {
        service: 'Mast.User.Info',
        params: {},
        format: 'json'
      })

      this.userProfile = {
        username: response.data.username || 'Guest',
        email: response.data.email,
        permissions: ['mast:user:info', 'mast:exclusive_access'],
        dataRights: response.data.data_rights || []
      }

      return this.userProfile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.token && this.userProfile)
  }

  getAccessToken(): string {
    return this.token
  }

  getUserProfile(): MASTUserProfile | null {
    return this.userProfile
  }

  hasPermission(permission: string): boolean {
    return this.userProfile?.permissions.includes(permission) || false
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.axiosInstance.post('/invoke', {
        service: 'Mast.User.Info',
        params: {},
        format: 'json'
      })
      return true
    } catch (error) {
      return false
    }
  }

  async checkDataRights(dataset: string): Promise<boolean> {
    if (!this.userProfile) return false
    
    try {
      const response = await this.axiosInstance.post('/invoke', {
        service: 'Mast.User.Access',
        params: {
          dataset
        },
        format: 'json'
      })
      
      return response.data.hasAccess || false
    } catch (error) {
      console.error('Failed to check data rights:', error)
      return false
    }
  }

  logout() {
    this.token = ''
    this.userProfile = null
    localStorage.removeItem('mast_token')
    this.updateAxiosHeaders('')
  }
}

export const mastAuthService = new MASTAuthService()
