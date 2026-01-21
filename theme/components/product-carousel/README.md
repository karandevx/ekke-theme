# Product Carousel Component

A responsive, customizable product carousel component built for the Akke website theme. This component displays products in a horizontal scrollable layout with navigation controls and is fully responsive across all devices.

## Features

- 🎠 **Smooth Carousel Navigation** - Arrow controls and optional dot indicators
- 📱 **Fully Responsive** - Adapts to desktop, tablet, and mobile screens
- ⚙️ **Highly Customizable** - Extensive props for customization
- 🛒 **E-commerce Ready** - Built-in support for add to cart and wishlist
- ♿ **Accessible** - ARIA labels and keyboard navigation support
- 🎨 **Theme Integrated** - Uses existing design tokens and styles
- 🔄 **Auto-play Support** - Optional automatic sliding
- ⚡ **Performance Optimized** - Lazy loading and efficient rendering

## Installation

The component is already integrated into the theme. Simply import and use:

```jsx
import ProductCarousel from "../components/product-carousel/product-carousel";
```

## Basic Usage

```jsx
<ProductCarousel
  products={productArray}
  title="Featured Products"
  slidesToShow={4}
  showAddToCart={true}
  showWishlist={true}
/>
```

## Props

### Required Props

| Prop       | Type    | Description                         |
| ---------- | ------- | ----------------------------------- |
| `products` | `Array` | Array of product objects to display |

### Optional Props

| Prop                 | Type       | Default      | Description                    |
| -------------------- | ---------- | ------------ | ------------------------------ |
| `title`              | `String`   | `""`         | Section title                  |
| `showTitle`          | `Boolean`  | `true`       | Whether to show the title      |
| `showViewAll`        | `Boolean`  | `false`      | Show "View All" link           |
| `viewAllLink`        | `String`   | `""`         | URL for "View All" link        |
| `viewAllText`        | `String`   | `"View All"` | Text for "View All" link       |
| `slidesToShow`       | `Number`   | `4`          | Products to show on desktop    |
| `slidesToShowTablet` | `Number`   | `3`          | Products to show on tablet     |
| `slidesToShowMobile` | `Number`   | `2`          | Products to show on mobile     |
| `autoplay`           | `Boolean`  | `false`      | Enable automatic sliding       |
| `autoplaySpeed`      | `Number`   | `3000`       | Autoplay speed in milliseconds |
| `showDots`           | `Boolean`  | `false`      | Show dot indicators            |
| `showArrows`         | `Boolean`  | `true`       | Show navigation arrows         |
| `infinite`           | `Boolean`  | `true`       | Enable infinite scrolling      |
| `showAddToCart`      | `Boolean`  | `false`      | Show add to cart buttons       |
| `showWishlist`       | `Boolean`  | `true`       | Show wishlist icons            |
| `onWishlistClick`    | `Function` | `() => {}`   | Wishlist click handler         |
| `onAddToCart`        | `Function` | `() => {}`   | Add to cart click handler      |
| `followedIdList`     | `Array`    | `[]`         | Array of followed product IDs  |
| `globalConfig`       | `Object`   | `{}`         | Global theme configuration     |
| `listingPrice`       | `Object`   | `{}`         | Price configuration            |
| `className`          | `String`   | `""`         | Additional CSS classes         |

## Product Object Structure

Each product in the `products` array should have the following structure:

```javascript
{
  uid: "unique-id",
  id: "product-id",
  slug: "product-slug",
  name: "Product Name",
  brand: { name: "Brand Name" },
  images: [
    { url: "image-url" }
  ],
  price: {
    effective: {
      currency_code: "USD",
      currency_symbol: "$",
      value: 99.99
    },
    marked: {
      currency_code: "USD",
      currency_symbol: "$",
      value: 129.99
    }
  },
  sizes: ["S", "M", "L", "XL"]
}
```

## Examples

### Basic Carousel

```jsx
<ProductCarousel
  products={products}
  title="Featured Products"
  slidesToShow={4}
/>
```

### Autoplay Carousel with Dots

```jsx
<ProductCarousel
  products={products}
  title="Trending Now"
  autoplay={true}
  autoplaySpeed={4000}
  showDots={true}
  showArrows={false}
/>
```

### Mobile-Optimized Carousel

```jsx
<ProductCarousel
  products={products}
  title="New Arrivals"
  slidesToShow={2}
  slidesToShowTablet={2}
  slidesToShowMobile={1}
  showAddToCart={true}
/>
```

### E-commerce Features

```jsx
<ProductCarousel
  products={products}
  title="Shop Now"
  showAddToCart={true}
  showWishlist={true}
  onWishlistClick={handleWishlistToggle}
  onAddToCart={handleAddToCart}
  followedIdList={wishlistIds}
/>
```

## Responsive Behavior

- **Desktop (>1024px)**: Shows `slidesToShow` products with arrow navigation
- **Tablet (768px-1024px)**: Shows `slidesToShowTablet` products with arrow navigation
- **Mobile (<768px)**: Shows `slidesToShowMobile` products with dot navigation (arrows hidden)

## Styling

The component uses LESS stylesheets and follows the existing theme design system:

- `product-carousel.less` - Main component styles
- Integrates with theme variables (`@ButtonPrimary`, `@TextHeading`, etc.)
- Responsive breakpoints match theme standards
- Hover effects and transitions included

## Section Integration

For use as a theme section, use the `product-carousel-section.jsx` component:

