// Local AI Story Generator - No API Key Required
// Generates contextual card backgrounds and character images using local algorithms

export interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  cardBackground: string;
}

export interface StoryPage {
  id: string;
  title: string;
  text: string;
  theme: Theme;
  characterImage?: string;
  cardBackground?: string;
  pageNumber: number;
  internetImage?: string;
}

// Available themes
export const THEMES: Theme[] = [
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Transform into a magical forest adventure',
    color: '#228B22',
    icon: '🌲',
    cardBackground: 'A beautiful forest background with tall ancient trees, dappled sunlight filtering through leaves, moss-covered rocks, and magical woodland atmosphere. Soft green and brown tones, ethereal lighting, perfect for a children\'s story card.'
  },
  {
    id: 'space',
    name: 'Space Explorer',
    description: 'Journey through the cosmos',
    color: '#4169E1',
    icon: '🚀',
    cardBackground: 'A stunning space background with distant stars, nebulas, planets, and cosmic dust. Deep blues and purples with sparkling stars, perfect for a children\'s space adventure story card.'
  },
  {
    id: 'underwater',
    name: 'Ocean Depths',
    description: 'Dive into underwater adventures',
    color: '#00CED1',
    icon: '🐠',
    cardBackground: 'A magical underwater scene with colorful coral reefs, tropical fish, sea anemones, and flowing seaweed. Blue and turquoise tones with shimmering light effects, perfect for an underwater adventure story card.'
  },
  {
    id: 'medieval',
    name: 'Medieval Kingdom',
    description: 'Step into a medieval fantasy world',
    color: '#8B4513',
    icon: '🏰',
    cardBackground: 'A majestic medieval castle background with stone walls, towers, banners, and a royal courtyard. Rich browns, golds, and deep reds with regal atmosphere, perfect for a medieval adventure story card.'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    description: 'Enter a futuristic cyberpunk world',
    color: '#FF1493',
    icon: '🌃',
    cardBackground: 'A futuristic cyberpunk cityscape with neon lights, holographic displays, and high-tech buildings. Bright pinks, purples, and electric blues with glowing effects, perfect for a cyberpunk adventure story card.'
  },
  {
    id: 'fairy-tale',
    name: 'Fairy Tale',
    description: 'Become part of a magical fairy tale',
    color: '#FF69B4',
    icon: '🧚',
    cardBackground: 'A magical fairy tale background with floating sparkles, enchanted flowers, rainbow colors, and whimsical elements. Soft pastels with magical glow effects, perfect for a fairy tale story card.'
  },
  {
    id: 'steampunk',
    name: 'Steampunk Adventure',
    description: 'Explore a Victorian steampunk world',
    color: '#CD853F',
    icon: '⚙️',
    cardBackground: 'A Victorian steampunk workshop background with brass gears, steam pipes, copper machinery, and industrial elements. Warm browns, coppers, and brass tones with mechanical details, perfect for a steampunk adventure story card.'
  },
  {
    id: 'superhero',
    name: 'Superhero',
    description: 'Become a powerful superhero',
    color: '#DC143C',
    icon: '🦸',
    cardBackground: 'A dynamic superhero cityscape background with skyscrapers, dramatic clouds, and heroic atmosphere. Bold reds, blues, and golds with action-packed energy, perfect for a superhero adventure story card.'
  }
];

