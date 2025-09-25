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
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, ImagePickerOptions } from 'react-native-image-picker';
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
    const options: ImagePickerOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const openImageLibrary = () => {
    console.log('Opening image library...');
    const options: ImagePickerOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
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

  const generateStoryContent = (storyType: string, childName: string, readingLength: string) => {
    const baseStories = {
      superhero: {
        short: [
          `Once upon a time, there was a brave young hero named ${childName}.`,
          `${childName} discovered they had amazing superpowers and could help everyone in need.`,
          `And so ${childName} became the greatest superhero the world had ever known!`
        ],
        medium: [
          `Once upon a time, there was a brave young hero named ${childName}.`,
          `${childName} lived in a small town where everyone knew each other. One day, strange things started happening - objects were floating, lights were flickering, and people were scared.`,
          `${childName} discovered they had amazing superpowers! They could fly, lift heavy objects, and even read minds.`,
          `With their new powers, ${childName} decided to help their neighbors. They rescued a cat from a tree, helped an elderly person cross the street, and even stopped a runaway bicycle.`,
          `Word spread about the young hero, and soon everyone in town was talking about ${childName}'s amazing deeds.`,
          `And so ${childName} became the greatest superhero the world had ever known, protecting their town with kindness and courage!`
        ],
        long: [
          `Once upon a time, in a bustling city filled with skyscrapers and busy streets, there lived a brave young hero named ${childName}.`,
          `${childName} was an ordinary kid who loved helping others, but they never imagined they would become a real superhero.`,
          `One stormy night, while ${childName} was walking home from school, they saw a bright light streak across the sky and crash into a nearby park.`,
          `Curious and brave, ${childName} ran to investigate. In the crater, they found a mysterious glowing crystal that seemed to pulse with energy.`,
          `As ${childName} reached out to touch the crystal, a surge of power coursed through their body. Suddenly, they could fly, had super strength, and could see through walls!`,
          `At first, ${childName} was scared of their new powers, but they remembered their parents' words: "With great power comes great responsibility."`,
          `The next day, ${childName} decided to use their powers for good. They started small - helping lost children find their parents, rescuing animals, and stopping bullies at school.`,
          `News of the young hero spread quickly through the city. People began calling ${childName} "The Guardian" because they protected everyone with such kindness and wisdom.`,
          `One day, a terrible villain threatened to destroy the city's power grid. ${childName} knew this was their biggest challenge yet.`,
          `Using their superpowers and quick thinking, ${childName} outsmarted the villain and saved the city. Everyone cheered for their young hero.`,
          `From that day forward, ${childName} continued to protect the city, proving that true heroism comes from the heart, not just superpowers.`,
          `And so ${childName} became the greatest superhero the world had ever known, inspiring others to be kind and brave every day!`
        ]
      },
      adventure: {
        short: [
          `Meet ${childName}, a brave young explorer who loved discovering new places.`,
          `One day, ${childName} found a mysterious map that led to a hidden treasure.`,
          `After an exciting journey, ${childName} discovered that the real treasure was the adventure itself!`
        ],
        medium: [
          `Meet ${childName}, a brave young explorer who loved discovering new places and solving mysteries.`,
          `One sunny morning, ${childName} found a mysterious map hidden in an old book at the library. The map showed a path to a secret island.`,
          `Excited by the discovery, ${childName} packed a backpack with supplies and set off on their adventure.`,
          `The journey was filled with challenges - crossing a rickety bridge, solving puzzles, and making friends with talking animals.`,
          `When ${childName} finally reached the island, they discovered a chest filled with gold coins and precious gems.`,
          `But the greatest treasure of all was the confidence and courage ${childName} gained from their amazing adventure!`
        ],
        long: [
          `Meet ${childName}, a brave young explorer with an insatiable curiosity about the world around them.`,
          `One rainy afternoon, while exploring their grandmother's attic, ${childName} discovered an ancient map covered in mysterious symbols.`,
          `The map showed the location of a legendary treasure hidden on a remote island that no one had ever found.`,
          `Determined to solve the mystery, ${childName} spent weeks researching the symbols and preparing for their journey.`,
          `With a backpack full of supplies and a heart full of courage, ${childName} set sail on a small boat toward the mysterious island.`,
          `The journey was treacherous - stormy seas, dangerous creatures, and tricky navigation challenges tested ${childName}'s resolve.`,
          `Along the way, ${childName} met a wise old sea turtle who became their guide and taught them about the ocean's secrets.`,
          `When they finally reached the island, ${childName} had to solve a series of ancient puzzles to find the treasure's hiding place.`,
          `The final challenge was a maze of caves where ${childName} had to use their wits and courage to navigate safely.`,
          `At the center of the maze, ${childName} found the legendary treasure - a chest filled with gold, jewels, and magical artifacts.`,
          `But more valuable than any treasure was the wisdom ${childName} gained: that the greatest adventures come from following your dreams and never giving up.`,
          `When ${childName} returned home, they shared their story and inspired other children to embark on their own adventures of discovery!`
        ]
      },
      fantasy: {
        short: [
          `In a magical kingdom, there lived a young wizard named ${childName}.`,
          `${childName} learned to cast spells and help magical creatures in need.`,
          `Soon, ${childName} became the most powerful and kind wizard in all the land!`
        ],
        medium: [
          `In a magical kingdom filled with talking animals and enchanted forests, there lived a young wizard named ${childName}.`,
          `${childName} discovered their magical powers when they accidentally turned their pet cat into a dragon (don't worry, they turned it back!).`,
          `Under the guidance of a wise old wizard, ${childName} learned to cast spells, brew potions, and communicate with magical creatures.`,
          `One day, a dark shadow threatened to cover the kingdom in eternal night. ${childName} knew they had to help.`,
          `Using their magic and the help of their new creature friends, ${childName} cast a powerful spell that banished the darkness forever.`,
          `The kingdom celebrated ${childName} as their greatest hero, and they continued to use their magic to help others every day!`
        ],
        long: [
          `In a magical kingdom where dragons soared through rainbow clouds and unicorns grazed in crystal meadows, there lived a young wizard named ${childName}.`,
          `${childName} had always felt different from other children, but they never imagined they possessed the ancient gift of magic.`,
          `One fateful day, while playing in the Enchanted Forest, ${childName} accidentally cast their first spell - making flowers bloom in winter.`,
          `A wise old wizard named Merlin appeared and explained that ${childName} was the chosen one, destined to protect the magical realm.`,
          `Under Merlin's guidance, ${childName} began their magical training, learning to cast spells, brew potions, and communicate with magical creatures.`,
          `They made friends with a talking owl named Hoot, a mischievous fairy named Sparkle, and a gentle giant named Goliath.`,
          `When an evil sorcerer threatened to steal all the magic from the kingdom, ${childName} knew they had to act.`,
          `The young wizard embarked on a quest to find the legendary Crystal of Light, the only thing that could defeat the sorcerer.`,
          `Their journey took them through the Whispering Woods, across the Singing River, and up the Mountain of Echoes.`,
          `With the help of their magical friends and their growing powers, ${childName} found the crystal and learned the most important spell of all.`,
          `In a final battle of light against darkness, ${childName} used the power of friendship and courage to defeat the sorcerer and restore magic to the kingdom.`,
          `From that day forward, ${childName} became the greatest wizard the kingdom had ever known, using their magic to spread joy and help others!`
        ]
      },
      'fairy-tale': {
        short: [
          `Once upon a time, there was a kind princess named ${childName}.`,
          `${childName} helped a lost fairy find her way home.`,
          `In return, the fairy granted ${childName} the gift of making everyone happy!`
        ],
        medium: [
          `Once upon a time, in a kingdom far, far away, there lived a kind and brave princess named ${childName}.`,
          `${childName} was known throughout the kingdom for their kindness to all creatures, great and small.`,
          `One day, while walking in the royal garden, ${childName} found a tiny fairy trapped in a spider's web.`,
          `Gently, ${childName} freed the fairy, who introduced herself as Twinkle, the Queen of the Flower Fairies.`,
          `To thank ${childName} for their kindness, Twinkle granted them a special gift - the ability to make anyone smile with just a kind word.`,
          `From that day forward, ${childName} used their gift to spread happiness throughout the kingdom, and everyone lived happily ever after!`
        ],
        long: [
          `Once upon a time, in a magnificent kingdom where castles touched the clouds and gardens bloomed with flowers that sang, there lived a kind and brave princess named ${childName}.`,
          `${childName} was beloved by all the kingdom's subjects, not because of their royal title, but because of their pure heart and endless compassion.`,
          `One magical morning, while exploring the royal garden, ${childName} heard the sound of tiny sobs coming from a rose bush.`,
          `Curious and concerned, ${childName} discovered a beautiful fairy named Twinkle trapped in a spider's web, her delicate wings tangled and torn.`,
          `With gentle hands and a caring heart, ${childName} carefully freed the fairy, speaking words of comfort and hope.`,
          `Twinkle, who was actually the Queen of the Flower Fairies, was so moved by ${childName}'s kindness that she decided to grant them a very special gift.`,
          `"You have shown me that true royalty comes from the heart," said Twinkle. "I grant you the power to bring joy and happiness to everyone you meet."`,
          `From that moment on, ${childName} discovered they could make flowers bloom with a smile, make sad people laugh with a kind word, and bring hope to the hopeless.`,
          `News of the magical princess spread throughout the kingdom and beyond. People traveled from distant lands just to experience ${childName}'s gift of joy.`,
          `One day, a terrible sadness fell over the kingdom when a dark cloud of despair threatened to cover the land.`,
          `Using their gift of spreading happiness, ${childName} organized a great celebration where everyone shared their talents and helped each other.`,
          `The power of joy and togetherness banished the dark cloud forever, and the kingdom became the happiest place in all the world.`,
          `And so ${childName} lived happily ever after, proving that the greatest magic of all is the power of love, kindness, and making others smile!`
        ]
      },
      space: {
        short: [
          `Meet ${childName}, a young astronaut who dreamed of exploring the stars.`,
          `One day, ${childName} got to pilot a rocket ship to a distant planet.`,
          `There, they made friends with friendly aliens and discovered the wonders of space!`
        ],
        medium: [
          `Meet ${childName}, a young astronaut with big dreams of exploring the universe and discovering new worlds.`,
          `One day, ${childName} was chosen to pilot a special rocket ship on a mission to explore a mysterious planet called Zephyria.`,
          `As they traveled through space, ${childName} saw amazing sights - colorful nebulas, dancing comets, and planets with rings of light.`,
          `When they landed on Zephyria, ${childName} discovered a planet filled with friendly aliens who had never seen a human before.`,
          `The aliens taught ${childName} about their culture, their advanced technology, and their peaceful way of life.`,
          `${childName} shared stories about Earth, and together they formed a friendship that would last across the stars forever!`
        ],
        long: [
          `Meet ${childName}, a brilliant young astronaut whose imagination soared higher than any rocket ship.`,
          `From a young age, ${childName} was fascinated by the stars, spending countless nights gazing at the night sky and dreaming of space adventures.`,
          `When they grew up, ${childName} became the youngest astronaut ever selected for a top-secret mission to explore the Andromeda Galaxy.`,
          `Their spaceship, the Stellar Explorer, was equipped with the most advanced technology, including a universal translator and a gravity generator.`,
          `As ${childName} journeyed through the cosmos, they encountered breathtaking phenomena - dancing auroras, crystal asteroids, and a planet made entirely of water.`,
          `On a distant planet called Lumina, ${childName} discovered an ancient civilization of peaceful aliens who had been waiting for a visitor from Earth.`,
          `The Lumina people, who glowed with inner light, taught ${childName} about their advanced science, their philosophy of universal harmony, and their ability to communicate through thought.`,
          `Together, ${childName} and the Lumina people worked to solve a cosmic mystery - why the stars in their galaxy were slowly dimming.`,
          `Using Earth technology and Lumina wisdom, they discovered that the stars needed a special kind of energy to keep shining.`,
          `${childName} helped create a device that could restore the stars' brightness, saving not just one planet, but an entire galaxy.`,
          `In gratitude, the Lumina people gave ${childName} a crystal that would allow them to communicate with any intelligent life in the universe.`,
          `When ${childName} returned to Earth, they shared their incredible discoveries and inspired a new generation of space explorers to reach for the stars!`
        ]
      }
    };

    const storyContent = baseStories[storyType as keyof typeof baseStories]?.[readingLength as keyof typeof baseStories.superhero] || baseStories.superhero.medium;
    return storyContent;
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
      pages: storyContent.map((text, index) => ({
        id: (index + 1).toString(),
        text: text,
        pageNumber: index + 1,
      })),
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
            <Text style={[styles.pageNumber, { color: secondaryTextColor }]}>
              Page {currentPageData.pageNumber}
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
