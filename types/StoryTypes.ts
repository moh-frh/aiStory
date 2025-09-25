export interface ChildInfo {
  name: string;
  photoUri?: string;
}

export interface StorySettings {
  readingLength: 'short' | 'medium' | 'long';
  storyType: 'adventure' | 'fantasy' | 'superhero' | 'fairy-tale' | 'space';
  theme: 'light' | 'dark';
}

export interface StoryPage {
  id: string;
  title: string;
  text: string;
  illustrationUri?: string;
  pageNumber: number;
}

export interface Story {
  id: string;
  title: string;
  childName: string;
  settings: StorySettings;
  pages: StoryPage[];
  createdAt: Date;
  isCompleted: boolean;
}

export interface StoryGenerationRequest {
  childInfo: ChildInfo;
  settings: StorySettings;
}

export type RootStackParamList = {
  Home: undefined;
  StorySettings: { childInfo: ChildInfo };
  StoryDisplay: { story: Story };
  StoryHistory: undefined;
};