export class LocalAIService {
  /**
   * Generate dynamic story content based on theme and child name
   */
  static generateStoryContent(theme: Theme, childName: string, length: 'short' | 'medium' | 'long' = 'medium'): Array<{ title: string; text: string }> {
    const storyTemplates = {
      forest: {
        characters: ['wise owl', 'playful squirrel', 'mysterious deer', 'ancient tree spirit', 'friendly rabbit', 'magical butterfly'],
        locations: ['ancient oak grove', 'crystal-clear stream', 'hidden waterfall', 'moonlit meadow', 'whispering willow', 'enchanted glade'],
        events: ['discovered a magical portal', 'helped a lost animal', 'solved a forest mystery', 'learned ancient wisdom', 'made new friends', 'protected the forest'],
        objects: ['glowing crystal', 'magical acorn', 'enchanted flower', 'wise old book', 'mystical stone', 'golden leaf'],
        emotions: ['wonder', 'joy', 'courage', 'friendship', 'wisdom', 'peace'],
        lessons: ['the importance of protecting nature', 'the power of friendship', 'the value of courage', 'the beauty of kindness', 'the magic of believing', 'the strength of unity']
      },
      space: {
        characters: ['friendly alien', 'robot companion', 'space captain', 'cosmic guide', 'star navigator', 'galaxy guardian'],
        locations: ['distant planet', 'space station', 'nebula cloud', 'asteroid field', 'moon base', 'cosmic garden'],
        events: ['discovered a new world', 'solved a space mystery', 'helped alien friends', 'explored a nebula', 'saved a planet', 'learned cosmic secrets'],
        objects: ['crystal communicator', 'star map', 'cosmic compass', 'energy crystal', 'space suit', 'galaxy key'],
        emotions: ['excitement', 'wonder', 'bravery', 'curiosity', 'friendship', 'discovery'],
        lessons: ['the vastness of the universe', 'the importance of exploration', 'the power of friendship across galaxies', 'the value of curiosity', 'the beauty of discovery', 'the unity of all beings']
      },
      underwater: {
        characters: ['wise dolphin', 'playful octopus', 'mysterious mermaid', 'ancient sea turtle', 'friendly whale', 'magical seahorse'],
        locations: ['coral reef', 'underwater cave', 'sunken ship', 'kelp forest', 'deep trench', 'tropical lagoon'],
        events: ['discovered a hidden treasure', 'helped sea creatures', 'solved an ocean mystery', 'learned underwater secrets', 'made aquatic friends', 'protected marine life'],
        objects: ['pearl necklace', 'coral crown', 'sea shell', 'treasure chest', 'magical trident', 'ocean crystal'],
        emotions: ['amazement', 'joy', 'courage', 'friendship', 'wonder', 'peace'],
        lessons: ['the importance of ocean conservation', 'the beauty of marine life', 'the power of underwater friendship', 'the value of protecting nature', 'the magic of the deep sea', 'the harmony of ocean creatures']
      },
      medieval: {
        characters: ['brave knight', 'wise wizard', 'noble princess', 'friendly dragon', 'loyal squire', 'mysterious hermit'],
        locations: ['ancient castle', 'enchanted forest', 'mystical tower', 'royal court', 'dragon\'s cave', 'magical kingdom'],
        events: ['saved the kingdom', 'discovered ancient magic', 'made noble friends', 'solved a royal mystery', 'helped a dragon', 'learned chivalry'],
        objects: ['magical sword', 'royal crown', 'ancient scroll', 'dragon scale', 'knight\'s shield', 'wizard\'s staff'],
        emotions: ['honor', 'courage', 'nobility', 'friendship', 'wisdom', 'chivalry'],
        lessons: ['the importance of honor', 'the power of courage', 'the value of friendship', 'the beauty of chivalry', 'the strength of unity', 'the wisdom of the ages']
      },
      cyberpunk: {
        characters: ['cyber hacker', 'robot companion', 'neon warrior', 'digital guide', 'tech wizard', 'cyber guardian'],
        locations: ['neon city', 'cyber cafe', 'virtual world', 'tech lab', 'digital realm', 'holographic space'],
        events: ['hacked the system', 'solved a cyber mystery', 'helped digital friends', 'explored virtual worlds', 'saved the network', 'learned tech secrets'],
        objects: ['neural interface', 'holographic device', 'cyber implant', 'digital key', 'energy core', 'tech gadget'],
        emotions: ['excitement', 'curiosity', 'innovation', 'friendship', 'discovery', 'progress'],
        lessons: ['the power of technology', 'the importance of innovation', 'the value of digital friendship', 'the beauty of progress', 'the magic of virtual worlds', 'the unity of human and machine']
      },
      'fairy-tale': {
        characters: ['kind fairy', 'magical unicorn', 'wise owl', 'enchanted prince', 'mystical creature', 'fairy godmother'],
        locations: ['enchanted garden', 'fairy kingdom', 'magical forest', 'crystal palace', 'rainbow bridge', 'starlit meadow'],
        events: ['received a magical blessing', 'discovered fairy magic', 'helped magical creatures', 'solved an enchantment', 'made fairy friends', 'learned ancient spells'],
        objects: ['fairy wand', 'magical crystal', 'enchanted flower', 'golden key', 'mystical amulet', 'fairy dust'],
        emotions: ['wonder', 'joy', 'magic', 'friendship', 'enchantment', 'happiness'],
        lessons: ['the power of magic', 'the importance of kindness', 'the value of fairy friendship', 'the beauty of enchantment', 'the magic of believing', 'the joy of wonder']
      },
      steampunk: {
        characters: ['steam engineer', 'clockwork companion', 'brass inventor', 'gear master', 'steam pilot', 'mechanical genius'],
        locations: ['steam workshop', 'clockwork city', 'brass laboratory', 'gear factory', 'steam airship', 'mechanical garden'],
        events: ['invented a machine', 'solved a mechanical puzzle', 'helped steam friends', 'explored clockwork worlds', 'saved the city', 'learned engineering secrets'],
        objects: ['brass gear', 'steam engine', 'clockwork device', 'mechanical tool', 'steam whistle', 'gear mechanism'],
        emotions: ['innovation', 'precision', 'creativity', 'friendship', 'invention', 'progress'],
        lessons: ['the power of invention', 'the importance of precision', 'the value of mechanical friendship', 'the beauty of engineering', 'the magic of steam power', 'the unity of man and machine']
      },
      superhero: {
        characters: ['superhero mentor', 'sidekick companion', 'heroic ally', 'wise mentor', 'brave friend', 'superhero team'],
        locations: ['hero headquarters', 'city skyline', 'secret base', 'heroic training ground', 'superhero academy', 'metropolitan city'],
        events: ['saved the city', 'discovered superpowers', 'helped citizens', 'solved a hero mystery', 'made heroic friends', 'learned hero wisdom'],
        objects: ['superhero cape', 'power ring', 'heroic mask', 'super gadget', 'energy crystal', 'heroic emblem'],
        emotions: ['heroism', 'courage', 'justice', 'friendship', 'bravery', 'inspiration'],
        lessons: ['the power of heroism', 'the importance of justice', 'the value of heroic friendship', 'the beauty of courage', 'the magic of superpowers', 'the strength of unity']
      }
    };

    const template = storyTemplates[theme.id as keyof typeof storyTemplates] || storyTemplates.forest;
    
    // Generate dynamic story pages based on length
    const pageCount = length === 'short' ? 5 : length === 'medium' ? 7 : 15;
    const stories: Array<{ title: string; text: string }> = [];
    
    for (let i = 0; i < pageCount; i++) {
      const story = this.generateDynamicStoryPage(template, childName, i + 1, pageCount);
      stories.push(story);
    }
    
    return stories;
  }