```jsx
// In your sections
import { Component as ProductCarouselSection } from "../sections/product-carousel-section";

// The section includes:
// - Collection data fetching
// - Theme editor settings
// - Add to cart modal integration
// - Wishlist functionality
```

## Demo Page

Visit `/product-carousel-demo` to see the component in action with different configurations and sample data.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 16.8+
- react-slick (carousel functionality)
- fdk-core (Fynd platform integration)
- @gofynd/theme-template (ProductCard component)

## Performance Notes

- Images are lazy-loaded through the FyImage component
- Carousel only renders visible slides plus buffer
- Smooth CSS transitions for better performance
- Debounced resize handling

## Accessibility

- ARIA labels for navigation buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management
- High contrast support

## Troubleshooting

### Common Issues

1. **Products not displaying**: Check that the `products` array has valid data
2. **Arrows not working**: Ensure `showArrows={true}` and sufficient products
3. **Responsive issues**: Verify breakpoint settings match your needs
4. **Styling conflicts**: Check CSS specificity and theme integration

### Debug Mode

Enable console logging by setting:

```javascript
const DEBUG = true; // Add to component for debugging
```

## Contributing

When modifying the component:

1. Update both `.jsx` and `.less` files
2. Test across all breakpoints
3. Verify accessibility features
4. Update this documentation
5. Test with real product data

## License

Part of the Akke website theme. All rights reserved.

# Product Carousel Section - Usage Guide

## Overview

The Product Carousel section has been successfully added to your Akke website theme. This section allows you to display products in a beautiful, responsive carousel format.

## What Was Fixed

The Product Carousel component existed but was **not registered as a theme section**. The following changes were made:

### 1. Created Section Wrapper (`/theme/sections/product-carousel.jsx`)

- Added a new section wrapper that integrates the existing Product Carousel component
- Implemented data fetching for products from collections or general product catalog
- Added proper error handling and loading states
- Configured server-side rendering support

### 2. Registered in Sections Index (`/theme/sections/index.js`)

- Added import for ProductCarouselSectionChunk
- Registered 'product-carousel' case in the getbundle function
- Added to the exported sections object

### 3. Added Configuration Schema

- Created comprehensive settings schema with 15+ configurable options
- Includes title, collection selection, layout options, autoplay settings, and more
- Fully integrated with the theme editor

## How to Use

### 1. In Theme Editor

1. Go to your theme customization panel
2. Add a new section
3. Look for "Product Carousel" in the available sections
4. Configure the settings as needed:
   - **Title**: Set the section heading
   - **Collection**: Choose a specific collection or leave empty for all products
   - **Layout**: Configure products per row for different devices
   - **Autoplay**: Enable/disable automatic sliding
   - **Navigation**: Show/hide arrows and dots

### 2. Available Settings

| Setting                    | Description                    | Default                |
| -------------------------- | ------------------------------ | ---------------------- |
| Section Title              | Main heading text              | "Featured Products"    |
| Show Title                 | Display the title              | true                   |
| Show View All              | Display view all button        | false                  |
| Collection                 | Source collection for products | (empty - all products) |
| Number of Products         | Max products to display        | 8                      |
| Products per Row (Desktop) | Desktop layout                 | 4                      |
| Products per Row (Tablet)  | Tablet layout                  | 3                      |
| Products per Row (Mobile)  | Mobile layout                  | 2                      |
| Enable Autoplay            | Auto-scroll products           | false                  |
| Autoplay Speed             | Speed in milliseconds          | 3000                   |
| Show Navigation Dots       | Mobile navigation              | false                  |
| Show Navigation Arrows     | Desktop navigation             | true                   |
| Infinite Loop              | Continuous scrolling           | true                   |
| Show Add to Cart           | Product action button          | false                  |
| Show Wishlist              | Wishlist functionality         | true                   |

### 3. Features

- **Responsive Design**: Automatically adapts to all screen sizes
- **Touch/Swipe Support**: Mobile-friendly navigation
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance Optimized**: Lazy loading and efficient rendering
- **Customizable**: Extensive configuration options
- **SEO Friendly**: Server-side rendering support

## Technical Details

### Component Structure

```
theme/
├── components/product-carousel/
│   ├── product-carousel.jsx      # Main component (existing)
│   ├── product-carousel.less     # Styles (existing)
│   └── README.md                 # Component docs (existing)
└── sections/
    └── product-carousel.jsx      # Section wrapper (NEW)
```

### Dependencies

- `react-slick`: Carousel functionality
- `slick-carousel`: CSS styles
- `@gofynd/theme-template`: Product card component

All dependencies are already installed and configured.

## Troubleshooting

### Section Not Appearing

1. Ensure you've saved and published your theme changes
2. Clear browser cache and refresh
3. Check that the section is properly added in the theme editor

### Products Not Loading

1. Verify the selected collection has products
2. Check that products are published and available
3. Ensure proper API permissions for product data

### Styling Issues

1. The component uses existing theme styles and variables
2. Custom styling can be added to `product-carousel.less`
3. Responsive breakpoints are already configured

## Next Steps

The Product Carousel section is now fully functional and ready to use. You can:

1. Add it to any page through the theme editor
2. Customize the appearance and behavior through the settings
3. Create multiple carousel sections with different collections
4. Further customize the styling if needed

For advanced customization or additional features, modify the files in `/theme/components/product-carousel/` or `/theme/sections/product-carousel.jsx`.
