import { Animated, Easing } from 'react-native';

// ==========================================
// ANIMATION PRESETS
// ==========================================

export const AnimationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

export const AnimationEasing = {
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: Easing.elastic(1),
  bounce: Easing.bounce,
};

// ==========================================
// COMMON ANIMATIONS
// ==========================================

/**
 * Fade in animation
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = AnimationDuration.normal,
  toValue: number = 1
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: AnimationEasing.easeOut,
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = AnimationDuration.normal,
  toValue: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: AnimationEasing.easeIn,
    useNativeDriver: true,
  });
};

/**
 * Scale animation (bounce effect)
 */
export const scale = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = AnimationDuration.fast
) => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 3,
    tension: 40,
    useNativeDriver: true,
  });
};

/**
 * Press animation (scale down on press)
 */
export const pressIn = (animatedValue: Animated.Value) => {
  return Animated.spring(animatedValue, {
    toValue: 0.95,
    friction: 3,
    tension: 100,
    useNativeDriver: true,
  });
};

/**
 * Release animation (scale back to normal)
 */
export const pressOut = (animatedValue: Animated.Value) => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    friction: 3,
    tension: 100,
    useNativeDriver: true,
  });
};

/**
 * Slide in from top
 */
export const slideInFromTop = (
  animatedValue: Animated.Value,
  duration: number = AnimationDuration.normal,
  fromValue: number = -100
) => {
  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: AnimationEasing.easeOut,
    useNativeDriver: true,
  });
};

/**
 * Slide in from bottom
 */
export const slideInFromBottom = (
  animatedValue: Animated.Value,
  duration: number = AnimationDuration.normal,
  fromValue: number = 100
) => {
  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: AnimationEasing.easeOut,
    useNativeDriver: true,
  });
};

/**
 * Slide in from left
 */
export const slideInFromLeft = (
  animatedValue: Animated.Value,
  duration: number = AnimationDuration.normal,
  fromValue: number = -100
) => {
  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: AnimationEasing.easeOut,
    useNativeDriver: true,
  });
};

/**
 * Slide in from right
 */
export const slideInFromRight = (
  animatedValue: Animated.Value,
  duration: number = AnimationDuration.normal,
  fromValue: number = 100
) => {
  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: AnimationEasing.easeOut,
    useNativeDriver: true,
  });
};

/**
 * Rotate animation (continuous)
 */
export const rotate = (
  animatedValue: Animated.Value,
  duration: number = 1000
) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

/**
 * Pulse animation (scale up and down)
 */
export const pulse = (
  animatedValue: Animated.Value,
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 1000
) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxScale,
        duration: duration / 2,
        easing: AnimationEasing.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minScale,
        duration: duration / 2,
        easing: AnimationEasing.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Shake animation (horizontal shake)
 */
export const shake = (
  animatedValue: Animated.Value,
  intensity: number = 10
) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Staggered list animation helper
 */
export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 50
) => {
  return Animated.stagger(staggerDelay, animations);
};

// ==========================================
// CUSTOM HOOKS
// ==========================================

/**
 * Creates a fade & scale entrance animation
 */
export const createEntranceAnimation = (
  opacity: Animated.Value,
  scale: Animated.Value,
  delay: number = 0,
  duration: number = AnimationDuration.normal
) => {
  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: AnimationEasing.easeOut,
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      delay,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Creates a fade & slide up entrance animation
 */
export const createSlideUpFadeAnimation = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay: number = 0,
  duration: number = AnimationDuration.normal
) => {
  translateY.setValue(20);
  opacity.setValue(0);

  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: AnimationEasing.easeOut,
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration,
      delay,
      easing: AnimationEasing.easeOut,
      useNativeDriver: true,
    }),
  ]);
};
