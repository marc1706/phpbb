# Modernite - Standalone Modern phpBB Style

A beautiful, modern standalone phpBB style with Bootstrap-inspired design principles, featuring responsive layouts, modern colors, and excellent user experience across all devices.

**Note**: This is a complete standalone style that does not require any parent style inheritance. It can be directly installed on any phpBB forum.

## Features

### 🎨 Modern Design
- **Gradient Headers**: Beautiful gradient backgrounds with modern color schemes
- **Card-based Layouts**: Clean card designs for forums, posts, and components
- **Modern Typography**: Inter font family for excellent readability
- **Subtle Shadows**: Layered shadows for depth and visual hierarchy
- **Rounded Corners**: Consistent border-radius for modern aesthetics

### 📱 Fully Responsive
- **Mobile-First**: Designed from 320px upwards
- **Tablet Optimized**: Perfect layouts for tablet devices
- **Desktop Ready**: Beautiful on large screens up to 1400px+
- **Touch Friendly**: 44px minimum touch targets for mobile
- **Responsive Grid**: Bootstrap-inspired grid system

### 🏗️ Bootstrap-Inspired Framework
- **Grid System**: 12-column responsive grid
- **Utility Classes**: Flexbox utilities, spacing, display classes
- **Component Library**: Modern buttons, cards, forms, and alerts
- **Responsive Utilities**: Show/hide classes for different screen sizes

### ♿ Accessibility & UX
- **High Contrast Support**: Adapts to user's contrast preferences
- **Reduced Motion**: Respects user's motion preferences
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Clear focus states for interactive elements

### 🎯 Key Components

#### Color Scheme
- **Primary**: Modern blue-purple gradient (#6366f1)
- **Secondary**: Professional gray tones (#64748b)
- **Accent**: Vibrant orange (#f59e0b)
- **Status Colors**: Success, warning, danger, info variants
- **Neutral Palette**: 10-step gray scale for consistency

#### Interactive Elements
- **Hover Effects**: Smooth transitions and micro-interactions
- **Button Styles**: Multiple variants with proper states
- **Form Controls**: Modern input styling with focus states
- **Dropdown Menus**: Clean dropdowns with shadows
- **Navigation**: Responsive navigation with mobile menu

#### Layout Components
- **Statistics Cards**: Beautiful stat displays with hover effects
- **Forum Lists**: Card-based forum listings
- **Post Layout**: Clean post structure with user profiles
- **Notification System**: Modern alert and notification styling
- **Tables**: Responsive table design with hover states

## Installation

1. **Upload Files**: Upload the `modernite` folder to your `phpBB/styles/` directory
2. **Install Style**: Go to ACP → Customise → Style Management → Install Styles
3. **Select Modernite**: Choose the Modernite style from the available styles
4. **Activate**: Set as default or allow users to select it

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 88+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Customization

### CSS Custom Properties
The style uses CSS custom properties (variables) for easy customization:

```css
:root {
  --primary: #6366f1;
  --secondary: #64748b;
  --success: #10b981;
  /* ... more variables */
}
```

### Responsive Breakpoints
- **Mobile**: 320px - 575px
- **Small**: 576px - 767px
- **Medium**: 768px - 991px
- **Large**: 992px - 1199px
- **Extra Large**: 1200px+

### Grid System
Use Bootstrap-inspired classes:
- `.container` - Responsive container
- `.row` - Flex row wrapper
- `.col-*` - Column classes (1-12)
- `.col-sm-*`, `.col-md-*`, etc. - Responsive columns

## File Structure

```
modernite/
├── style.cfg              # Style configuration
├── composer.json          # Package information
├── theme/
│   ├── stylesheet.css     # Main stylesheet imports
│   ├── bootstrap-grid.css # Grid system and utilities
│   ├── modern-colors.css  # Color scheme and variables
│   ├── modern-components.css # UI components
│   └── modern-responsive.css # Responsive design
├── template/
│   ├── overall_header.html # Enhanced header template
│   ├── index_body.html     # Modern forum index
│   └── index.htm          # Security file
└── imgs/
    └── index.htm          # Security file
```

## Performance

- **Optimized CSS**: Efficient selectors and minimal redundancy
- **Modern Fonts**: Web font loading with proper fallbacks
- **Responsive Images**: Scalable graphics and icons
- **Minimal JavaScript**: Relies on CSS for animations and interactions

## Contributing

Modernite is built with maintainability in mind:
- **Modular CSS**: Separated concerns for colors, components, grid
- **CSS Variables**: Easy theming and customization
- **Documentation**: Well-commented code
- **Standards Compliant**: Follows phpBB style guidelines

## Credits

- **Base Style**: Built on phpBB's Prosilver
- **Design Inspiration**: Modern web design principles and Bootstrap
- **Typography**: Inter font family by Rasmus Andersson
- **Color Palette**: Tailwind CSS inspired colors

## Installation

### Standalone Installation
This style is completely standalone and can be installed directly on any phpBB installation:

1. **Via phpBB ACP** (Recommended):
   - Navigate to `Customise` → `Style Management` → `Install Styles`
   - Upload or select the Modernite style directory
   - Click "Install" to make it available
   - Set as default or allow users to choose

2. **Manual Installation**:
   - Extract the style to `phpBB/styles/modernite/`
   - Ensure all files are in place with proper permissions
   - Install via ACP as described above

### Requirements
- phpBB 4.0.0-a1-dev or newer
- PHP 7.4.0 or newer
- No parent style dependencies

### Configuration
Once installed, administrators can:
- Set Modernite as the default style for all users
- Allow users to choose Modernite from their UCP style preferences
- Customize colors and components via CSS custom properties

## License

This style is released under the same license as phpBB (GPL v2).

---

**Modernite** - Making phpBB beautiful and modern for the next generation of forum users.