import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      // Primary color for CTAs, primary buttons, active links, key highlights
      primary: "#F47B20",
      // Secondary color for secondary actions, badges, icon fills, hover states
      secondary: "#4CAF50",
      // Accent color for headings, navigation text, link underlines, focus rings
      accent: "#2F4858",
      // Background color for default page and section backgrounds
      background: "#FDF9F3",
      // Card background for cards, panels, modals, form fields
      cardBg: "#FAFAF9",
      // Muted/detail color for borders, dividers, placeholder text, disabled states
      muted: "#8D6E63",

      // Legacy color mappings to maintain backwards compatibility
      orange: "#F47B20", // Updated to match new primary
      green: "#4CAF50", // Updated to match new secondary
      darkBlue: "#2F4858", // Updated to match new accent
      bgGray: "#FDF9F3", // Updated to match new background
      lightText: "#2F4858", // Updated for better contrast on new background
    },
  },
  fonts: {
    heading:
      '"DB Helvethaica X", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"DB Helvethaica X", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "lg",
      },
      variants: {
        primary: {
          bg: "brand.primary",
          color: "white",
          _hover: {
            bg: "#e06b18", // Darker shade of primary
            transform: "translateY(-1px)",
            boxShadow: "lg",
          },
          _active: {
            bg: "#cc5c15", // Even darker for active state
          },
          _focus: {
            boxShadow: `0 0 0 3px brand.accent`, // Using accent color for focus rings
          },
        },
        secondary: {
          bg: "brand.secondary",
          color: "white",
          _hover: {
            bg: "#45a049", // Darker shade of secondary
            transform: "translateY(-1px)",
            boxShadow: "lg",
          },
          _active: {
            bg: "#3e8e41", // Even darker for active state
          },
          _focus: {
            boxShadow: `0 0 0 3px brand.accent`, // Using accent color for focus rings
          },
        },
        outline: {
          borderColor: "brand.muted",
          color: "brand.accent",
          _hover: {
            bg: "brand.secondary",
            color: "white",
            borderColor: "brand.secondary",
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: "brand.accent", // Using accent color for headings
      },
    },
    Link: {
      baseStyle: {
        color: "brand.accent",
        _hover: {
          color: "brand.primary",
          textDecoration: "underline",
          textDecorationColor: "brand.accent",
        },
        _focus: {
          boxShadow: `0 0 0 2px brand.accent`, // Using accent for focus rings
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "brand.cardBg",
          borderColor: "brand.muted",
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "brand.cardBg",
            borderColor: "brand.muted",
            _placeholder: {
              color: "brand.muted",
            },
            _focus: {
              borderColor: "brand.accent",
              boxShadow: `0 0 0 1px brand.accent`,
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "brand.cardBg",
          borderColor: "brand.muted",
          _placeholder: {
            color: "brand.muted",
          },
          _focus: {
            borderColor: "brand.accent",
            boxShadow: `0 0 0 1px brand.accent`,
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "brand.background", // Using new background color
        color: "brand.accent", // Using accent color for main text
      },
      // Global link styles
      a: {
        color: "brand.accent",
        _hover: {
          color: "brand.primary",
        },
      },
      // Divider styles
      ".chakra-divider": {
        borderColor: "brand.muted",
      },
    },
  },
});

export default theme;
