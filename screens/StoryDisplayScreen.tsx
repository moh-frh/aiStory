import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Image,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Story } from '../types/StoryTypes';

type StoryDisplayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StoryDisplay'>;
type StoryDisplayScreenRouteProp = RouteProp<RootStackParamList, 'StoryDisplay'>;

interface Props {
  navigation: StoryDisplayScreenNavigationProp;
  route: StoryDisplayScreenRouteProp;
}

const { width: screenWidth } = Dimensions.get('window');

const StoryDisplayScreen: React.FC<Props> = ({ navigation, route }) => {
  const { story } = route.params;
  const [currentPage, setCurrentPage] = useState(0);
  
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
  };
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const secondaryTextColor = isDarkMode ? '#cccccc' : '#666666';

  const currentPageData = story.pages[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === story.pages.length - 1;

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
    } else {
      // Story completed
      navigation.navigate('Home');
    }
  };

  const handleRestart = () => {
    setCurrentPage(0);
  };

  const getStoryTypeEmoji = (storyType: string) => {
    const emojis: { [key: string]: string } = {
      superhero: '🦸',
      adventure: '🗺️',
      fantasy: '🧙',
      'fairy-tale': '🏰',
      space: '🚀',
    };
    return emojis[storyType] || '📖';
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: '#007AFF' }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.storyTitle, { color: textColor }]}>
            {story.title}
          </Text>
          <Text style={[styles.storyType, { color: secondaryTextColor }]}>
            {getStoryTypeEmoji(story.settings.storyType)} {story.settings.storyType.charAt(0).toUpperCase() + story.settings.storyType.slice(1)} Story
          </Text>
        </View>
      </View>

      <View style={styles.storyContainer}>
        <View style={[styles.pageContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }]}>
          <View style={styles.pageNumber}>
            <Text style={[styles.pageNumberText, { color: secondaryTextColor }]}>
              Page {currentPage + 1} of {story.pages.length}
            </Text>
          </View>
          
          <View style={styles.illustrationContainer}>
            {currentPageData.illustrationUri ? (
              <Image 
                source={{ uri: currentPageData.illustrationUri }} 
                style={styles.illustration}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholderIllustration, { backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0' }]}>
                <Text style={[styles.placeholderText, { color: secondaryTextColor }]}>
                  🎨 Illustration featuring {story.childName}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.storyText, { color: textColor }]}>
              {currentPageData.text}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.navigationContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentPage + 1) / story.pages.length) * 100}%` }
            ]} 
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.navButton,
              { 
                backgroundColor: isFirstPage ? 'transparent' : '#007AFF',
                borderColor: '#007AFF',
                borderWidth: 1,
              }
            ]}
            onPress={handlePrevious}
            disabled={isFirstPage}
          >
            <Text style={[
              styles.navButtonText,
              { color: isFirstPage ? '#007AFF' : '#ffffff' }
            ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>
              {isLastPage ? 'Finish Story' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLastPage && (
          <TouchableOpacity 
            style={[styles.restartButton, { borderColor: '#007AFF' }]}
            onPress={handleRestart}
          >
            <Text style={[styles.restartButtonText, { color: '#007AFF' }]}>
              Read Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleContainer: {
    alignItems: 'center',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  storyType: {
    fontSize: 14,
    textAlign: 'center',
  },
  storyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pageNumber: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  illustrationContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  placeholderIllustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  restartButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StoryDisplayScreen;
