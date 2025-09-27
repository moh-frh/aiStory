// Image Service - Fetches themed images from internet
// Uses Unsplash API for high-quality, themed images

export interface ImageSearchResult {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  description: string;
}

export class ImageService {
  private static readonly UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to get this from unsplash.com
  private static readonly UNSPLASH_BASE_URL = 'https://api.unsplash.com';
  
  // Fallback images for each theme (using placeholder services)
  private static readonly FALLBACK_IMAGES = {
    forest: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-14b8e128d6ba?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop'
    ],
    space: [
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop'
    ],
    underwater: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    ],
    medieval: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    cyberpunk: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    'fairy-tale': [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    steampunk: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    superhero: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ]
  };

  /**
   * Get themed images for a story page
   */
  static async getThemedImages(themeId: string, pageNumber: number): Promise<string[]> {
    try {
      // For now, return fallback images
      // In production, you would use the Unsplash API
      const fallbackImages = this.FALLBACK_IMAGES[themeId as keyof typeof this.FALLBACK_IMAGES] || this.FALLBACK_IMAGES.forest;
      
      // Return a random image for this page
      const randomIndex = pageNumber % fallbackImages.length;
      return [fallbackImages[randomIndex]];
      
    } catch (error) {
      console.error('Error fetching themed images:', error);
      return [this.getDefaultImage(themeId)];
    }
  }

  /**
   * Search for images using Unsplash API (requires API key)
   */
  static async searchImages(query: string, count: number = 3): Promise<string[]> {
    try {
      // This would be the actual Unsplash API call
      // const response = await fetch(
      //   `${this.UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${this.UNSPLASH_ACCESS_KEY}`
      // );
      // const data = await response.json();
      // return data.results.map((result: ImageSearchResult) => result.urls.regular);
      
      // For now, return fallback
      return [this.getDefaultImage('forest')];
    } catch (error) {
      console.error('Error searching images:', error);
      return [this.getDefaultImage('forest')];
    }
  }

  /**
   * Get theme-specific search queries
   */
  static getThemeSearchQueries(themeId: string): string[] {
    const queries = {
      forest: ['magical forest', 'enchanted woods', 'fairy tale forest'],
      space: ['space exploration', 'cosmic adventure', 'galaxy stars'],
      underwater: ['underwater world', 'ocean depths', 'coral reef'],
      medieval: ['medieval castle', 'knight adventure', 'fantasy kingdom'],
      cyberpunk: ['futuristic city', 'cyberpunk neon', 'digital world'],
      'fairy-tale': ['fairy tale magic', 'enchanted garden', 'magical creatures'],
      steampunk: ['steampunk workshop', 'victorian machinery', 'brass gears'],
      superhero: ['superhero city', 'heroic adventure', 'comic book style']
    };

    return queries[themeId as keyof typeof queries] || queries.forest;
  }

  /**
   * Get a default image for a theme
   */
  private static getDefaultImage(themeId: string): string {
    const defaultImages = {
      forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      space: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
      underwater: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      medieval: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      cyberpunk: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'fairy-tale': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      steampunk: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      superhero: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    };

    return defaultImages[themeId as keyof typeof defaultImages] || defaultImages.forest;
  }

  /**
   * Get a random themed image for a specific page
   */
  static getRandomThemedImage(themeId: string, pageNumber: number): string {
    const fallbackImages = this.FALLBACK_IMAGES[themeId as keyof typeof this.FALLBACK_IMAGES] || this.FALLBACK_IMAGES.forest;
    const randomIndex = pageNumber % fallbackImages.length;
    return fallbackImages[randomIndex];
  }
}

