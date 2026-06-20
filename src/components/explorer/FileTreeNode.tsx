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
  isExpanded?: boolean;
  isSelected?: boolean;
  onFilePress: (node: FileNode) => void;
  onDirectoryPress: (node: FileNode) => void;
}

export function FileTreeNode({
  node,
  depth = 0,
  isExpanded = false,
  isSelected = false,
  onFilePress,
  onDirectoryPress,
}: FileTreeNodeProps) {
  const { colors } = useTheme();
  const rotateValue = useSharedValue(isExpanded ? 1 : 0);

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
            <FileTreeNodeWrapper
              key={child.id}
              node={child}
              depth={depth + 1}
              onFilePress={onFilePress}
              onDirectoryPress={onDirectoryPress}
              selectedPath={isSelected ? '' : undefined}
            />
          ))}
        </>
      )}
    </>
  );
}

/** Wrapper that connects node to the file store for selection/expansion state */
function FileTreeNodeWrapper({
  node,
  depth,
  onFilePress,
  onDirectoryPress,
  selectedPath,
}: {
  node: FileNode;
  depth: number;
  onFilePress: (n: FileNode) => void;
  onDirectoryPress: (n: FileNode) => void;
  selectedPath?: string;
}) {
  // In a real implementation, this would read from the file store
  // For simplicity, we keep local state here
  const [expanded, setExpanded] = React.useState(false);

  const handleDirectoryPress = (n: FileNode) => {
    setExpanded((prev) => !prev);
    onDirectoryPress(n);
  };

  return (
    <FileTreeNode
      node={node}
      depth={depth}
      isExpanded={expanded}
      isSelected={selectedPath === node.path}
      onFilePress={onFilePress}
      onDirectoryPress={handleDirectoryPress}
    />
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
