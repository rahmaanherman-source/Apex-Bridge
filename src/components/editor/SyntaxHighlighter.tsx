/**
 * SyntaxHighlighter — Earth-tone code display
 *
 * Renders tokenized source code with the Bridge color palette.
 * Colors drawn from nature at twilight — they guide, not demand.
 * "These colors do not shout; they whisper."
 */

import React, { useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { tokenize, inferLanguage, type Token } from '../../utils/syntaxTokenizer';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { BreezeColors } from '../../theme/colors';

interface SyntaxHighlighterProps {
  code: string;
  filename?: string;
  language?: string;
  fontSize?: number;
  showLineNumbers?: boolean;
}

export function SyntaxHighlighter({
  code,
  filename,
  language,
  fontSize = 14,
  showLineNumbers = true,
}: SyntaxHighlighterProps) {
  const { colors } = useTheme();

  const lang = (language ?? (filename ? inferLanguage(filename) : 'text')) as Parameters<typeof tokenize>[1];

  const tokenizedLines = useMemo(() => tokenize(code, lang), [code, lang]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      horizontal={false}
      showsVerticalScrollIndicator
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeContainer}>
          {tokenizedLines.map((lineTokens, lineIndex) => (
            <View key={lineIndex} style={styles.line}>
              {showLineNumbers && (
                <Text
                  style={[
                    styles.lineNumber,
                    {
                      color: BreezeColors.syntaxComment,
                      fontSize: fontSize - 1,
                      width: String(tokenizedLines.length).length * 9 + 16,
                    },
                  ]}
                >
                  {lineIndex + 1}
                </Text>
              )}
              <Text style={styles.lineContent}>
                {lineTokens.map((token: Token, tokenIndex: number) => (
                  <Text
                    key={tokenIndex}
                    style={{ color: token.color, fontSize, fontFamily: Typography.fontFamily.mono }}
                  >
                    {token.value}
                  </Text>
                ))}
                {/* Ensure empty lines have height */}
                {lineTokens.length === 0 && (
                  <Text style={{ fontSize, fontFamily: Typography.fontFamily.mono, color: 'transparent' }}>
                    {' '}
                  </Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  codeContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lineNumber: {
    textAlign: 'right',
    paddingRight: Spacing.lg,
    opacity: 0.5,
    fontFamily: Typography.fontFamily.mono,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.code,
  },
  lineContent: {
    flexShrink: 1,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.code,
  },
});
