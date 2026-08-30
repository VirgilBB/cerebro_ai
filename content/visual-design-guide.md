# Visual Design Guide - Cerebro.host

## Design Philosophy

Professional blockchain infrastructure branding that balances technical credibility with accessibility. Clean, modern aesthetic that showcases multi-network expertise while maintaining user-friendly navigation.

---

## Color Palette

### Primary Colors
- **Cerebro Blue**: #1E3A8A (Primary brand color)
- **Deep Space**: #0F172A (Dark backgrounds, headers)
- **Tech Gray**: #64748B (Secondary text, borders)
- **Pure White**: #FFFFFF (Primary text, backgrounds)

### Network Accent Colors
- **XPR Purple**: #8B5CF6 (XPR Network branding)
- **Metal Silver**: #94A3B8 (Metal Blockchain)
- **Akash Red**: #EF4444 (Akash Network)
- **Decred Blue**: #2563EB (Decred Network)
- **Metallicus Gold**: #F59E0B (Metallicus branding)

### Status Colors
- **Success Green**: #10B981 (Active services, uptime)
- **Warning Orange**: #F59E0B (Maintenance, updates)
- **Error Red**: #EF4444 (Issues, downtime)
- **Info Blue**: #3B82F6 (Information, links)

---

## Typography

### Font Stack
```css
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', monospace
```

### Font Hierarchy
- **H1 (Hero)**: 48px, Bold, Cerebro Blue
- **H2 (Section)**: 36px, Semibold, Deep Space
- **H3 (Subsection)**: 24px, Medium, Deep Space
- **Body Text**: 16px, Regular, Tech Gray
- **Small Text**: 14px, Regular, Tech Gray
- **Code/Tech**: 14px, Monospace, Deep Space

---

## Layout Structure

### Grid System
- **Container**: Max-width 1200px, centered
- **Columns**: 12-column grid system
- **Gutters**: 24px between columns
- **Margins**: 48px on desktop, 24px on mobile

### Section Spacing
- **Section Padding**: 80px top/bottom on desktop, 48px on mobile
- **Element Spacing**: 32px between major elements
- **Card Spacing**: 24px between service cards
- **Text Spacing**: 16px between paragraphs

---

## Component Design

### Hero Section
```
Layout: Full-width background with centered content
Background: Gradient from Deep Space to Cerebro Blue
Text: White on dark background
Height: 60vh minimum
Content: Centered, max-width 800px
```

### Service Cards
```
Layout: Grid (3 columns desktop, 1 column mobile)
Card Size: Equal height, minimum 300px
Background: White with subtle shadow
Border: 1px solid #E2E8F0
Padding: 32px
Border Radius: 12px
Hover Effect: Subtle lift with increased shadow
```

### Network Logos
```
Size: 64px x 64px (consistent sizing)
Style: Maintain original colors and branding
Spacing: 16px margin around each logo
Background: White circle with subtle shadow
Border Radius: 50% (circular)
```

### Status Indicators
```
Active: Green circle (●) + "Active" text
Maintenance: Orange circle (●) + "Maintenance" text
Offline: Red circle (●) + "Offline" text
Size: 12px circle + 14px text
Position: Top-right of service cards
```

### Call-to-Action Buttons
```
Primary: Cerebro Blue background, white text
Secondary: White background, Cerebro Blue border/text
Size: 48px height, 16px padding horizontal
Border Radius: 8px
Font: 16px, Medium weight
Hover: Darker shade with smooth transition
```

---

## Page Layouts

### Front Page Structure
```
1. Hero Section (Full-width)
   - Cerebro AI branding
   - Multi-network tagline
   - Network badges

2. Service Overview (Container)
   - 5 service cards in responsive grid
   - Equal height cards with consistent styling

3. Key Achievements (Container)
   - Statistics and highlights
   - 2-column layout on desktop

4. GitHub Showcase (Container)
   - Featured repository cards
   - Direct deployment links

5. Contact Section (Container)
   - Professional services overview
   - Contact information and commitments

6. Footer (Full-width)
   - Quick links and network links
   - Legal and transparency links
```

