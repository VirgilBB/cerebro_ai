# Green Modern Style Button - Implementation Guide

Complete guide for recreating the green modern style button used on cerebro.host.

**Last Updated**: January 19, 2026

---

## Button Style Overview

The green modern button features:
- **Semi-transparent green background** with blur effect
- **Green text color** (#10B981)
- **Rounded corners** (20px border-radius)
- **Optional**: Arrow (←) on left, dot (•) on right
- **Optional**: Pulsing animation
- **Hover effects**: Darker background, slight lift

---

## CSS Implementation

### Base Button Styles

```css
.green-modern-button {
    position: absolute; /* or relative, depending on context */
    top: 80px; /* Adjust as needed */
    left: 100px; /* Adjust as needed */
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(16, 185, 129, 0.15); /* Semi-transparent green */
    color: #10B981; /* Green text */
    padding: 15px 45px; /* Adjust as needed */
    border-radius: 20px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border: 1px solid rgba(16, 185, 129, 0.3); /* Green border */
    backdrop-filter: blur(10px); /* Blur effect */
    transition: all 0.3s ease;
    white-space: nowrap;
}

.green-modern-button:hover {
    background: rgba(16, 185, 129, 0.25); /* Darker on hover */
    border-color: rgba(16, 185, 129, 0.5); /* Darker border */
    transform: translateY(-2px) scale(1.05); /* Slight lift */
}
```

---

## Variations

### Variation 1: Arrow on Left, Dot on Right (Home Button Style)

```css
.green-modern-button::before {
    content: '←'; /* Left arrow */
    color: #10B981;
    font-size: 16px;
    line-height: 1;
    margin-right: 4px;
}

.green-modern-button::after {
    content: '•'; /* Dot */
    color: #10B981;
    font-size: 20px;
    line-height: 1;
    margin-left: 4px;
}
```

**HTML:**
```html
<a href="/" class="green-modern-button">Home</a>
```
**Result**: ← Home •

---

### Variation 2: Pulsing Dot on Left (News Button Style)

```css
.green-modern-button::before {
    content: '•'; /* Pulsing dot */
    color: #10B981;
    font-size: 20px;
    animation: pulse 2s infinite;
    line-height: 1;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.green-modern-button {
    animation: pulse-button 2s ease-in-out infinite;
}

@keyframes pulse-button {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
    }
}

.green-modern-button:hover {
    animation: none; /* Stop animation on hover */
}
```

**HTML:**
```html
<a href="/articles" class="green-modern-button">News</a>
```
**Result**: • News (with pulsing dot)

---

### Variation 3: Simple Button (No Icons)

Just use the base CSS without `::before` or `::after` pseudo-elements.

**HTML:**
```html
<a href="/link" class="green-modern-button">Button Text</a>
```

---

## Color Reference

- **Green Primary**: `#10B981`
- **Green Background**: `rgba(16, 185, 129, 0.15)` (15% opacity)
- **Green Background Hover**: `rgba(16, 185, 129, 0.25)` (25% opacity)
- **Green Border**: `rgba(16, 185, 129, 0.3)` (30% opacity)
- **Green Border Hover**: `rgba(16, 185, 129, 0.5)` (50% opacity)

---

## Positioning

### Absolute Positioning (Hero Section)
```css
.green-modern-button {
    position: absolute;
    top: 80px; /* Distance from top */
    left: 100px; /* Distance from left */
    z-index: 10; /* Above other content */
}
```

**Important**: Parent container must have `position: relative`:
```css
.hero {
    position: relative;
}
```

### Mobile Responsive
```css
@media (max-width: 768px) {
    .green-modern-button {
        top: 20px; /* Closer to top on mobile */
        left: 20px; /* Closer to left on mobile */
        padding: 8px 16px; /* Smaller padding */
        font-size: 13px; /* Smaller text */
    }
}
```

---

## Complete Example: Home Button

```html
<style>
    .hero {
        position: relative; /* Required for absolute positioning */
    }

    .hero-home-button {
        position: absolute;
        top: 80px;
        left: 100px;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: rgba(16, 185, 129, 0.15);
        color: #10B981;
        padding: 15px 45px;
        border-radius: 20px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        border: 1px solid rgba(16, 185, 129, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        white-space: nowrap;
    }

    .hero-home-button::before {
        content: '←';
        color: #10B981;
        font-size: 16px;
        line-height: 1;
        margin-right: 4px;
    }

    .hero-home-button::after {
        content: '•';
        color: #10B981;
        font-size: 20px;
        line-height: 1;
        margin-left: 4px;
    }

    .hero-home-button:hover {
        background: rgba(16, 185, 129, 0.25);
        border-color: rgba(16, 185, 129, 0.5);
        transform: translateY(-2px) scale(1.05);
    }

    @media (max-width: 768px) {
        .hero-home-button {
            top: 20px;
            left: 20px;
            padding: 8px 16px;
            font-size: 13px;
        }
    }
</style>

<section class="hero">
    <a href="/" class="hero-home-button">Home</a>
    <!-- Rest of hero content -->
</section>
```

---

## Key Features

1. **Semi-transparent Background**: `rgba(16, 185, 129, 0.15)` creates the glassmorphism effect
2. **Backdrop Blur**: `backdrop-filter: blur(10px)` adds depth
3. **Green Accent**: Uses `#10B981` (Emerald-500 equivalent)
4. **Smooth Transitions**: `transition: all 0.3s ease` for hover effects
5. **Responsive**: Adjusts position and size on mobile

---

## Usage Tips

- **Position**: Adjust `top` and `left` values to position where needed
- **Size**: Adjust `padding` and `font-size` for different button sizes
- **Icons**: Use `::before` for left icon, `::after` for right icon
- **Animation**: Add `animation` property for pulsing effects
- **Parent Container**: Ensure parent has `position: relative` for absolute positioning

---

**Contact**: cerebro@cerebro.host  
**Reference**: Used on cerebro.host articles page and main homepage
