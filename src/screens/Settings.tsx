import { habitsStorage } from "@/src/storage/habits";
import colors from "@/src/theme/colors";
import { typography } from "@/src/theme/fonts";
import { animation, borderRadius, opacity, spacing } from "@/src/theme/tokens";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as StoreReview from "expo-store-review";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
const TERMS_OF_SERVICE_URL = process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL;
const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
const APP_STORE_URL = process.env.EXPO_PUBLIC_APP_STORE_URL;
const PLAY_STORE_URL = process.env.EXPO_PUBLIC_PLAY_STORE_URL;

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
};

const SettingItem = ({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}: SettingItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.settingItem,
      pressed && styles.settingItemPressed,
    ]}
  >
    <View
      style={[
        styles.settingIconContainer,
        { backgroundColor: `${iconColor || colors.accent.primary}18` },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.danger[600] : iconColor || colors.accent.primary}
      />
    </View>
    <View style={styles.settingContent}>
      <Text
        style={[styles.settingLabel, danger && { color: colors.danger[600] }]}
      >
        {label}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
    )}
  </Pressable>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Settings = () => {
  const { top } = useSafeAreaInsets();
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleClose = () => {
    router.back();
  };

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      // Fallback to opening store URL
      const storeUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
      if (storeUrl) {
        Linking.openURL(storeUrl);
      }
    }
  };

  const handleShareApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message:
          Platform.OS === "ios"
            ? "Check out But Why - The best habit tracker app! " + APP_STORE_URL
            : "Check out But Why - The best habit tracker app! " +
              PLAY_STORE_URL,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=But Why App - Feedback`);
  };

  const handleOpenPrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (PRIVACY_POLICY_URL) {
      Linking.openURL(PRIVACY_POLICY_URL);
    }
  };

  const handleOpenTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (TERMS_OF_SERVICE_URL) {
      Linking.openURL(TERMS_OF_SERVICE_URL);
    }
  };

  const handleClearAllData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your habits and progress. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await habitsStorage.clearAll();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Done", "All data has been cleared.", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "ios" ? 12 : top + 8 },
        ]}
      >
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.headerButtonText}>Done</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Section */}
        <View style={styles.section}>
          <SectionHeader title="SUPPORT" />
          <View style={styles.sectionContent}>
            <SettingItem
              icon="star-outline"
              iconColor={colors.warning[600]}
              label="Rate the App"
              subtitle="Help us with a review"
              onPress={handleRateApp}
            />
            <SettingItem
              icon="share-outline"
              iconColor={colors.info[600]}
              label="Share with Friends"
              subtitle="Spread the word"
              onPress={handleShareApp}
            />
            <SettingItem
              icon="mail-outline"
              iconColor={colors.primary[500]}
              label="Contact Us"
              subtitle="Questions or feedback"
              onPress={handleContactSupport}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <SectionHeader title="LEGAL" />
          <View style={styles.sectionContent}>
            <SettingItem
              icon="shield-checkmark-outline"
              iconColor={colors.success[600]}
              label="Privacy Policy"
              onPress={handleOpenPrivacyPolicy}
            />
            <SettingItem
              icon="document-text-outline"
              iconColor={colors.auxiliary[500]}
              label="Terms of Service"
              onPress={handleOpenTerms}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <SectionHeader title="DATA" />
          <View style={styles.sectionContent}>
            <SettingItem
              icon="trash-outline"
              iconColor={colors.danger[600]}
              label="Clear All Data"
              subtitle="Delete all habits and progress"
              onPress={handleClearAllData}
              showChevron={false}
              danger
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <SectionHeader title="ABOUT" />
          <View style={styles.sectionContent}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>{appVersion}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* <Text style={styles.footerText}>Made with ❤️</Text> */}
          {/* <Text style={styles.footerSubtext}>But Why © 2026</Text> */}
          <Text style={styles.footerSubtext}>
            &quot;But one of them caught our eye, the one in the center. He
            would neither go towards the feeding grounds at the edge of the ice,
            nor return to the colony. Shortly afterwards we saw him heading
            straight towards the mountains, some 70 kilometers away. Doctor
            Ainslie explained that even if he caught him and brought him back to
            the colony, he would inmediately head right back for the mountains.
            BUT WHY? &quot;
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: animation.pressScale.normal }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 60,
  },
  headerButtonText: {
    ...typography.bodyMedium,
    color: colors.accent.primary,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  settingItemPressed: {
    backgroundColor: colors.background.elevated,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    gap: spacing.xs,
  },
  settingLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  settingSubtitle: {
    ...typography.footnote,
    color: colors.text.secondary,
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  aboutLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  aboutValue: {
    ...typography.body,
    color: colors.text.secondary,
  },
  footer: {
    alignItems: "center",
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    ...typography.subheadlineMedium,
    color: colors.text.tertiary,
  },
  footerSubtext: {
    ...typography.caption1,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 18,
  },
});
