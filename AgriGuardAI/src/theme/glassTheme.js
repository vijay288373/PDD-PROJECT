import { StyleSheet, Platform } from 'react-native';

export const glassTheme = StyleSheet.create({
  // Main frosted card container
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 16,
    shadowColor: '#1a5c2a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },

  // Dark variant of frosted card
  glassCardDark: {
    backgroundColor: 'rgba(5, 46, 22, 0.7)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },

  // Glowing interactive action button
  glassButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },

  // Frosted pill badge
  glassBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  // Frosted input field
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(45, 122, 64, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },

  // Floating tab bar glass layout
  glassTabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#1a5c2a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  }
});

export const glassGradients = {
  primary: ['#052e16', '#166534', '#0a1e12'],
  cardHighlight: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'],
  badgeAccent: ['rgba(74, 222, 128, 0.3)', 'rgba(34, 197, 94, 0.15)'],
  backgroundMesh: ['#052e16', '#166534', '#0a1e12']
};
