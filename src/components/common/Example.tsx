/**
 * Example Usage of UI Primitives
 *
 * This file demonstrates how to use the Card and IconButton components.
 * Remove this file once you've integrated these components into your screens.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, IconButton } from './index';
import colors from '../../theme/colors';

export const ExampleUsage: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Card Examples */}
      <Card variant="elevated" style={styles.cardSpacing}>
        <Text style={styles.text}>Elevated Card (with shadow)</Text>
      </Card>

      <Card variant="outlined" style={styles.cardSpacing}>
        <Text style={styles.text}>Outlined Card (transparent bg)</Text>
      </Card>

      <Card variant="filled" style={styles.cardSpacing}>
        <Text style={styles.text}>Filled Card (no border)</Text>
      </Card>

      {/* Interactive Card */}
      <Card
        variant="elevated"
        onPress={() => console.log('Card pressed!')}
        style={styles.cardSpacing}
      >
        <Text style={styles.text}>Tap me! (with press animation)</Text>
      </Card>

      {/* IconButton Examples */}
      <View style={styles.buttonRow}>
        <IconButton
          icon="add"
          onPress={() => console.log('Add pressed')}
          variant="primary"
          size="md"
          accessibilityLabel="Add item"
        />

        <IconButton
          icon="settings-outline"
          onPress={() => console.log('Settings pressed')}
          variant="default"
          size="md"
          accessibilityLabel="Open settings"
        />

        <IconButton
          icon="heart-outline"
          onPress={() => console.log('Heart pressed')}
          variant="ghost"
          size="md"
          accessibilityLabel="Like"
        />
      </View>

      {/* Different Sizes */}
      <View style={styles.buttonRow}>
        <IconButton
          icon="star"
          onPress={() => console.log('Small star')}
          variant="primary"
          size="sm"
          accessibilityLabel="Small star"
        />

        <IconButton
          icon="star"
          onPress={() => console.log('Medium star')}
          variant="primary"
          size="md"
          accessibilityLabel="Medium star"
        />

        <IconButton
          icon="star"
          onPress={() => console.log('Large star')}
          variant="primary"
          size="lg"
          accessibilityLabel="Large star"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background.primary,
  },
  cardSpacing: {
    marginBottom: 16,
  },
  text: {
    color: colors.text.primary,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
});
