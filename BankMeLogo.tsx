import React from 'react';
import {View, Text, Image} from 'react-native';
import logo from '../assets/bankme_logo.png';

// ── Reusable BankMe Logo ──
// Use anywhere: <BankMeLogo size={80} />
// Props:
//   size    → logo width/height in pixels (default 64)
//   variant → 'plain' (logo only) or 'card' (logo on white rounded card)
//   showText→ show "BANK ME" text below the logo (default false)

type Props = {
  size?: number;
  variant?: 'plain' | 'card';
  showText?: boolean;
};

export default function BankMeLogo({
  size = 64,
  variant = 'card',
  showText = false,
}: Props) {
  // The image itself
  const image = (
    <Image
      source={logo}
      style={{width: size, height: size}}
      resizeMode="contain"
    />
  );

  return (
    <View style={{alignItems: 'center'}}>
      {variant === 'card' ? (
        // White rounded card behind the logo (looks clean on dark screens)
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: size * 0.28,
            padding: size * 0.12,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: {width: 0, height: 4},
            elevation: 4,
          }}>
          {image}
        </View>
      ) : (
        // Plain — just the logo, no card
        image
      )}

      {showText && (
        <Text
          style={{
            fontSize: size * 0.28,
            fontWeight: '900',
            color: '#1e40af',
            letterSpacing: 2,
            marginTop: 10,
          }}>
          BANK ME
        </Text>
      )}
    </View>
  );
}
