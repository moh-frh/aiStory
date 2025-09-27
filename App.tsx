/**
 * AI Story Generator with Contextual Card Backgrounds
 * Generate personalized stories with theme-based character images and contextual card backgrounds
 *
 * @format
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { LocalAIService, Theme, THEMES, StoryPage } from './services/LocalAIService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function App(): React.JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [personName, setPersonName] = useState('');
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'story'>('home');
  
  // Theme selection with swipe
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const themeAnimation = useRef(new Animated.Value(0)).current;
  
  // Story length selection
  const [selectedStoryLength, setSelectedStoryLength] = useState<'short' | 'medium' | 'long'>('medium');

  // Theme swipe navigation
  const handleThemeSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentThemeIndex < THEMES.length - 1) {
      setCurrentThemeIndex(currentThemeIndex + 1);
      setSelectedTheme(THEMES[currentThemeIndex + 1]);
    } else if (direction === 'right' && currentThemeIndex > 0) {
      setCurrentThemeIndex(currentThemeIndex - 1);
      setSelectedTheme(THEMES[currentThemeIndex - 1]);
    }
  };

  // Theme swipe PanResponder
  const themePanResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const hasMinimumDistance = Math.abs(gestureState.dx) > 20;
        return isHorizontalSwipe && hasMinimumDistance;
      },
      onPanResponderMove: (evt, gestureState) => {
        themeAnimation.setValue(gestureState.dx * 0.5);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        const threshold = 50;
        const velocityThreshold = 0.3;

        if (dx > threshold || vx > velocityThreshold) {
          handleThemeSwipe('right');
        } else if (dx < -threshold || vx < -velocityThreshold) {
          handleThemeSwipe('left');
        }

        Animated.spring(themeAnimation, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(themeAnimation, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    }), [currentThemeIndex, themeAnimation]
  );

  // Swipe navigation
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  
  // Handle swipe navigation with improved responsiveness
  const handleSwipeNavigation = (dx: number, vx: number) => {
    const threshold = 30; // Reduced threshold for more sensitivity
    const velocityThreshold = 0.2; // Reduced velocity threshold
    const screenWidth = Dimensions.get('window').width;
    const swipePercentage = Math.abs(dx) / screenWidth;

    console.log('Swipe detected:', { dx, vx, currentPage, totalPages: storyPages.length, swipePercentage });

    // Add visual feedback during swipe
    if (swipePercentage > 0.1) {
      Animated.parallel([
        Animated.timing(cardScale, {
          toValue: 1 - swipePercentage * 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1 - swipePercentage * 0.3,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    }

    if (dx > threshold || vx > velocityThreshold) {
      // Swipe right - go to previous page
      console.log('Swipe right - going to previous page');
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    } else if (dx < -threshold || vx < -velocityThreshold) {
      // Swipe left - go to next page
      console.log('Swipe left - going to next page');
      if (currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    }

    // Reset visual feedback
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardOpacity, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Create PanResponder with improved gesture recognition
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // More sensitive horizontal swipe detection
        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const hasMinimumDistance = Math.abs(gestureState.dx) > 5;
        const hasMinimumVelocity = Math.abs(gestureState.vx) > 0.1;
        
        return isHorizontalSwipe && (hasMinimumDistance || hasMinimumVelocity);
      },
      onPanResponderGrant: () => {
        console.log('Pan responder granted');
        // Add haptic feedback if available
        if (Platform.OS === 'ios') {
          // Haptic feedback for iOS
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        // Smooth animation following finger movement
        swipeAnimation.setValue(gestureState.dx * 0.3); // Scale down for smoother effect
        
        // Real-time visual feedback
        const screenWidth = Dimensions.get('window').width;
        const swipePercentage = Math.abs(gestureState.dx) / screenWidth;
        
        if (swipePercentage > 0.1) {
          Animated.parallel([
            Animated.timing(cardScale, {
              toValue: 1 - swipePercentage * 0.05,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1 - swipePercentage * 0.2,
              duration: 50,
              useNativeDriver: true,
            })
          ]).start();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        handleSwipeNavigation(dx, vx);

        // Smooth reset animation with better spring configuration
        Animated.parallel([
          Animated.spring(swipeAnimation, {
            toValue: 0,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardOpacity, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]).start();
      },
      onPanResponderTerminate: () => {
        // Reset all animations if gesture is terminated
        Animated.parallel([
          Animated.spring(swipeAnimation, {
            toValue: 0,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardOpacity, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]).start();
      },
    }), [currentPage, storyPages.length, swipeAnimation, cardScale, cardOpacity]
  );

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
  };

  // Initialize with first theme selected
  useEffect(() => {
    if (THEMES.length > 0 && !selectedTheme) {
      setSelectedTheme(THEMES[0]);
      setCurrentThemeIndex(0);
    }
  }, []);


  // Simplified permission handling
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), we don't need READ_EXTERNAL_STORAGE for image picker
        const androidVersion = Platform.Version;
        console.log('Android version:', androidVersion);
        
        if (androidVersion >= 33) {
          // Android 13+ - only need camera permission for camera, no storage permission needed for gallery
          console.log('Android 13+ detected, using simplified permissions');
          return true;
        } else {
          // Android 12 and below - check if we already have permissions
          const cameraPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          const storagePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          
          if (cameraPermission && storagePermission) {
            console.log('Permissions already granted');
            return true;
          }
          
          // Only request if we don't have them
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          ]);
          
          return Object.values(granted).every(
            result => result === PermissionsAndroid.RESULTS.GRANTED
          );
        }
      } catch (err) {
        console.error('Permission request error:', err);
        return true; // Allow to proceed anyway
      }
    }
    return true; // iOS doesn't need explicit permission requests for image picker
  };

  // Handle photo selection - simplified approach
  const handlePhotoUpload = async () => {
    console.log('Photo upload button pressed');
    
    // Try to request permissions first, but don't block if they fail
    await requestPermissions();
    
    // Always show photo options - let the image picker handle permissions
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: () => {
          console.log('Camera option selected');
          openCamera();
        }},
        { text: 'Photo Library', onPress: () => {
          console.log('Photo library option selected');
          openImageLibrary();
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = () => {
    console.log('Opening camera...');
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const openImageLibrary = () => {
    console.log('Opening image library...');
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    console.log('Launching image library with options:', options);
    launchImageLibrary(options, handleImagePickerResponse);
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    console.log('Image picker response:', response);
    
    if (response.didCancel) {
      console.log('User cancelled image selection');
      return;
    }
    
    if (response.errorMessage) {
      console.error('Image picker error:', response.errorMessage);
      Alert.alert('Error', `Failed to select image: ${response.errorMessage}`);
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        console.log('Image selected successfully:', imageUri);
        setSelectedImage(imageUri);
        setStoryPages([]);
        setCurrentPage(0);
        Alert.alert('Success', 'Photo uploaded successfully!');
      } else {
        console.error('No image URI in response');
        Alert.alert('Error', 'Failed to get image URI');
      }
    } else {
      console.error('No assets in response');
      Alert.alert('Error', 'No image selected');
    }
  };

  // Handle theme selection
  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setStoryPages([]);
    setCurrentPage(0);
  };

  // Generate story content using local AI
  const generateStoryContent = (theme: Theme, childName: string, length: 'short' | 'medium' | 'long'): Array<{ title: string; text: string }> => {
    return LocalAIService.generateStoryContent(theme, childName, length);
  };

  // Generate complete story with local AI
  const handleGenerateStory = async () => {
    if (!selectedImage || !selectedTheme || !personName) {
      Alert.alert('Missing Requirements', 'Please select a photo, theme, and enter a name.');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate story content with selected length
      const storyContent = generateStoryContent(selectedTheme, personName, selectedStoryLength);
      
      // Generate complete story with local AI
      const storyPages = LocalAIService.generateCompleteStory(
        personName,
        selectedTheme,
        storyContent
      );

      setStoryPages(storyPages);
      setCurrentScreen('story');
      setCurrentPage(0);
      Alert.alert(
        'Story Generated!',
        `Your personalized ${selectedTheme.name} story is ready!`,
        [{ text: 'Amazing!' }]
      );
    } catch (error) {
      Alert.alert('Error', 'An error occurred during story generation.');
    } finally {
      setIsGenerating(false);
    }
  };


  // Render theme selection with swipe
  const renderThemeSelection = () => {
    const currentTheme = THEMES[currentThemeIndex];
    
    return (
      <View style={styles.themeSelectionContainer}>
        {/* Theme Card */}
        <Animated.View
          style={[
            styles.themeCard,
            {
              backgroundColor: currentTheme.color,
              transform: [{ translateX: themeAnimation }]
            }
          ]}
          {...themePanResponder.panHandlers}
        >
          <Text style={styles.themeIcon}>{currentTheme.icon}</Text>
          <Text style={[styles.themeName, { color: '#ffffff' }]}>
            {currentTheme.name}
          </Text>
          <Text style={[styles.themeDescription, { color: '#ffffff' }]}>
            {currentTheme.description}
          </Text>
        </Animated.View>
        
        {/* Theme Dots */}
        <View style={styles.themeDotsContainer}>
          {THEMES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.themeDot,
                {
                  backgroundColor: index === currentThemeIndex ? currentTheme.color : isDarkMode ? '#666' : '#ccc',
                  opacity: index === currentThemeIndex ? 1 : 0.5
                }
              ]}
            />
          ))}
        </View>
        
        {/* Swipe Instructions */}
        <Text style={[styles.swipeInstruction, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
          ← Swipe to choose theme →
        </Text>
      </View>
    );
  };

  // Render story card
  const renderStoryCard = (page: StoryPage) => {
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    
    return (
      <View style={styles.storyCard}>
        {/* Internet Theme Image as Background */}
        {page.internetImage && (
          <Image 
            source={{ uri: page.internetImage }} 
            style={styles.cardBackgroundImage}
            resizeMode="cover"
            onLoad={() => console.log('Background image loaded successfully:', page.internetImage)}
            onError={(error) => {
              console.log('Failed to load background image:', page.internetImage);
              console.log('Image error:', error);
            }}
          />
        )}
        
        {/* Dark Overlay for Better Text Readability */}
        <View style={styles.cardOverlay} />
        
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Character Image */}
          <View style={styles.characterImageContainer}>
            {selectedImage ? (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.characterImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.characterImagePlaceholder, { backgroundColor: page.theme.color }]}>
                <Text style={styles.characterImageText}>{page.theme.icon}</Text>
              </View>
            )}
          </View>
          
          {/* Story Content */}
          <View style={styles.storyContent}>
            <Text style={[styles.storyTitle, { color: '#ffffff' }]}>
              {page.title}
            </Text>
            <Text style={[styles.storyText, { color: '#ffffff' }]}>
              {page.text}
            </Text>
            
            {/* Theme Icon */}
            <View style={styles.themeIconContainer}>
              <Text style={styles.themeIconText}>{page.theme.icon}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render story screen
  const renderStoryScreen = () => {
    if (storyPages.length === 0) return null;

    const currentPageData = storyPages[currentPage];
    const textColor = isDarkMode ? '#ffffff' : '#000000';

    return (
      <View style={styles.storyScreen}>
        {/* Header */}
        <View style={styles.storyHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={[styles.backButtonText, { color: textColor }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.storyHeaderTitle, { color: textColor }]}>
            {selectedTheme?.name} Adventure
          </Text>
          <View style={styles.pageIndicator}>
            <Text style={[styles.pageIndicatorText, { color: textColor }]}>
              {currentPage + 1} / {storyPages.length}
            </Text>
          </View>
        </View>

        {/* Story Card with Swipe */}
        <Animated.View
          style={[
            styles.storyCardContainer,
            {
              transform: [
                { translateX: swipeAnimation },
                { scale: cardScale }
              ],
              opacity: cardOpacity
            }
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView 
            style={styles.storyScrollView} 
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          >
            {renderStoryCard(currentPageData)}
          </ScrollView>
        </Animated.View>

        {/* Page Dots */}
        <View style={styles.pageDotsContainer}>
          {storyPages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.pageDot,
                {
                  backgroundColor: index === currentPage 
                    ? selectedTheme?.color || '#007AFF' 
                    : isDarkMode ? '#666' : '#ccc',
                  opacity: index === currentPage ? 1 : 0.5
                }
              ]}
            />
          ))}
        </View>

        {/* Swipe Instruction */}
        <Text style={[styles.swipeInstruction, { color: isDarkMode ? '#ccc' : '#666' }]}>
          ← Swipe left/right to navigate →
        </Text>

        {/* Navigation */}
        <View style={styles.storyNavigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { 
                backgroundColor: currentPage > 0 ? selectedTheme?.color : '#666',
                opacity: currentPage > 0 ? 1 : 0.5
              }
            ]}
            onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              { 
                backgroundColor: currentPage < storyPages.length - 1 ? selectedTheme?.color : '#666',
                opacity: currentPage < storyPages.length - 1 ? 1 : 0.5
              }
            ]}
            onPress={() => setCurrentPage(Math.min(storyPages.length - 1, currentPage + 1))}
            disabled={currentPage === storyPages.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render home screen
  const renderHomeScreen = () => {
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const secondaryTextColor = isDarkMode ? '#cccccc' : '#666666';

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              📚 AI Story Generator
            </Text>
            <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
              Create personalized stories with contextual card backgrounds
            </Text>
          </View>

          {/* Person Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: textColor }]}>Child's Name</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                borderColor: isDarkMode ? '#444' : '#ddd',
                color: textColor
              }]}
              value={personName}
              onChangeText={setPersonName}
              placeholder="Enter the child's name"
              placeholderTextColor={secondaryTextColor}
            />
          </View>

          {/* Photo Upload */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>1. Upload Photo</Text>
            <TouchableOpacity
              style={[styles.uploadButton, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                borderColor: isDarkMode ? '#444' : '#ddd'
              }]}
              onPress={handlePhotoUpload}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={[styles.uploadIcon, { color: secondaryTextColor }]}>📷</Text>
                  <Text style={[styles.uploadText, { color: textColor }]}>Tap to upload photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Theme Selection */}
          <View style={styles.themeSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>2. Choose Theme</Text>
            {renderThemeSelection()}
          </View>

          {/* Story Length Selection */}
          <View style={styles.storyLengthSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>3. Story Length</Text>
            <View style={styles.storyLengthContainer}>
              {(['short', 'medium', 'long'] as const).map((length) => (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.storyLengthButton,
                    {
                      backgroundColor: selectedStoryLength === length ? '#007AFF' : isDarkMode ? '#2a2a2a' : '#ffffff',
                      borderColor: selectedStoryLength === length ? '#007AFF' : isDarkMode ? '#444' : '#ddd',
                    }
                  ]}
                  onPress={() => setSelectedStoryLength(length)}
                >
                  <Text style={[
                    styles.storyLengthText,
                    { color: selectedStoryLength === length ? '#ffffff' : textColor }
                  ]}>
                    {length === 'short' ? '📖 Short (5 pages)' : 
                     length === 'medium' ? '📚 Medium (7 pages)' : 
                     '📜 Long (15 pages)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: (selectedImage && selectedTheme && personName) ? '#007AFF' : '#666',
                opacity: (selectedImage && selectedTheme && personName) ? 1 : 0.5
              }
            ]}
            onPress={handleGenerateStory}
            disabled={!selectedImage || !selectedTheme || !personName || isGenerating}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? '🔄 Generating Story...' : '✨ Generate Story'}
            </Text>
          </TouchableOpacity>


        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {currentScreen === 'home' ? renderHomeScreen() : renderStoryScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  photoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  themeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  themeSelectionContainer: {
    alignItems: 'center',
  },
  themeCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 120,
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  themeDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storyLengthSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  storyLengthContainer: {
    gap: 10,
  },
  storyLengthButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  storyLengthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Story Screen Styles
  storyScreen: {
    flex: 1,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  storyHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  pageIndicator: {
    padding: 8,
  },
  pageIndicatorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  storyCardContainer: {
    flex: 1,
    // Add subtle shadow for depth during swipe
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyScrollView: {
    flex: 1,
    padding: 20,
  },
  pageDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swipeInstruction: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  storyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    minHeight: screenHeight * 0.65,
    backgroundColor: '#666666', // Fallback color if image fails to load
  },
  cardBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardBackgroundPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  characterImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  characterImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  characterImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImageText: {
    fontSize: 48,
  },
  themeIconContainer: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  themeIconText: {
    fontSize: 32,
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  storyText: {
    fontSize: 19,
    lineHeight: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20,
  },
  contextualBackground: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  contextualBackgroundText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  storyNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
