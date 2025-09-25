import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, StorySettings } from '../types/StoryTypes';

type StorySettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StorySettings'>;
type StorySettingsScreenRouteProp = RouteProp<RootStackParamList, 'StorySettings'>;

interface Props {
  navigation: StorySettingsScreenNavigationProp;
  route: StorySettingsScreenRouteProp;
}

const StorySettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childInfo } = route.params;
  const [settings, setSettings] = useState<StorySettings>({
    readingLength: 'medium',
    storyType: 'superhero',
    theme: 'light',
  });

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
  };
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const secondaryTextColor = isDarkMode ? '#cccccc' : '#666666';

  const readingLengths = [
    { key: 'short', label: 'Short (5 minutes)', description: 'Perfect for bedtime' },
    { key: 'medium', label: 'Medium (10 minutes)', description: 'Great for story time' },
    { key: 'long', label: 'Long (15+ minutes)', description: 'Full adventure experience' },
  ] as const;

  const storyTypes = [
    { key: 'superhero', label: 'Superhero', emoji: '🦸', description: 'Your child becomes the hero' },
    { key: 'adventure', label: 'Adventure', emoji: '🗺️', description: 'Epic quests and discoveries' },
    { key: 'fantasy', label: 'Fantasy', emoji: '🧙', description: 'Magic and mystical creatures' },
    { key: 'fairy-tale', label: 'Fairy Tale', emoji: '🏰', description: 'Classic tales with a twist' },
    { key: 'space', label: 'Space Adventure', emoji: '🚀', description: 'Journey through the stars' },
  ] as const;

  const handleGenerateStory = () => {
    // In a real app, this would call an AI service to generate the story
    // For now, we'll create a mock story
    const mockStory = {
      id: Date.now().toString(),
      title: `${childInfo.name}'s ${storyTypes.find(t => t.key === settings.storyType)?.label} Adventure`,
      childName: childInfo.name,
      settings,
      pages: [
        {
          id: '1',
          text: `Once upon a time, there was a brave young hero named ${childInfo.name}.`,
          pageNumber: 1,
        },
        {
          id: '2',
          text: `${childInfo.name} discovered they had amazing superpowers and could help everyone in need.`,
          pageNumber: 2,
        },
        {
          id: '3',
          text: `And so ${childInfo.name} became the greatest superhero the world had ever known!`,
          pageNumber: 3,
        },
      ],
      createdAt: new Date(),
      isCompleted: false,
    };

    navigation.navigate('StoryDisplay', { story: mockStory });
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            Story Settings
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            Customize {childInfo.name}'s story
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Reading Length
          </Text>
          {readingLengths.map((length) => (
            <TouchableOpacity
              key={length.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: settings.readingLength === length.key 
                    ? '#007AFF' 
                    : isDarkMode ? '#2a2a2a' : '#ffffff',
                  borderColor: isDarkMode ? '#444' : '#ddd',
                }
              ]}
              onPress={() => setSettings(prev => ({ ...prev, readingLength: length.key }))}
            >
              <Text style={[
                styles.optionTitle,
                { color: settings.readingLength === length.key ? '#ffffff' : textColor }
              ]}>
                {length.label}
              </Text>
              <Text style={[
                styles.optionDescription,
                { color: settings.readingLength === length.key ? '#e6f3ff' : secondaryTextColor }
              ]}>
                {length.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Story Type
          </Text>
          {storyTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: settings.storyType === type.key 
                    ? '#007AFF' 
                    : isDarkMode ? '#2a2a2a' : '#ffffff',
                  borderColor: isDarkMode ? '#444' : '#ddd',
                }
              ]}
              onPress={() => setSettings(prev => ({ ...prev, storyType: type.key }))}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{type.emoji}</Text>
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionTitle,
                    { color: settings.storyType === type.key ? '#ffffff' : textColor }
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    { color: settings.storyType === type.key ? '#e6f3ff' : secondaryTextColor }
                  ]}>
                    {type.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateStory}
        >
          <Text style={styles.generateButtonText}>
            Generate {childInfo.name}'s Story
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StorySettingsScreen;
