import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  Cinzel_700Bold,
  useFonts,
} from '@expo-google-fonts/cinzel';

interface Props {
  size?: number;
}

export default function DestinoLogo({ size = 58 }: Props) {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>

      {/* Gold gradient text */}
      <MaskedView
        maskElement={
          <Text
            style={[
              styles.logo,
              {
                fontSize: size,
                lineHeight: size * 1.15,
              },
            ]}
          >
            DESTINO
          </Text>
        }
      >
        <LinearGradient
          colors={[
            '#FFF2A8',
            '#F7D36A',
            '#D99B2B',
            '#FFE9A0',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Text
            style={[
              styles.logo,
              {
                fontSize: size,
                lineHeight: size * 1.15,
                opacity: 0,
              },
            ]}
          >
            DESTINO
          </Text>
        </LinearGradient>
      </MaskedView>

      {/* Star inside O */}
      <View
        style={[
          styles.starContainer,
          {
            right: size * 0.055,
            width: size * 0.52,
            height: size * 0.52,
            top: size * 0.28,
          },
        ]}
      >
        <Text
          style={[
            styles.starGlow,
            {
              fontSize: size * 0.32,
            },
          ]}
        >
          ✦
        </Text>

        <Text
          style={[
            styles.star,
            {
              fontSize: size * 0.27,
            },
          ]}
        >
          ✦
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },

  logo: {
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 0,
    includeFontPadding: false,

    // subtle metallic glow
    textShadowColor: 'rgba(255, 204, 80, 0.45)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 6,
  },

  starContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  starGlow: {
    position: 'absolute',
    color: '#FFD96A',
    textShadowColor: '#FFC84A',
    textShadowRadius: 12,
    textShadowOffset: {
      width: 0,
      height: 0,
    },
  },

  star: {
    color: '#FFF0A6',
    textShadowColor: '#D99B2B',
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 1,
    },
  },
});