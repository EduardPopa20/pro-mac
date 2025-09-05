import { createTheme } from '@mui/material/styles'

// Utility: consistent focus ring
const focusRing = (color = '#2B3990') => ({
  outline: `2px solid ${color}`,
  outlineOffset: 2,
})

export const theme = createTheme({
  palette: {
    primary: { main: '#2B3990' }, // Pro-Mac brand blue from logo
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    info:    { main: '#0288d1' },
    error:   { main: '#d32f2f' },
    background: { default: '#fafafa', paper: '#fff' },
    action: { hoverOpacity: 0.08, selectedOpacity: 0.12, disabledOpacity: 0.38 },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  zIndex: { 
    appBar: 1100, 
    drawer: 1200, 
    modal: 1300, 
    snackbar: 1400, 
    tooltip: 1500,
    // Custom z-index values for consistent layering
    sticky: 100,        // Sticky sidebars and summaries
    overlay: 200,       // Overlay elements like breadcrumbs
    dropdown: 300,      // Dropdowns and selects
    fab: 1050,          // Floating action buttons (below appBar)
    globalAlert: 9999   // Global alerts and notifications
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 16, // Base 16px
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,

    // Headings with fluid scaling
    h1: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.01562em' }, // 32→56
    h2: { fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.2,  fontWeight: 700, letterSpacing: '-0.00833em' }, // 28→40
    h3: { fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',     lineHeight: 1.25, fontWeight: 600 }, // 24→32
    h4: { fontSize: '1.25rem', lineHeight: 1.3,  fontWeight: 600 },
    h5: { fontSize: '1rem',    lineHeight: 1.35, fontWeight: 600 },
    h6: { fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 600 },

    // Body text (CLAUDE.md compliance) - Enhanced readability
    body1: { fontSize: '1rem',    fontWeight: 500, lineHeight: 1.6 }, // 16px, lineHeight 1.6 per CLAUDE.md
    body2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 }, // 14px, lineHeight 1.5 per CLAUDE.md

    // Caption/small text
    caption:   { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4 }, // 13px
    overline:  { fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 },

    // Button text
    button: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.75, letterSpacing: '0.02857em', textTransform: 'none' },

    subtitle1: { fontSize: '1rem',     fontWeight: 600, lineHeight: 1.75 }, // Enhanced for form labels
    subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.6 },
  },

  components: {
    // Global polish
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          fontSynthesis: 'none',
          scrollbarGutter: 'stable',
        },
        ':focus-visible': {
          outline: '2px solid #2B3990',
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms',
            animationIterationCount: '1',
            transitionDuration: '0.01ms',
            scrollBehavior: 'auto',
          },
        },
      },
    },

    // Container defaults & paddings
    MuiContainer: {
      defaultProps: { maxWidth: 'xl' },
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(3), paddingRight: theme.spacing(3) },
          [theme.breakpoints.up('md')]: { paddingLeft: theme.spacing(4), paddingRight: theme.spacing(4) },
        }),
      },
    },

    // Focus rings
    MuiButtonBase: {
      styleOverrides: {
        root: { '&:focus-visible': focusRing() },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          textTransform: 'none',
          '&:focus-visible': focusRing(),
        },

        // Small: compact visuals; slightly larger on mobile but not huge
        sizeSmall: ({ theme }) => ({
          fontSize: '0.875rem', // 14px
          padding: '4px 10px',
          minHeight: 32,
          [theme.breakpoints.down('sm')]: {
            minHeight: 36,
            padding: '6px 12px',
          },
        }),

        // Medium (default): 40px desktop, 44px mobile
        sizeMedium: ({ theme }) => ({
          fontSize: '0.9375rem', // 15px
          padding: '6px 16px',
          minHeight: 40,
          [theme.breakpoints.down('sm')]: {
            minHeight: 44, // touch target on mobile
            padding: '8px 18px',
          },
        }),

        // Large: 48px everywhere (suitable for CTAs)
        sizeLarge: ({ theme }) => ({
          fontSize: '1rem', // 16px
          padding: '10px 20px',
          minHeight: 48,
          [theme.breakpoints.down('sm')]: {
            // keep at 48px, don’t overgrow
            padding: '10px 22px',
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { '&:focus-visible': focusRing() },
        sizeSmall: ({ theme }) => ({
          width: 32, height: 32,
          '& .MuiSvgIcon-root': { fontSize: '1rem' }, // 16px glyph
          [theme.breakpoints.down('sm')]: { width: 40, height: 40 },
        }),
        sizeMedium: ({ theme }) => ({
          width: 40, height: 40,
          '& .MuiSvgIcon-root': { fontSize: '1.5rem' }, // 24px
          [theme.breakpoints.down('sm')]: { width: 44, height: 44 },
        }),
        sizeLarge: { width: 48, height: 48, '& .MuiSvgIcon-root': { fontSize: '2rem' } }, // 32px
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { fontSize: '1.5rem' },          // 24px default
        fontSizeSmall: { fontSize: '1rem' },   // 16px
        fontSizeMedium: { fontSize: '1.5rem' },
        fontSizeLarge: { fontSize: '2rem' },   // 32px
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, '& .MuiSvgIcon-root': { fontSize: '1.5rem' } }, // 24px
      },
    },

    // Inputs & focus visuals
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            boxShadow: '0 0 0 2px rgba(25,118,210,.15)',
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiInputBase-input': {
            fontSize: '1rem', // 16px to avoid iOS zoom
            minHeight: '1.5rem',
          },
          '& .MuiOutlinedInput-root': {
            minHeight: 40,
            [theme.breakpoints.down('sm')]: { minHeight: 44 },
          },
          '&.MuiTextField-root .MuiInputBase-sizeSmall': {
            minHeight: 32,
            [theme.breakpoints.down('sm')]: { minHeight: 44 }, // WCAG AA compliance
          },
          // Specific override for search input WCAG compliance
          '& input[placeholder*="Caută produse"]': {
            [theme.breakpoints.down('md')]: {
              minHeight: '44px !important',
              height: '44px !important',
              boxSizing: 'border-box !important'
            }
          },
          '& .MuiOutlinedInput-root:has(input[placeholder*="Caută produse"])': {
            [theme.breakpoints.down('md')]: {
              minHeight: '44px !important',
              height: '44px !important'
            }
          },
          // High-specificity override for search input
          '&#global-search-input': {
            [theme.breakpoints.down('md')]: {
              minHeight: '44px !important',
              height: '44px !important',
            }
          },
        }),
      },
    },

    // Links
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          minHeight: 28,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 0',
          transition: theme.transitions.create(['color'], { duration: 120 }),
          '&:focus-visible': focusRing(),
          [theme.breakpoints.down('sm')]: {
            fontSize: '1rem',
            minHeight: 40,
            padding: '6px 0',
          },
        }),
      },
    },

    // Breadcrumbs
    MuiBreadcrumbs: {
      styleOverrides: {
        li: ({ theme }) => ({
          '& a, & p': {
            fontSize: '0.875rem',
            minHeight: 28,
            display: 'flex',
            alignItems: 'center',
            [theme.breakpoints.down('sm')]: { fontSize: '1rem', minHeight: 40 },
          },
        }),
      },
    },

    // Popover/Menu/Tooltip polish
    MuiPopover: {
      defaultProps: { keepMounted: true },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[4],
        }),
      },
    },
    MuiMenu: {
      defaultProps: { keepMounted: true },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[3],
        }),
        list: ({ theme }) => ({
          padding: theme.spacing(1),
          '& .MuiMenuItem-root': {
            borderRadius: theme.shape.borderRadius,
            '&:focus-visible': focusRing(),
          },
        }),
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 200 },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          fontSize: '0.8125rem',
          padding: theme.spacing(1, 1.25),
        }),
      },
    },

    // Paper/Card subtle elevations
    MuiPaper: {
      styleOverrides: {
        rounded: ({ theme }) => ({ borderRadius: theme.shape.borderRadius }),
        elevation1: { boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)' },
      },
    },

    // Toolbar spacing
    MuiToolbar: {
      styleOverrides: {
        root: ({ theme }) => ({
          gap: theme.spacing(1),
          [theme.breakpoints.down('sm')]: { gap: theme.spacing(0.5) },
        }),
      },
    },
  },
})
