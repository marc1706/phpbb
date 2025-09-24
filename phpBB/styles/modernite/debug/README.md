# Modernite Style Debug Files

This directory contains static HTML files that demonstrate how the modernite style should render. These files can be opened directly in a web browser to compare against the actual phpBB implementation.

## Files Included:

### `index_test.html`
- Simulates the main forum index page
- Shows the header with logo, search box, and navigation
- Displays forum categories and forum lists
- Includes statistics blocks (Who's online, Birthdays)
- Contains a login form

### `viewforum_test.html`
- Simulates a forum topic list page
- Shows breadcrumb navigation
- Displays topic list with replies, views, and last post information
- Includes pagination and action bars

## How to Use:

1. Open the HTML files directly in your web browser
2. Compare the rendering with your actual phpBB installation using the modernite style
3. Both should look identical if the CSS is working correctly

## CSS Dependencies:

The files reference:
- Font Awesome 6.0.0 from CDN for icons
- `../theme/stylesheet.css` - the main modernite stylesheet

## Expected Appearance:

The pages should display with:
- Beautiful gradient header (purple/blue gradient)
- Modern glassmorphism search box with backdrop blur
- Clean white navigation bar with subtle shadows
- Card-based forum layout with rounded corners
- Professional typography and spacing
- Responsive design that adapts to screen size

If your actual phpBB installation doesn't match these test files, there may be:
- Missing CSS rules
- Template structure differences
- JavaScript conflicts
- Cache issues

## Troubleshooting:

1. Clear your browser cache
2. Check that all CSS files are loading correctly
3. Verify that Font Awesome icons are loading
4. Compare the HTML structure of your actual pages with these test files
5. Check browser developer tools for any CSS errors or conflicts