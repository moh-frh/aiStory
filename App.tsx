/**
 * AI Story Generator
 * An AI-powered story generator for kids that creates personalized stories
 * where children become the heroes of their own adventures.
 *
 * @format
 */

import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
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
  Animated,
  PanResponder,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { ChildInfo, StorySettings, Story } from './types/StoryTypes';

type AppScreen = 'home' | 'settings' | 'story';

const { width: screenWidth } = Dimensions.get('window');

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [childInfo, setChildInfo] = useState<ChildInfo>({ name: '' });
  const [settings, setSettings] = useState<StorySettings>({
    readingLength: 'medium',
    storyType: 'superhero',
    theme: 'light',
  });
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Carousel states
  const [readingLengthIndex, setReadingLengthIndex] = useState(1); // medium is default
  const [storyTypeIndex, setStoryTypeIndex] = useState(0); // superhero is default
  
  // Animation values
  const readingLengthScrollX = useRef(new Animated.Value(0)).current;
  const storyTypeScrollX = useRef(new Animated.Value(0)).current;
  const storyPageScrollX = useRef(new Animated.Value(0)).current;

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
  };
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const secondaryTextColor = isDarkMode ? '#cccccc' : '#666666';

  // Carousel data
  const readingLengths = [
    { key: 'short', label: 'Short', description: '5 minutes', emoji: '⏰' },
    { key: 'medium', label: 'Medium', description: '10 minutes', emoji: '📖' },
    { key: 'long', label: 'Long', description: '15+ minutes', emoji: '📚' },
  ];

  const storyTypes = [
    { key: 'superhero', label: 'Superhero', emoji: '🦸', description: 'Your child becomes the hero' },
    { key: 'adventure', label: 'Adventure', emoji: '🗺️', description: 'Epic quests and discoveries' },
    { key: 'fantasy', label: 'Fantasy', emoji: '🧙', description: 'Magic and mystical creatures' },
    { key: 'fairy-tale', label: 'Fairy Tale', emoji: '🏰', description: 'Classic tales with a twist' },
    { key: 'space', label: 'Space', emoji: '🚀', description: 'Journey through the stars' },
  ];

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        const androidVersion = Platform.Version;
        console.log('Android version:', androidVersion);
        
        let permission;
        if (androidVersion >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }

        console.log('Requesting permission:', permission);
        const granted = await PermissionsAndroid.request(
          permission,
          {
            title: 'Photo Access Permission',
            message: 'This app needs access to your photos to create personalized stories for your child.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        
        console.log('Permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos for personalized stories.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  const handlePhotoUpload = async () => {
    console.log('Photo upload button pressed');
    
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo:',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const hasCameraPermission = await requestCameraPermission();
            if (!hasCameraPermission) {
              Alert.alert('Permission Required', 'Please grant camera permission to take photos.');
              return;
            }
            openCamera();
          }
        },
        {
          text: 'Photo Library',
          onPress: () => {
            console.log('Photo library option selected');
            // Try to open library directly - image picker handles permissions internally
            openImageLibrary();
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const openImageLibrary = () => {
    console.log('Opening image library...');
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
      selectionLimit: 1,
    };

    try {
      launchImageLibrary(options, (response) => {
        console.log('Image library response:', response);
        handleImagePickerResponse(response);
      });
    } catch (error) {
      console.error('Error launching image library:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }
    
    if (response.errorMessage) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return;
    }

    if (response.assets && response.assets[0]) {
      setChildInfo(prev => ({ 
        ...prev, 
        photoUri: response.assets![0].uri || undefined 
      }));
      Alert.alert('Success', 'Photo added successfully!');
    }
  };

  const handleContinueFromHome = () => {
    if (!childInfo.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your child\'s name to continue.');
      return;
    }
    setCurrentScreen('settings');
  };

  // AI Story Generation System
  const generateRandomElement = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateStoryContent = (storyType: string, childName: string, readingLength: string) => {
    // Story elements for randomization
    const locations = {
      superhero: ['a bustling city', 'a quiet neighborhood', 'a magical town', 'a futuristic metropolis', 'a coastal village'],
      adventure: ['a mysterious island', 'an ancient forest', 'a hidden valley', 'a mountain peak', 'a secret cave'],
      fantasy: ['a magical kingdom', 'an enchanted realm', 'a mystical forest', 'a crystal palace', 'a floating island'],
      'fairy-tale': ['a royal castle', 'a magical garden', 'a fairy glen', 'a wishing well', 'a rainbow bridge'],
      space: ['a distant planet', 'a space station', 'a nebula', 'an asteroid field', 'a galaxy far away']
    };

    const powers = ['super strength', 'the ability to fly', 'invisibility', 'telepathy', 'healing powers', 'super speed', 'shape-shifting', 'mind control'];
    const challenges = ['a lost pet', 'a broken bridge', 'a crying child', 'a dangerous storm', 'a locked door', 'a runaway vehicle', 'a trapped animal', 'a confused elderly person'];
    const villains = ['the Shadow Master', 'Dr. Chaos', 'the Storm King', 'Captain Darkness', 'the Time Thief', 'Professor Mischief', 'the Ice Queen', 'the Shadow Dragon'];
    const friends = ['a wise owl', 'a talking cat', 'a friendly robot', 'a magical fairy', 'a brave dog', 'a clever fox', 'a gentle giant', 'a sparkling unicorn'];

    const getStoryLength = (length: string) => {
      switch (length) {
        case 'short': return { min: 3, max: 4 };
        case 'medium': return { min: 5, max: 7 };
        case 'long': return { min: 8, max: 12 };
        default: return { min: 5, max: 7 };
      }
    };

    const lengthConfig = getStoryLength(readingLength);
    const storyLength = Math.floor(Math.random() * (lengthConfig.max - lengthConfig.min + 1)) + lengthConfig.min;
    
    let story = [];
    const location = generateRandomElement(locations[storyType as keyof typeof locations] || locations.superhero);
    const power = generateRandomElement(powers);
    const challenge = generateRandomElement(challenges);
    const villain = generateRandomElement(villains);
    const friend = generateRandomElement(friends);

    // Generate story based on type and length
    if (storyType === 'superhero') {
      story = generateSuperheroStory(childName, location, power, challenge, villain, storyLength);
    } else if (storyType === 'adventure') {
      story = generateAdventureStory(childName, location, challenge, friend, storyLength);
    } else if (storyType === 'fantasy') {
      story = generateFantasyStory(childName, location, power, friend, villain, storyLength);
    } else if (storyType === 'fairy-tale') {
      story = generateFairyTaleStory(childName, location, challenge, friend, storyLength);
    } else if (storyType === 'space') {
      story = generateSpaceStory(childName, location, challenge, friend, storyLength);
    } else {
      story = generateSuperheroStory(childName, location, power, challenge, villain, storyLength);
    }

    return story;
  };

  const generateSuperheroStory = (childName: string, location: string, power: string, challenge: string, villain: string, length: number) => {
    const story = [];
    
    // Opening
    story.push({
      title: `The Hero of ${location.split(' ').pop()}`,
      text: `In ${location}, there lived a brave young hero named ${childName}.`
    });
    
    if (length >= 3) {
      story.push({
        title: `A Call to Help`,
        text: `One day, while walking through the streets, ${childName} noticed ${challenge} and knew they had to help.`
      });
    }
    
    if (length >= 4) {
      story.push({
        title: `The Power Awakens`,
        text: `Suddenly, ${childName} felt a strange energy coursing through their body. They discovered they had ${power}!`
      });
    }
    
    if (length >= 5) {
      story.push({
        title: `First Heroic Act`,
        text: `Using their new ability, ${childName} helped solve the problem and felt a deep sense of purpose.`
      });
    }
    
    if (length >= 6) {
      story.push({
        title: `Rising Fame`,
        text: `Word spread about the young hero, and soon people began calling ${childName} "The Guardian of ${location.split(' ').pop()}".`
      });
    }
    
    if (length >= 7) {
      story.push({
        title: `The Dark Threat`,
        text: `But then, a new threat emerged: ${villain} was causing chaos throughout the city.`
      });
    }
    
    if (length >= 8) {
      story.push({
        title: `The Ultimate Challenge`,
        text: `${childName} knew this was their biggest challenge yet. They had to use all their courage and ${power} to stop the villain.`
      });
    }
    
    if (length >= 9) {
      story.push({
        title: `Epic Battle`,
        text: `In an epic battle, ${childName} outsmarted ${villain} and saved the day. Everyone cheered for their young hero.`
      });
    }
    
    if (length >= 10) {
      story.push({
        title: `A Hero's Legacy`,
        text: `From that day forward, ${childName} continued to protect ${location}, proving that true heroism comes from the heart.`
      });
    }
    
    // Ending
    story.push({
      title: `The Greatest Hero`,
      text: `And so ${childName} became the greatest superhero the world had ever known, inspiring others to be kind and brave every day!`
    });
    
    return story;
  };

  const generateAdventureStory = (childName: string, location: string, challenge: string, friend: string, length: number) => {
    const story = [];
    
    story.push({
      title: `The Curious Explorer`,
      text: `Meet ${childName}, a brave young explorer who loved discovering new places.`
    });
    
    if (length >= 3) {
      story.push({
        title: `The Mysterious Map`,
        text: `One day, ${childName} found a mysterious map that led to ${location}.`
      });
    }
    
    if (length >= 4) {
      story.push({
        title: `The Journey Begins`,
        text: `Excited by the discovery, ${childName} packed their backpack and set off on their adventure.`
      });
    }
    
    if (length >= 5) {
      story.push({
        title: `A New Friend`,
        text: `Along the way, ${childName} met ${friend}, who became their trusted companion.`
      });
    }
    
    if (length >= 6) {
      story.push({
        title: `Facing Challenges`,
        text: `The journey was filled with challenges - ${challenge} tested ${childName}'s resolve.`
      });
    }
    
    if (length >= 7) {
      story.push({
        title: `Overcoming Obstacles`,
        text: `With ${friend}'s help, ${childName} overcame every obstacle and learned valuable lessons about courage and friendship.`
      });
    }
    
    if (length >= 8) {
      story.push({
        title: `The Hidden Treasure`,
        text: `When they finally reached ${location}, ${childName} discovered a treasure beyond their wildest dreams.`
      });
    }
    
    if (length >= 9) {
      story.push({
        title: `The Real Treasure`,
        text: `But the greatest treasure of all was the confidence and wisdom ${childName} gained from their amazing adventure.`
      });
    }
    
    story.push({
      title: `The Adventure Continues`,
      text: `From that day forward, ${childName} continued to explore the world, always ready for the next great adventure!`
    });
    
    return story;
  };

  const generateFantasyStory = (childName: string, location: string, power: string, friend: string, villain: string, length: number) => {
    const story = [];
    
    story.push({
      title: `The Young Wizard`,
      text: `In ${location}, there lived a young wizard named ${childName}.`
    });
    
    if (length >= 3) {
      story.push({
        title: `The Ancient Gift`,
        text: `One magical morning, ${childName} discovered they possessed the ancient gift of ${power}.`
      });
    }
    
    if (length >= 4) {
      story.push({
        title: `The Wise Mentor`,
        text: `A wise mentor appeared and began teaching ${childName} how to control their magical abilities.`
      });
    }
    
    if (length >= 5) {
      story.push({
        title: `A Magical Companion`,
        text: `${childName} made friends with ${friend}, who became their magical companion.`
      });
    }
    
    if (length >= 6) {
      story.push({
        title: `Learning Balance`,
        text: `Together, they learned about the balance between light and dark magic.`
      });
    }
    
    if (length >= 7) {
      story.push({
        title: `The Dark Threat`,
        text: `But then, ${villain} threatened to steal all the magic from ${location}.`
      });
    }
    
    if (length >= 8) {
      story.push({
        title: `Preparing for Battle`,
        text: `${childName} knew they had to act. With ${friend}'s help, they prepared for the ultimate magical battle.`
      });
    }
    
    if (length >= 9) {
      story.push({
        title: `The Final Battle`,
        text: `Using their ${power} and the power of friendship, ${childName} defeated ${villain} and restored magic to the realm.`
      });
    }
    
    if (length >= 10) {
      story.push({
        title: `The Greatest Wizard`,
        text: `From that day forward, ${childName} became the greatest wizard the kingdom had ever known.`
      });
    }
    
    story.push({
      title: `Magic from the Heart`,
      text: `They continued to use their magic to spread joy and help others, proving that true magic comes from the heart!`
    });
    
    return story;
  };

  const generateFairyTaleStory = (childName: string, location: string, challenge: string, friend: string, length: number) => {
    const story = [];
    
    story.push({
      title: `The Kind Princess`,
      text: `Once upon a time, in ${location}, there lived a kind princess named ${childName}.`
    });
    
    if (length >= 3) {
      story.push({
        title: `A Heart of Gold`,
        text: `${childName} was known throughout the kingdom for their kindness to all creatures, great and small.`
      });
    }
    
    if (length >= 4) {
      story.push({
        title: `A Cry for Help`,
        text: `One day, while exploring the royal gardens, ${childName} found ${challenge} and knew they had to help.`
      });
    }
    
    if (length >= 5) {
      story.push({
        title: `A Magical Meeting`,
        text: `Gently, ${childName} helped solve the problem, and in return, they met ${friend}.`
      });
    }
    
    if (length >= 6) {
      story.push({
        title: `A Special Gift`,
        text: `${friend} was so moved by ${childName}'s kindness that they granted them a special gift.`
      });
    }
    
    if (length >= 7) {
      story.push({
        title: `The Power of Kindness`,
        text: `"You have shown me that true royalty comes from the heart," said ${friend}. "I grant you the power to bring joy to everyone you meet."`
      });
    }
    
    if (length >= 8) {
      story.push({
        title: `Magical Abilities`,
        text: `From that moment on, ${childName} discovered they could make flowers bloom with a smile and bring hope to the hopeless.`
      });
    }
    
    if (length >= 9) {
      story.push({
        title: `Fame Spreads`,
        text: `News of the magical princess spread throughout the kingdom, and people traveled from distant lands to experience ${childName}'s gift.`
      });
    }
    
    if (length >= 10) {
      story.push({
        title: `Banishing Darkness`,
        text: `When darkness threatened the kingdom, ${childName} used their gift to organize a great celebration that banished the darkness forever.`
      });
    }
    
    story.push({
      title: `Happily Ever After`,
      text: `And so ${childName} lived happily ever after, proving that the greatest magic of all is the power of love and kindness!`
    });
    
    return story;
  };

  const generateSpaceStory = (childName: string, location: string, challenge: string, friend: string, length: number) => {
    const story = [];
    
    story.push({
      title: `The Young Astronaut`,
      text: `Meet ${childName}, a brilliant young astronaut whose imagination soared higher than any rocket ship.`
    });
    
    if (length >= 3) {
      story.push({
        title: `The Secret Mission`,
        text: `One day, ${childName} was chosen for a top-secret mission to explore ${location}.`
      });
    }
    
    if (length >= 4) {
      story.push({
        title: `The Stellar Explorer`,
        text: `Their spaceship, the Stellar Explorer, was equipped with the most advanced technology ever created.`
      });
    }
    
    if (length >= 5) {
      story.push({
        title: `Cosmic Wonders`,
        text: `As ${childName} journeyed through space, they encountered breathtaking phenomena and cosmic wonders.`
      });
    }
    
    if (length >= 6) {
      story.push({
        title: `First Contact`,
        text: `On ${location}, ${childName} discovered an ancient civilization and met ${friend}.`
      });
    }
    
    if (length >= 7) {
      story.push({
        title: `Learning Together`,
        text: `${friend} taught ${childName} about their advanced science and philosophy of universal harmony.`
      });
    }
    
    if (length >= 8) {
      story.push({
        title: `The Cosmic Mystery`,
        text: `Together, they worked to solve a cosmic mystery: ${challenge}.`
      });
    }
    
    if (length >= 9) {
      story.push({
        title: `Saving the Galaxy`,
        text: `Using Earth technology and alien wisdom, they discovered a solution that saved not just one planet, but an entire galaxy.`
      });
    }
    
    if (length >= 10) {
      story.push({
        title: `A Gift of Communication`,
        text: `In gratitude, ${friend} gave ${childName} a crystal that would allow them to communicate with any intelligent life in the universe.`
      });
    }
    
    story.push({
      title: `Inspiring Future Explorers`,
      text: `When ${childName} returned to Earth, they shared their incredible discoveries and inspired a new generation of space explorers!`
    });
    
    return story;
  };

  const handleGenerateStory = () => {
    const selectedReadingLength = readingLengths[readingLengthIndex].key;
    const selectedStoryType = storyTypes[storyTypeIndex].key;
    
    const storyContent = generateStoryContent(selectedStoryType, childInfo.name, selectedReadingLength);
    
    const mockStory: Story = {
      id: Date.now().toString(),
      title: `${childInfo.name}'s ${selectedStoryType.charAt(0).toUpperCase() + selectedStoryType.slice(1)} Adventure`,
      childName: childInfo.name,
      settings: {
        ...settings,
        readingLength: selectedReadingLength as any,
        storyType: selectedStoryType as any,
      },
      pages: storyContent.map((page, index) => {
        if (typeof page === 'string') {
          return {
            id: (index + 1).toString(),
            title: `Page ${index + 1}`,
            text: page,
            pageNumber: index + 1,
          };
        } else {
          return {
            id: (index + 1).toString(),
            title: page.title,
            text: page.text,
            pageNumber: index + 1,
          };
        }
      }),
      createdAt: new Date(),
      isCompleted: false,
    };
    setCurrentStory(mockStory);
    setCurrentPage(0);
    setCurrentScreen('story');
  };

  const renderHomeScreen = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          AI Story Generator
        </Text>
        <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
          Create magical personalized stories for your child
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>
            Child's Name
          </Text>
          <TextInput
            style={[styles.input, { 
              color: textColor, 
              borderColor: isDarkMode ? '#444' : '#ddd',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff'
            }]}
            placeholder="Enter your child's name"
            placeholderTextColor={secondaryTextColor}
            value={childInfo.name}
            onChangeText={(text) => setChildInfo(prev => ({ ...prev, name: text }))}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.photoContainer}>
          <Text style={[styles.label, { color: textColor }]}>
            Child's Photo (Optional)
          </Text>
          <TouchableOpacity 
            style={[styles.photoButton, { 
              borderColor: isDarkMode ? '#444' : '#ddd',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff'
            }]}
            onPress={handlePhotoUpload}
          >
            {childInfo.photoUri ? (
              <Image source={{ uri: childInfo.photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={[styles.photoPlaceholderText, { color: secondaryTextColor }]}>
                  📷 Tap to add photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.continueButton, { 
          backgroundColor: childInfo.name.trim() ? '#007AFF' : '#ccc' 
        }]}
        onPress={handleContinueFromHome}
        disabled={!childInfo.name.trim()}
      >
        <Text style={styles.continueButtonText}>
          Create Story
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCarousel = (items: any[], selectedIndex: number, onIndexChange: (index: number) => void, itemWidth: number = screenWidth * 0.8) => {
    return (
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth + 20}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: readingLengthScrollX } } }],
            { useNativeDriver: false }
          )}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.carouselItem,
                {
                  width: itemWidth,
                  backgroundColor: selectedIndex === index 
                    ? '#007AFF' 
                    : isDarkMode ? '#2a2a2a' : '#ffffff',
                  borderColor: isDarkMode ? '#444' : '#ddd',
                }
              ]}
              onPress={() => onIndexChange(index)}
            >
              <Text style={styles.carouselEmoji}>{item.emoji}</Text>
              <Text style={[
                styles.carouselTitle,
                { color: selectedIndex === index ? '#ffffff' : textColor }
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.carouselDescription,
                { color: selectedIndex === index ? '#e6f3ff' : secondaryTextColor }
              ]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </View>
    );
  };

  const renderSettingsScreen = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={[styles.backButtonText, { color: '#007AFF' }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        
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
        <Text style={[styles.sectionSubtitle, { color: secondaryTextColor }]}>
          Swipe to select reading time
        </Text>
        {renderCarousel(readingLengths, readingLengthIndex, setReadingLengthIndex)}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Story Type
        </Text>
        <Text style={[styles.sectionSubtitle, { color: secondaryTextColor }]}>
          Swipe to select story theme
        </Text>
        {renderCarousel(storyTypes, storyTypeIndex, setStoryTypeIndex)}
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
  );

  const renderStoryScreen = () => {
    if (!currentStory) return null;

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Handle swipe gestures
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        const threshold = 50;
        
        if (dx > threshold && currentPage > 0) {
          // Swipe right - go to previous page
          setCurrentPage(currentPage - 1);
        } else if (dx < -threshold && currentPage < currentStory.pages.length - 1) {
          // Swipe left - go to next page
          setCurrentPage(currentPage + 1);
        }
      },
    });

    const currentPageData = currentStory.pages[currentPage];

    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('settings')}
          >
            <Text style={[styles.backButtonText, { color: '#007AFF' }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.storyTitle, { color: textColor }]}>
            {currentStory.title}
          </Text>
          <Text style={[styles.storyInfo, { color: secondaryTextColor }]}>
            {currentStory.settings.readingLength.charAt(0).toUpperCase() + currentStory.settings.readingLength.slice(1)} • Page {currentPage + 1} of {currentStory.pages.length}
          </Text>
        </View>

        <View style={styles.storyPageContainer} {...panResponder.panHandlers}>
          <View style={[styles.storyPage, { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }]}>
            {childInfo.photoUri && (
              <View style={styles.storyPhotoContainer}>
                <Image source={{ uri: childInfo.photoUri }} style={styles.storyPhoto} />
                <Text style={[styles.storyPhotoLabel, { color: secondaryTextColor }]}>
                  {childInfo.name}
                </Text>
              </View>
            )}
            <Text style={[styles.pageTitle, { color: textColor }]}>
              {currentPageData.title}
            </Text>
            <Text style={[styles.storyText, { color: textColor }]}>
              {currentPageData.text}
            </Text>
          </View>
          <Text style={[styles.swipeInstruction, { color: secondaryTextColor }]}>
            Swipe left or right to navigate pages
          </Text>
        </View>

        <View style={styles.pageNavigation}>
          <TouchableOpacity 
            style={[
              styles.navButton,
              { opacity: currentPage === 0 ? 0.3 : 1 }
            ]}
            onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <Text style={[styles.navButtonText, { color: '#007AFF' }]}>
              ← Previous
            </Text>
          </TouchableOpacity>
          
          <View style={styles.pageDots}>
            {currentStory.pages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageDot,
                  {
                    backgroundColor: index === currentPage ? '#007AFF' : isDarkMode ? '#444' : '#ddd'
                  }
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.navButton,
              { opacity: currentPage === currentStory.pages.length - 1 ? 0.3 : 1 }
            ]}
            onPress={() => setCurrentPage(Math.min(currentStory.pages.length - 1, currentPage + 1))}
            disabled={currentPage === currentStory.pages.length - 1}
          >
            <Text style={[styles.navButtonText, { color: '#007AFF' }]}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.storyActions}>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={[styles.restartButtonText, { color: '#007AFF' }]}>
              Start Over
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'settings' && renderSettingsScreen()}
      {currentScreen === 'story' && renderStoryScreen()}
    </SafeAreaView>
  );
}

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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  storyInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  photoContainer: {
    marginBottom: 30,
  },
  photoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
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
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 10,
  },
  carouselItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  carouselEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  carouselDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  storyPageContainer: {
    flex: 1,
    marginBottom: 20,
  },
  storyPage: {
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
    justifyContent: 'center',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pageDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  swipeInstruction: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  storyPhotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  storyPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  storyPhotoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  storyContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storyTextContainer: {
    flex: 1,
  },
  pageContainer: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  pageNumber: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.7,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'left',
  },
  pageBreak: {
    height: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  storyActions: {
    paddingTop: 10,
    alignItems: 'center',
  },
  restartButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
