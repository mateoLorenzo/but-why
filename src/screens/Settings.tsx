import { habitsStorage } from "@/src/storage/habits";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
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
        { backgroundColor: `${iconColor || colors.primary[500]}18` },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.danger[600] : iconColor || colors.primary[500]}
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
      <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
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
    backgroundColor: colors.neutral[100],
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary[500],
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.auxiliary[700],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  settingItemPressed: {
    backgroundColor: colors.neutral[50],
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.auxiliary[700],
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.neutral[500],
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  aboutLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.auxiliary[700],
  },
  aboutValue: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.neutral[500],
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.neutral[400],
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: fonts.italic,
    color: colors.neutral[400],
  },
});
