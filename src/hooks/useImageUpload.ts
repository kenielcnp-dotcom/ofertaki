import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const MANIPULATE_ACTIONS = [{ resize: { width: 1080 } }];
const SAVE_OPTIONS = { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true };

export function useImageUpload() {
  const [uri, setUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processAsset(assetUri: string) {
    const manipulated = await ImageManipulator.manipulateAsync(assetUri, MANIPULATE_ACTIONS, SAVE_OPTIONS);
    setUri(manipulated.uri);
    setBase64(manipulated.base64 ?? null);
  }

  async function takePhoto() {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError(
        permission.canAskAgain
          ? 'Permita o acesso à câmera para tirar a foto.'
          : 'Acesso à câmera bloqueado. Ative a permissão de câmera do Expo Go/app nas configurações do celular.'
      );
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

      await processAsset(result.assets[0].uri);
      return true;
    } catch {
      setError('Não foi possível abrir a câmera. Tente novamente.');
      return false;
    } finally {
      setPicking(false);
    }
  }

  async function pickFromGallery() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        permission.canAskAgain
          ? 'Permita o acesso às fotos para escolher uma imagem.'
          : 'Acesso às fotos bloqueado. Ative a permissão de fotos do Expo Go/app nas configurações do celular.'
      );
      return false;
    }

    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      await processAsset(result.assets[0].uri);
      return true;
    } catch {
      setError('Não foi possível abrir a galeria. Tente novamente.');
      return false;
    } finally {
      setPicking(false);
    }
  }

  function reset() {
    setUri(null);
    setBase64(null);
    setError(null);
  }

  return { uri, base64, picking, error, takePhoto, pickFromGallery, reset };
}
