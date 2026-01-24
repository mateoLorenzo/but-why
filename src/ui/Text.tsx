import { fonts } from "@/src/theme/fonts";
import { StyleSheet, Text, TextProps } from "react-native";

export const AppText = ({ style, ...props }: TextProps) => {
  return <Text style={[styles.appText, style]} {...props} />;
};

const styles = StyleSheet.create({
  appText: {
    fontFamily: fonts.regular,
  },
});
