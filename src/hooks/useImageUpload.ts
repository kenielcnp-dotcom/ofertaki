import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export function useImageUpload() {
  const [uri, setUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return false;
    }

    setPicking(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setUri(manipulated.uri);
      return true;
    } finally {
      setPicking(false);
    }
  }

  function reset() {
    setUri(null);
  }

  return { uri, picking, pickImage, reset };
}