### Service Card Layout
```
[Network Logo] [Status Indicator]
Network Name
Role/Service Type
Key Metric or Status
Description (2-3 lines)
[Call-to-Action Button]
```

### Code of Conduct Page
```
Header: Page title with breadcrumb
Content: Single column, max-width 800px
Sections: Clear hierarchy with H2/H3 headings
Navigation: Sticky table of contents (desktop)
```

### Ownership Page
```
Header: Page title with transparency emphasis
Content: Single column with expandable sections
Tables: Clean styling for financial/technical data
Contact: Prominent contact information section
```

---

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: 1200px+

### Mobile Adaptations
- **Navigation**: Hamburger menu with slide-out
- **Service Cards**: Single column stack
- **Hero Text**: Reduced font sizes (32px H1)
- **Spacing**: Reduced padding and margins
- **Touch Targets**: Minimum 44px for buttons

### Tablet Adaptations
- **Service Cards**: 2-column grid
- **Navigation**: Horizontal menu maintained
- **Content**: Slightly reduced padding
- **Images**: Responsive scaling

---

## Interactive Elements

### Hover Effects
- **Service Cards**: Subtle lift (transform: translateY(-4px))
- **Buttons**: Color darkening with 0.2s transition
- **Links**: Underline animation
- **Logos**: Slight scale increase (1.05x)

### Loading States
- **Service Status**: Skeleton loading for real-time data
- **External Links**: Loading indicator for GitHub/explorer links
- **Form Submissions**: Button loading state with spinner

### Animations
- **Page Load**: Fade-in for main content sections
- **Scroll**: Subtle parallax for hero background
- **Cards**: Staggered entrance animation
- **Status Updates**: Smooth color transitions

---

## Accessibility

### Color Contrast
- **Text on White**: Minimum 4.5:1 contrast ratio
- **Text on Dark**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Clear focus indicators
- **Status Colors**: Additional text/icon indicators

### Navigation
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML structure
- **Focus Management**: Logical tab order
- **Skip Links**: Skip to main content option

### Content
- **Alt Text**: Descriptive alt text for all images
- **Headings**: Proper heading hierarchy (H1-H6)
- **Links**: Descriptive link text
- **Forms**: Clear labels and error messages

---

## Brand Guidelines

### Logo Usage
- **Cerebro AI**: Primary brand mark
- **Network Logos**: Maintain original proportions and colors
- **Minimum Size**: 32px height for readability
- **Clear Space**: Minimum 16px around all logos

### Voice and Tone
- **Professional**: Technical expertise with accessibility
- **Confident**: Established multi-network operations
- **Transparent**: Open about services and limitations
- **Helpful**: Community-focused and supportive

### Imagery
- **Style**: Clean, technical, professional
- **Colors**: Consistent with brand palette
- **Quality**: High-resolution, optimized for web
- **Context**: Relevant to blockchain and infrastructure

---

## Implementation Notes

### Sitejet Considerations
- **Grid System**: Use Sitejet's built-in grid components
- **Responsive**: Leverage Sitejet's responsive design tools
- **Custom CSS**: Add custom styles for brand colors and effects
- **Media Management**: Organize logos and images in media library

### Performance
- **Image Optimization**: Compress all images for web
- **Font Loading**: Use system fonts with web font fallbacks
- **CSS Optimization**: Minimize custom CSS for faster loading
- **Caching**: Leverage Sitejet's built-in caching

### SEO Optimization
- **Meta Tags**: Unique titles and descriptions for each page
- **Structured Data**: Schema markup for services and organization
- **Keywords**: Blockchain, validator, provider, VSP, infrastructure
- **Internal Linking**: Clear navigation and related content links
