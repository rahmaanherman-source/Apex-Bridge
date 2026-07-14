/**
 * FileTreeNode — Recursive file explorer node
 *
 * A single row in the file explorer. Directories expand and collapse.
 * Files open in the editor with a tap.
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { getFileIcon } from '../../utils/fileUtils';
import type { FileNode } from '../../utils/fileUtils';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { TimingFast } from '../../theme/animations';

interface FileTreeNodeProps {
  node: FileNode;
  depth?: number;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  onFilePress: (node: FileNode) => void;
  onDirectoryPress: (node: FileNode) => void;
}

export function FileTreeNode({
  node,
  depth = 0,
  expandedPaths,
  selectedPath,
  onFilePress,
  onDirectoryPress,
}: FileTreeNodeProps) {
  const { colors } = useTheme();
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const rotateValue = useSharedValue(isExpanded ? 1 : 0);

  React.useEffect(() => {
    rotateValue.value = withTiming(isExpanded ? 1 : 0, TimingFast);
  }, [isExpanded]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value * 90}deg` }],
  }));

  const handlePress = useCallback(() => {
    if (node.type === 'directory') {
      rotateValue.value = withTiming(isExpanded ? 0 : 1, TimingFast);
      onDirectoryPress(node);
    } else {
      onFilePress(node);
    }
  }, [node, isExpanded, onFilePress, onDirectoryPress, rotateValue]);

  const icon =
    node.type === 'directory'
      ? isExpanded
        ? '📂'
        : '📁'
      : getFileIcon(node.name);

  const indentWidth = depth * 16;

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.row,
          {
            paddingLeft: Spacing.xl + indentWidth,
            backgroundColor: isSelected ? colors.tabActiveBackground : 'transparent',
          },
        ]}
      >
        {node.type === 'directory' && (
          <Animated.Text style={[styles.arrow, { color: colors.textTertiary }, arrowStyle]}>
            ›
          </Animated.Text>
        )}

        <Text style={styles.icon}>{icon}</Text>

        <Text
          style={[
            styles.label,
            {
              color: isSelected ? colors.accent : colors.textPrimary,
              fontWeight: node.type === 'directory'
                ? Typography.fontWeight.medium
                : Typography.fontWeight.normal,
            },
          ]}
          numberOfLines={1}
        >
          {node.name}
        </Text>

        {node.isDirty && (
          <View style={[styles.dirtyDot, { backgroundColor: colors.warm }]} />
        )}
      </TouchableOpacity>

      {/* Render children if expanded */}
      {node.type === 'directory' && isExpanded && node.children && (
        <>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onFilePress={onFilePress}
              onDirectoryPress={onDirectoryPress}
            />
          ))}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingRight: Spacing.xl,
    gap: Spacing.sm,
    minHeight: 36,
  },
  arrow: {
    fontSize: 14,
    width: 14,
    textAlign: 'center',
  },
  icon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
