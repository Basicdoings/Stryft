import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Typography } from './Typography';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  iconName,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={24} 
            color={selected ? Colors.dark.primary : Colors.dark.textSecondary} 
            style={styles.icon}
          />
        )}
        <View>
          <Typography variant="body" weight={selected ? 'bold' : 'normal'} color={selected ? Colors.dark.primary : Colors.dark.text}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" style={{ marginTop: 4 }}>
              {subtitle}
            </Typography>
          )}
        </View>
      </View>
      
      <View style={[styles.indicator, selected && styles.indicatorSelected]}>
        {selected && <View style={styles.indicatorInner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.dark.backgroundElement,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: 'rgba(255, 102, 0, 0.05)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorSelected: {
    borderColor: Colors.dark.primary,
  },
  indicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.primary,
  },
});
