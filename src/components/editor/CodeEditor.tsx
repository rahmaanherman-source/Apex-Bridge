/**
 * CodeEditor — The heart of Apex Bridge
 *
 * A mobile-first code editor with syntax highlighting, autosave,
 * and a calming writing experience.
 *
 * "The editor is not just a workspace — it is a quiet companion."
 */

import React, { useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useEditor } from '../../hooks/useEditor';
import { useTheme } from '../../hooks/useTheme';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BreezeColors } from '../../theme/colors';

interface CodeEditorProps {
  tabId: string;
  filename?: string;
  language?: string;
}

/**
 * The editor is split into two layers:
 *  1. A transparent TextInput that captures keystrokes
 *  2. The SyntaxHighlighter overlay that renders colored tokens
 *
 * This pattern provides native mobile keyboard behavior with beautiful highlighting.
 */
export function CodeEditor({ tabId, filename, language }: CodeEditorProps) {
  const { colors } = useTheme();
  const { content, isDirty, fontSize, showLineNumbers, handleContentChange } =
    useEditor(tabId);

  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {/* Line-number gutter + syntax view */}
        <View style={styles.editorContent}>
          {showLineNumbers && (
            <LineNumberGutter
              lineCount={content.split('\n').length}
              fontSize={fontSize}
              color={BreezeColors.syntaxComment}
            />
          )}
          {/* Invisible TextInput — the keystroke catcher */}
          <View style={styles.inputContainer}>
            <TextInput
              value={content}
              onChangeText={handleContentChange}
              multiline
              style={[
                styles.input,
                {
                  fontSize,
                  color: 'transparent', // Hidden — syntax highlighter renders above it
                  fontFamily: Typography.fontFamily.mono,
                },
              ]}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              textAlignVertical="top"
              scrollEnabled={false}
            />
            {/* Syntax highlighted overlay */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <SyntaxHighlighter
                code={content}
                filename={filename}
                language={language}
                fontSize={fontSize}
                showLineNumbers={false}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Status bar */}
      <View style={[styles.statusBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Text style={[styles.statusText, { color: colors.textTertiary }]}>
          {filename ?? 'Untitled'}
        </Text>
        {isDirty && (
          <Text style={[styles.statusText, { color: colors.warm }]}>● Unsaved</Text>
        )}
        <Text style={[styles.statusText, { color: colors.textTertiary }]}>
          {language?.toUpperCase() ?? 'TEXT'}
        </Text>
      </View>
    </View>
  );
}

/** Line number gutter */
function LineNumberGutter({
  lineCount,
  fontSize,
  color,
}: {
  lineCount: number;
  fontSize: number;
  color: string;
}) {
  const width = String(lineCount).length * 9 + 20;

  return (
    <View style={[styles.gutter, { width }]}>
      {Array.from({ length: lineCount }, (_, i) => (
        <Text
          key={i}
          style={{
            fontSize: fontSize - 1,
            color,
            lineHeight: fontSize * Typography.lineHeight.code,
            textAlign: 'right',
            fontFamily: Typography.fontFamily.mono,
            opacity: 0.5,
          }}
        >
          {i + 1}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  editorContent: {
    flexDirection: 'row',
    padding: Spacing.md,
    minHeight: '100%',
  },
  gutter: {
    paddingRight: Spacing.lg,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },
});
