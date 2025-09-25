import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';
// import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ChildInfo } from '../types/StoryTypes';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [childName, setChildName] = useState('');
  const [childPhoto, setChildPhoto] = useState<string | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const secondaryTextColor = isDarkMode ? '#cccccc' : '#666666';

  const handlePhotoUpload = () => {
    // Temporarily disabled - will be re-enabled after fixing build issues
    Alert.alert('Photo Upload', 'Photo upload feature will be available soon!');
    // const options = {
    //   mediaType: 'photo' as MediaType,
    //   includeBase64: false,
    //   maxHeight: 2000,
    //   maxWidth: 2000,
    // };

    // launchImageLibrary(options, (response: ImagePickerResponse) => {
    //   if (response.didCancel || response.errorMessage) {
    //     return;
    //   }

    //   if (response.assets && response.assets[0]) {
    //     setChildPhoto(response.assets[0].uri || null);
    //   }
    // });
  };

  const handleContinue = () => {
    if (!childName.trim()) {
      Alert.alert('Missing Information', 'Please enter your child\'s name to continue.');
      return;
    }

    const childInfo: ChildInfo = {
      name: childName.trim(),
      photoUri: childPhoto || undefined,
    };

    navigation.navigate('StorySettings', { childInfo });
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      
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
              value={childName}
              onChangeText={setChildName}
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
              {childPhoto ? (
                <Image source={{ uri: childPhoto }} style={styles.photoPreview} />
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
            backgroundColor: childName.trim() ? '#007AFF' : '#ccc' 
          }]}
          onPress={handleContinue}
          disabled={!childName.trim()}
        >
          <Text style={styles.continueButtonText}>
            Create Story
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
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
});

export default HomeScreen;