  /**
   * Generate a dynamic story page using AI-like logic
   */
  private static generateDynamicStoryPage(
    template: any, 
    childName: string, 
    pageNumber: number, 
    totalPages: number
  ): { title: string; text: string } {
    // Create unique seed based on child name, page number, and current time
    const seed = this.createSeed(childName, pageNumber);
    
    // Generate random elements using the seed
    const character = this.getRandomElement(template.characters, seed + 1);
    const location = this.getRandomElement(template.locations, seed + 2);
    const event = this.getRandomElement(template.events, seed + 3);
    const object = this.getRandomElement(template.objects, seed + 4);
    const emotion = this.getRandomElement(template.emotions, seed + 5);
    const lesson = this.getRandomElement(template.lessons, seed + 6);
    
    // Generate title based on page number and theme
    const title = this.generateDynamicTitle(pageNumber, totalPages, event, character);
    
    // Generate story text with dynamic elements
    const text = this.generateDynamicText(childName, character, location, event, object, emotion, lesson, pageNumber, totalPages);
    
    return { title, text };
  }

  /**
   * Create a unique seed for randomization
   */
  private static createSeed(childName: string, pageNumber: number): number {
    let seed = 0;
    for (let i = 0; i < childName.length; i++) {
      seed += childName.charCodeAt(i);
    }
    seed += pageNumber * 7;
    seed += Date.now() % 1000; // Add time component for uniqueness
    return seed;
  }

  /**
   * Get random element from array using seed
   */
  private static getRandomElement(array: string[], seed: number): string {
    const index = seed % array.length;
    return array[index];
  }

  /**
   * Generate dynamic title
   */
  private static generateDynamicTitle(pageNumber: number, totalPages: number, event: string, character: string): string {
    const titleTemplates = [
      `The ${character.charAt(0).toUpperCase() + character.slice(1)}'s ${event.charAt(0).toUpperCase() + event.slice(1)}`,
      `Adventure in the ${event}`,
      `Meeting the ${character}`,
      `The ${event} Begins`,
      `A ${character} Encounter`,
      `The ${event} Mystery`,
      `Journey to the ${event}`,
      `The ${character} and the ${event}`
    ];
    
    const seed = pageNumber + totalPages;
    const template = titleTemplates[seed % titleTemplates.length];
    return template;
  }

