/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./theme/**/*.{js,jsx,ts,tsx,html}"],
  corePlugins: {
    preflight: false, // avoid clashes with Less styles
  },
  theme: {
    extend: {
      // Custom breakpoints
      screens: {
        'desktop': {'min': '1125px'},
      },
      
      // Custom colors from variables.less
      colors: {
        "ekke-primary": "#e8a76c",
        "ekke-bg": "#f7f7f5",
        "ekke-black": "#171717",
        "ekke-brown": "#5c2e20",
        "ekke-white": "#ffffff",
        "ekke-gray": "#999999",
        "neutral-light": "#aaaaaa",
        "neutral-dark": "#9c917e",
        "neutral-lighter": "#dddace",
        "neutral-lightest": "#eeeeee",
        "ekke-green": "#02542d",
        "ekke-neutral-darker": "#9b907d",
      },

      // Custom font families from fonts.less
      fontFamily: {
        archivo: ["Archivo"],
        "road-radio": ["RoadRadio"],
      },

      // Custom font sizes from variables.less
      fontSize: {
        "text-1": "11px",
        "text-2": "12px",
        "text-3": "8px",
        "text-4": "10px",
        "paragraph-1": "32px",
        "paragraph-1-sm": "20px",
        "paragraph-2": "16px",
        "heading-2": "72px",
        "heading-2-sm": "40px",
        "heading-3": "49px",
        "subheading-1": "16px",
        "subheading-2": "32px",
        "subheading-2-sm": "20px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),

    // Custom utility classes plugin
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Text utilities matching LESS classes
        ".heading-2": {
          fontSize: theme("fontSize.heading-2"),
          fontWeight: "200",
          // "@media (max-width: 768px)": {
          //   fontSize: theme("fontSize.heading-2-mobile"),
          // },
        },
        ".heading-3": {
          fontSize: theme("fontSize.paragraph-1"),
          fontWeight: "200",
          fontFamily: theme("fontFamily.archivo"),
          color: theme("colors.neutral-light"),

          "@media (max-width: 768px)": {
            fontSize: theme("fontSize.paragraph-1-sm"),
          },
        },
        ".heading-4": {
          fontSize: theme("fontSize.heading-4"),
          fontWeight: "200",
        },
        ".paragraph-1": {
          fontSize: theme("fontSize.paragraph-1"),
          fontWeight: "200",
          color: theme("colors.ekke-black"),
          // "@media (max-width: 768px)": {
          //   fontSize: theme("fontSize.paragraph-1-mobile"),
          // },
        },
        ".subheading-1": {
          fontSize: theme("fontSize.subheading-1"),
          fontWeight: "700",
          color: theme("colors.ekke-black"),
          fontFamily: theme("fontFamily.road-radio"),
        },
        ".subheading-2": {
          fontSize: theme("fontSize.subheading-2"),
          fontWeight: "200",
          color: theme("colors.ekke-black"),
          // "@media (max-width: 768px)": {
          //   fontSize: theme("fontSize.subheading-2-mobile"),
          // },
        },
        ".subheading-3": {
          fontSize: theme("fontSize.text-1"),
          fontWeight: "700",
          color: theme("colors.ekke-black"),
          fontFamily: theme("fontFamily.road-radio"),
          // "@media (max-width: 768px)": {
          //   fontSize: theme("fontSize.subheading-2-mobile"),
          // },
        },
        ".subheading-4": {
          fontSize: theme("fontSize.subheading-1"),
          fontWeight: "700",
          color: theme("colors.ekke-black"),
          fontFamily: theme("fontFamily.road-radio"),
          // "@media (max-width: 768px)": {
          //   fontSize: theme("fontSize.subheading-2-mobile"),
          // },
        },

        ".subheading-5": {
          fontSize: theme("fontSize.text-4"),
          fontWeight: "700",
          fontFamily: theme("fontFamily.road-radio"),

          // "@media (max-width: 768px)": {
          //   fontSize: theme("fontSize.subheading-2-mobile"),
          // },
        },
        ".body-1": {
          fontSize: theme("fontSize.text-1"),
          fontWeight: "400",
          color: theme("colors.ekke-black"),
          fontFamily: theme("fontFamily.archivo"),
          textTransform: "uppercase",
        },

        ".body-2": {
          fontSize: theme("fontSize.text-1"),
          fontWeight: "400",
          fontFamily: theme("fontFamily.archivo"),
          lineHeight: "120%",
        },

        ".body-3": {
          fontSize: theme("fontSize.text-2"),
          fontWeight: "400",
          fontFamily: theme("fontFamily.archivo"),
          lineHeight: "120%",
        },
        ".body-4": {
          fontSize: theme("fontSize.text-3"),
          fontWeight: "400",
          fontFamily: theme("fontFamily.archivo"),
        },
        ".body-5": {
          fontSize: theme("fontSize.text-4"),
          fontWeight: "400",
          fontFamily: theme("fontFamily.archivo"),
        },

        // Flex utilities commonly used
        ".ekke-flex-center": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },

        ".ekke-flex-between": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
