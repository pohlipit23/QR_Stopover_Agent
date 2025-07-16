// Qatar Airways Design System Types

export interface QatarDesignSystem {
  version: string;
  name: string;
  description: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
  container: ContainerTokens;
  components: ComponentTokens;
  animations: AnimationTokens;
  accessibility: AccessibilityTokens;
}

export interface ColorTokens {
  primary: {
    burgundy: string;
  };
  secondary: {
    oneworldBlue: string;
  };
  neutral: {
    grey1: string;
    grey2: string;
    grey3: string;
    lightGrey: string;
    white: string;
    black: string;
  };
  accent: {
    red: string;
  };
}

export interface TypographyTokens {
  fontFamily: {
    primary: string[];
    fallback: string[];
  };
  baseFontSize: string;
  headings: {
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
  };
  body: TypographyStyle;
  links: TypographyStyle & {
    textDecoration: string;
    hover: {
      textDecoration: string;
    };
  };
}

export interface TypographyStyle {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color: string;
  textDecoration?: string;
}

export interface SpacingTokens {
  baseUnit: string;
  scale: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
}

export interface BorderRadiusTokens {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface BreakpointTokens {
  mobile: string;
  tablet: string;
  desktop: string;
  largeDesktop: string;
}

export interface ContainerTokens {
  maxWidth: string;
  padding: string;
}

export interface ComponentTokens {
  buttons: {
    primary: ButtonStyle;
    secondary: ButtonStyle;
    ghost: ButtonStyle;
  };
  cards: {
    default: CardStyle;
    hover: CardHoverStyle;
    interactive: CardInteractiveStyle;
  };
  inputs: {
    default: InputStyle;
    focus: InputFocusStyle;
    error: InputErrorStyle;
    disabled: InputDisabledStyle;
  };
  tabs: {
    container: TabContainerStyle;
    tab: TabStyle;
    active: TabActiveStyle;
    hover: TabHoverStyle;
  };
  messageBubbles: {
    agent: MessageBubbleStyle;
    user: MessageBubbleStyle;
  };
  suggestedReplies: {
    chip: SuggestedReplyStyle;
    hover: SuggestedReplyHoverStyle;
    active: SuggestedReplyActiveStyle;
  };
}

export interface ButtonStyle {
  backgroundColor: string;
  color: string;
  padding: string;
  borderRadius: string;
  fontWeight: string;
  fontSize: string;
  border: string;
  cursor: string;
  transition: string;
  hover: {
    backgroundColor?: string;
    transform?: string;
    boxShadow?: string;
  };
  active: {
    transform?: string;
    boxShadow?: string;
    backgroundColor?: string;
  };
  disabled: {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    cursor: string;
    transform?: string;
  };
}

export interface CardStyle {
  backgroundColor: string;
  borderRadius: string;
  padding: string;
  boxShadow: string;
  border: string;
  transition: string;
}

export interface CardHoverStyle {
  transform: string;
  boxShadow: string;
}

export interface CardInteractiveStyle {
  cursor: string;
  border: string;
  hover: {
    borderColor: string;
  };
  selected: {
    borderColor: string;
    backgroundColor: string;
  };
}

export interface InputStyle {
  backgroundColor: string;
  border: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontFamily: string[];
  color: string;
  transition: string;
  outline: string;
}

export interface InputFocusStyle {
  borderColor: string;
  boxShadow: string;
}

export interface InputErrorStyle {
  borderColor: string;
  boxShadow: string;
}

export interface InputDisabledStyle {
  backgroundColor: string;
  borderColor: string;
  color: string;
  cursor: string;
}

export interface TabContainerStyle {
  borderBottom: string;
  display: string;
  gap: string;
}

export interface TabStyle {
  padding: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  borderBottom: string;
  cursor: string;
  transition: string;
  textDecoration: string;
}

export interface TabActiveStyle {
  color: string;
  fontWeight: string;
  borderBottomColor: string;
}

export interface TabHoverStyle {
  color: string;
}

export interface MessageBubbleStyle {
  backgroundColor: string;
  color: string;
  borderRadius: string;
  padding: string;
  maxWidth: string;
  alignSelf: string;
  marginBottom: string;
}

export interface SuggestedReplyStyle {
  backgroundColor: string;
  color: string;
  border: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  cursor: string;
  transition: string;
  display: string;
  margin: string;
}

export interface SuggestedReplyHoverStyle {
  borderColor: string;
  backgroundColor: string;
}

export interface SuggestedReplyActiveStyle {
  backgroundColor: string;
  color: string;
}

export interface AnimationTokens {
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface AccessibilityTokens {
  minTouchTarget: string;
  focusRing: {
    width: string;
    color: string;
    offset: string;
  };
  colorContrast: {
    minimumRatio: string;
    preferredRatio: string;
  };
}

// Design System Utility Functions
export const getColorValue = (colorPath: string, designSystem: QatarDesignSystem): string => {
  const paths = colorPath.split('.');
  let value: any = designSystem.colors;
  
  for (const path of paths) {
    value = value[path];
    if (value === undefined) {
      throw new Error(`Color path "${colorPath}" not found in design system`);
    }
  }
  
  return value;
};

export const getSpacingValue = (spacingKey: keyof SpacingTokens['scale'], designSystem: QatarDesignSystem): string => {
  return designSystem.spacing.scale[spacingKey];
};

export const getTypographyStyle = (element: keyof TypographyTokens['headings'] | 'body' | 'links', designSystem: QatarDesignSystem): TypographyStyle => {
  if (element === 'body' || element === 'links') {
    return designSystem.typography[element] as TypographyStyle;
  }
  return designSystem.typography.headings[element];
};

export const getComponentStyle = (component: keyof ComponentTokens, variant: string, designSystem: QatarDesignSystem): any => {
  const componentStyles = designSystem.components[component];
  return (componentStyles as any)[variant];
};

// CSS-in-JS Style Generators
export const generateButtonStyles = (variant: 'primary' | 'secondary' | 'ghost', designSystem: QatarDesignSystem) => {
  const buttonStyle = designSystem.components.buttons[variant];
  
  return {
    backgroundColor: buttonStyle.backgroundColor,
    color: buttonStyle.color,
    padding: buttonStyle.padding,
    borderRadius: buttonStyle.borderRadius,
    fontWeight: buttonStyle.fontWeight,
    fontSize: buttonStyle.fontSize,
    border: buttonStyle.border,
    cursor: buttonStyle.cursor,
    transition: buttonStyle.transition,
    outline: 'none',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: designSystem.accessibility.minTouchTarget,
    
    '&:hover': buttonStyle.hover,
    '&:active': buttonStyle.active,
    '&:disabled': buttonStyle.disabled,
    '&:focus-visible': {
      outline: `${designSystem.accessibility.focusRing.width} solid ${designSystem.accessibility.focusRing.color}`,
      outlineOffset: designSystem.accessibility.focusRing.offset,
    },
  };
};

export const generateCardStyles = (interactive: boolean = false, designSystem: QatarDesignSystem) => {
  const cardStyle = designSystem.components.cards.default;
  const hoverStyle = designSystem.components.cards.hover;
  const interactiveStyle = designSystem.components.cards.interactive;
  
  const baseStyles = {
    backgroundColor: cardStyle.backgroundColor,
    borderRadius: cardStyle.borderRadius,
    padding: cardStyle.padding,
    boxShadow: cardStyle.boxShadow,
    border: cardStyle.border,
    transition: cardStyle.transition,
  };
  
  if (interactive) {
    return {
      ...baseStyles,
      cursor: interactiveStyle.cursor,
      border: interactiveStyle.border,
      
      '&:hover': {
        ...hoverStyle,
        borderColor: interactiveStyle.hover.borderColor,
      },
      
      '&.selected': interactiveStyle.selected,
    };
  }
  
  return {
    ...baseStyles,
    '&:hover': hoverStyle,
  };
};

export const generateInputStyles = (designSystem: QatarDesignSystem) => {
  const inputStyle = designSystem.components.inputs.default;
  const focusStyle = designSystem.components.inputs.focus;
  const errorStyle = designSystem.components.inputs.error;
  const disabledStyle = designSystem.components.inputs.disabled;
  
  return {
    backgroundColor: inputStyle.backgroundColor,
    border: inputStyle.border,
    borderRadius: inputStyle.borderRadius,
    padding: inputStyle.padding,
    fontSize: inputStyle.fontSize,
    fontFamily: inputStyle.fontFamily.join(', '),
    color: inputStyle.color,
    transition: inputStyle.transition,
    outline: inputStyle.outline,
    width: '100%',
    minHeight: designSystem.accessibility.minTouchTarget,
    
    '&:focus': focusStyle,
    '&.error': errorStyle,
    '&:disabled': disabledStyle,
  };
};

// Responsive Breakpoint Utilities
export const mediaQueries = {
  mobile: `@media (max-width: 767px)`,
  tablet: `@media (min-width: 768px) and (max-width: 1023px)`,
  desktop: `@media (min-width: 1024px)`,
  largeDesktop: `@media (min-width: 1440px)`,
};

export const isMobile = (width: number): boolean => width < 768;
export const isTablet = (width: number): boolean => width >= 768 && width < 1024;
export const isDesktop = (width: number): boolean => width >= 1024;