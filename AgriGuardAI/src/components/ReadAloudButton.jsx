import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Volume2, Square } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function ReadAloudButton({ text }) {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const handlePress = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      if (text) {
        setIsSpeaking(true);
        Speech.speak(text, {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    }
  };

  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      {isSpeaking ? (
        <Square size={20} color="#4ade80" />
      ) : (
        <Volume2 size={20} color="#1a5c2a" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
