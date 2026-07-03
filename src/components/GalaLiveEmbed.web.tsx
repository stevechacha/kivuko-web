import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { radius } from '../theme/colors';

type Props = {
  url: string;
  height?: number;
};

export default function GalaLiveEmbed({ url, height = 220 }: Props) {
  if (Platform.OS !== 'web' || !url || typeof document === 'undefined') return null;

  return (
    <View style={[styles.wrap, { height }]}>
      <iframe
        title="Gala Live Stream"
        src={url}
        style={{ border: 0, width: '100%', height: '100%', borderRadius: radius.md }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000',
  },
});