  /**
   * Generate dynamic story text
   */
  private static generateDynamicText(
    childName: string, 
    character: string, 
    location: string, 
    event: string, 
    object: string, 
    emotion: string, 
    lesson: string, 
    pageNumber: number, 
    totalPages: number
  ): string {
    const storyTemplates = [
      `In the ${location}, ${childName} met a ${character} who ${event}. Together, they discovered a ${object} that filled their hearts with ${emotion}. Through this adventure, ${childName} learned ${lesson}.`,
      `${childName} found themselves in a magical ${location} where they encountered a friendly ${character}. When they ${event}, they discovered the power of ${object} and felt overwhelming ${emotion}. This experience taught them ${lesson}.`,
      `Deep in the ${location}, ${childName} had an amazing adventure with a wise ${character}. As they ${event}, they found a special ${object} that brought them great ${emotion}. Through this journey, ${childName} understood ${lesson}.`,
      `While exploring the ${location}, ${childName} made friends with a kind ${character}. Together, they ${event} and discovered a magical ${object}. This wonderful experience filled them with ${emotion} and taught them ${lesson}.`,
      `In the heart of the ${location}, ${childName} encountered a mysterious ${character}. When they ${event}, they found an incredible ${object} that sparked feelings of ${emotion}. This adventure helped them learn ${lesson}.`
    ];
    
    const seed = childName.length + pageNumber;
    const template = storyTemplates[seed % storyTemplates.length];
    
    // Add page-specific context
    if (pageNumber === 1) {
      return `Once upon a time, ${template}`;
    } else if (pageNumber === totalPages) {
      return `${template} And so, ${childName}'s amazing adventure came to a wonderful end, but the memories and lessons would last forever.`;
    } else {
      return `Continuing their journey, ${template}`;
    }
  }

  /**
   * Generate contextual card background based on story content
   */
  static generateCardBackground(theme: Theme, storyText: string): string {
    // Extract keywords from story text
    const keywords = this.extractKeywordsFromStory(storyText);
    
    // Create contextual background description
    let backgroundDescription = theme.cardBackground;
    
    if (keywords.length > 0) {
      backgroundDescription += ` The scene includes elements from the story: ${keywords.join(', ')}.`;
    }
    
    return backgroundDescription;
  }

  /**
   * Generate character image description based on theme
   */
  static generateCharacterImage(theme: Theme, childName: string): string {
    const characterDescriptions = {
      forest: `${childName} as a forest guardian wearing earth-toned clothing with leaf patterns, surrounded by woodland creatures and magical forest elements.`,
      space: `${childName} as a space explorer in a futuristic spacesuit with glowing elements, floating among stars and cosmic phenomena.`,
      underwater: `${childName} as an underwater explorer in diving gear or mermaid attire, surrounded by colorful coral reefs and sea creatures.`,
      medieval: `${childName} as a brave knight in medieval armor with a sword and shield, standing in front of a majestic castle.`,
      cyberpunk: `${childName} as a cyber hero in futuristic clothing with neon accents and tech accessories, in a high-tech cityscape.`,
      'fairy-tale': `${childName} as a magical character with fairy wings and sparkly clothing, in an enchanted garden with magical creatures.`,
      steampunk: `${childName} as a steam inventor in Victorian-era clothing with brass goggles and mechanical accessories, in a workshop.`,
      superhero: `${childName} as a superhero in a colorful costume with a cape, in a dynamic pose against a city skyline.`
    };

    return characterDescriptions[theme.id as keyof typeof characterDescriptions] || characterDescriptions.forest;
  }

  /**
   * Generate complete story with local AI
   */
  static generateCompleteStory(
    personName: string,
    selectedTheme: Theme,
    storyContent: Array<{ title: string; text: string }>
  ): StoryPage[] {
    const completePages: StoryPage[] = [];

    storyContent.forEach((page, index) => {
      const storyPage: StoryPage = {
        id: `page_${index + 1}`,
        title: page.title,
        text: page.text,
        theme: selectedTheme,
        characterImage: this.generateCharacterImage(selectedTheme, personName),
        cardBackground: this.generateCardBackground(selectedTheme, page.text),
        pageNumber: index + 1,
        internetImage: this.getThemedImageUrl(selectedTheme.id, index + 1),
      };

      completePages.push(storyPage);
    });

    return completePages;
  }

  /**
   * Get themed image URL for a specific page
   */
  private static getThemedImageUrl(themeId: string, pageNumber: number): string {
    const themedImages = {
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
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
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

    const images = themedImages[themeId as keyof typeof themedImages] || themedImages.forest;
    const imageIndex = (pageNumber - 1) % images.length;
    return images[imageIndex];
  }

  /**
   * Extract keywords from story text for contextual background generation
   */
  private static extractKeywordsFromStory(storyText: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'];
    
    const words = storyText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    // Return unique keywords, limited to 5 most relevant
    return [...new Set(words)].slice(0, 5);
  }

  /**
   * Get theme by ID
   */
  static getThemeById(themeId: string): Theme | undefined {
    return THEMES.find(theme => theme.id === themeId);
  }

  /**
   * Get all available themes
   */
  static getAllThemes(): Theme[] {
    return THEMES;
  }
}
