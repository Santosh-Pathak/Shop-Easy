# DynamicCardList Component

A flexible and responsive card-based display component that provides multiple view types and all the features of the DynamicTable component including search, pagination, debouncing, and server-side data handling.

## Features

### ✅ **Multiple View Types**

- **Default**: Standard card layout with avatar, title, subtitle, contact info, and badges
- **Compact**: Minimal horizontal layout perfect for lists
- **Detailed**: Comprehensive card with full contact information and content
- **Grid**: Grid-style layout optimized for profile-like displays
- **List**: Horizontal list format with structured information columns
- **Minimal**: Ultra-compact design for maximum density

### ✅ **All DynamicTable Features**

- Server-side and client-side pagination
- Real-time search with debouncing (300ms)
- Loading states with animated indicators
- Responsive design for all screen sizes
- URL synchronization for search and pagination
- Automatic search placeholder detection based on route

### ✅ **Advanced Card Features**

- Custom field mapping for different data types
- Configurable card content, badges, and actions
- Avatar support with fallback initials
- Responsive grid layouts that adapt to screen size
- Hover effects and smooth animations
- Custom action menus with dropdowns

### ✅ **Responsive Design**

- **Mobile (< 640px)**: Single column layout with optimized spacing
- **Tablet (640px - 1024px)**: 2-column grid for most view types
- **Desktop (1024px+)**: 3-column grid with full feature set
- **Large screens (1280px+)**: 4-column grid for grid view type

## Usage

### Basic Implementation

```tsx
import DynamicCardList from '@/components/common/DynamicCardList'

const MyComponent = () => {
   return (
      <DynamicCardList
         data={leads}
         columns={columns}
         pageSize={12}
         onSearch={handleSearch}
         onPageChange={handlePageChange}
         isLoading={loading}
         totalCount={totalCount}
         currentPage={currentPage}
         isServerSide={true}
         searchPlaceholder="Search leads..."
         viewType="default"
         onViewTypeChange={setViewType}
         nameField="name"
         emailField="email"
         phoneField="phone"
         statusField="status"
         dateField="createdAt"
         companyField="businessName"
      />
   )
}
```

### Advanced Implementation with Custom Props

```tsx
<DynamicCardList
   data={leads}
   columns={columns}
   pageSize={12}
   onSearch={handleSearch}
   onPageChange={handlePageChange}
   isLoading={loading}
   totalCount={totalCount}
   currentPage={currentPage}
   isServerSide={true}
   viewType={cardViewType}
   onViewTypeChange={setCardViewType}
   nameField="name"
   emailField="email"
   phoneField="phone"
   statusField="status"
   dateField="createdAt"
   companyField="businessName"
   priorityField="priority"
   cardTitle={(lead) =>
      lead.name ||
      lead.fullName ||
      `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
   }
   cardSubtitle={(lead) => lead.businessName || lead.email || ''}
   cardBadges={(lead) => [
      {
         label: statusConfig[lead.status]?.label || lead.status,
         color: statusConfig[lead.status]?.color || 'bg-gray-100 text-gray-800',
      },
      ...(lead.priority
         ? [
              {
                 label: priorityConfig[lead.priority]?.label || lead.priority,
                 color:
                    priorityConfig[lead.priority]?.color ||
                    'bg-gray-100 text-gray-800',
              },
           ]
         : []),
   ]}
   cardActions={(lead) => (
      <div className="flex gap-1">
         <Button onClick={() => handleView(lead)} size="sm">
            <Eye className="h-4 w-4" />
         </Button>
         <Button onClick={() => handleEdit(lead)} size="sm">
            <Edit className="h-4 w-4" />
         </Button>
      </div>
   )}
   cardContent={(lead) => (
      <div className="space-y-2 text-sm">
         {lead.jobTitle && <p>Position: {lead.jobTitle}</p>}
         {lead.leadSource && <p>Source: {lead.leadSource}</p>}
      </div>
   )}
/>
```

## Props

### Core Props (from DynamicTable)

| Prop                | Type                           | Required | Default       | Description                               |
| ------------------- | ------------------------------ | -------- | ------------- | ----------------------------------------- |
| `data`              | `T[]`                          | Yes      | -             | Array of data items to display            |
| `columns`           | `Column<T>[]`                  | Yes      | -             | Column definitions (inherited from table) |
| `pageSize`          | `number`                       | No       | `12`          | Number of items per page                  |
| `onSearch`          | `(searchTerm: string) => void` | No       | -             | Search callback function                  |
| `onPageChange`      | `(page: number) => void`       | No       | -             | Page change callback                      |
| `isLoading`         | `boolean`                      | No       | `false`       | Loading state                             |
| `searchPlaceholder` | `string`                       | No       | Auto-detected | Custom search placeholder                 |
| `totalCount`        | `number`                       | No       | -             | Total count for server-side pagination    |
| `currentPage`       | `number`                       | No       | -             | Current page for server-side pagination   |
| `isServerSide`      | `boolean`                      | No       | `false`       | Enable server-side pagination             |

### Card-Specific Props

| Prop               | Type                           | Required | Default         | Description               |
| ------------------ | ------------------------------ | -------- | --------------- | ------------------------- |
| `viewType`         | `ViewType`                     | No       | `'default'`     | Card layout type          |
| `onViewTypeChange` | `(viewType: ViewType) => void` | No       | -               | View type change callback |
| `cardTitle`        | `(row: T) => string`           | No       | Auto-detected   | Custom title function     |
| `cardSubtitle`     | `(row: T) => string`           | No       | Auto-detected   | Custom subtitle function  |
| `cardImage`        | `(row: T) => string`           | No       | -               | Custom image URL function |
| `cardBadges`       | `(row: T) => Badge[]`          | No       | -               | Custom badges function    |
| `cardActions`      | `(row: T) => React.ReactNode`  | No       | Default actions | Custom actions component  |
| `cardContent`      | `(row: T) => React.ReactNode`  | No       | -               | Additional card content   |

### Field Mapping Props

| Prop            | Type      | Required | Description          |
| --------------- | --------- | -------- | -------------------- |
| `nameField`     | `keyof T` | No       | Field for name/title |
| `emailField`    | `keyof T` | No       | Field for email      |
| `phoneField`    | `keyof T` | No       | Field for phone      |
| `statusField`   | `keyof T` | No       | Field for status     |
| `dateField`     | `keyof T` | No       | Field for date       |
| `imageField`    | `keyof T` | No       | Field for image URL  |
| `companyField`  | `keyof T` | No       | Field for company    |
| `locationField` | `keyof T` | No       | Field for location   |
| `priorityField` | `keyof T` | No       | Field for priority   |

## View Types

### Default View

- Standard card layout
- Avatar with fallback initials
- Title and subtitle
- Contact information with icons
- Custom content area
- Badge collection at bottom
- Actions in header

### Compact View

- Horizontal layout
- Small avatar
- Truncated text
- Single badge
- Minimal spacing
- Perfect for lists

### Detailed View

- Comprehensive information display
- Large avatar
- Full contact details with icons
- All badges displayed
- Custom content area
- Hover animations

### Grid View

- Centered layout
- Large avatar
- Profile-style display
- Single primary badge
- Optimized for user profiles
- Scale hover effect

### List View

- Table-like horizontal layout
- Structured information columns
- Multiple badges
- Professional appearance
- Good for data-heavy content

### Minimal View

- Ultra-compact design
- Small circular avatar
- Essential information only
- Single badge
- Maximum information density

## Responsive Breakpoints

```css
/* Mobile First Approach */
grid-cols-1                    /* < 640px - All view types single column */
sm:grid-cols-2                 /* 640px+ - Default, detailed views */
lg:grid-cols-3                 /* 1024px+ - Most view types */
xl:grid-cols-4                 /* 1280px+ - Grid view type */
```

## Styling & Theming

The component uses Tailwind CSS with built-in dark mode support:

- **Light Theme**: Clean whites with subtle gradients
- **Dark Theme**: Dark grays with blue/purple accents
- **Hover Effects**: Smooth transitions and scale effects
- **Loading States**: Blur overlay with spinner
- **Backdrop Blur**: Modern glassmorphism effects

## Integration with LeadManagement

The component is fully integrated into the LeadManagement system:

```tsx
// View mode toggle
const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
const [cardViewType, setCardViewType] = useState<ViewType>('default');

// Desktop toggle
<div className="flex items-center rounded-lg border p-1">
  <Button onClick={() => setViewMode('table')} variant={viewMode === 'table' ? 'default' : 'ghost'}>
    <List className="h-4 w-4" /> Table
  </Button>
  <Button onClick={() => setViewMode('cards')} variant={viewMode === 'cards' ? 'default' : 'ghost'}>
    <Grid className="h-4 w-4" /> Cards
  </Button>
</div>

// Mobile toggle
<div className="flex items-center rounded-lg border bg-white/90 p-1">
  <Button onClick={() => setViewMode('table')} className="h-10 w-10 p-0" title="Table View">
    <List className="h-4 w-4" />
  </Button>
  <Button onClick={() => setViewMode('cards')} className="h-10 w-10 p-0" title="Card View">
    <Grid className="h-4 w-4" />
  </Button>
</div>
```

## Performance Features

- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Lazy Loading**: Only render visible cards
- **Optimized Animations**: GPU-accelerated transforms
- **Memory Management**: Automatic cleanup of timeouts
- **Efficient Pagination**: Server-side pagination support

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Logical tab order
- **High Contrast**: Dark mode support
- **Responsive Text**: Scalable font sizes

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 72+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Responsive Design**: All screen sizes from 320px to 4K
- **Performance**: Optimized for mobile devices

## Future Enhancements

### Planned Features

- [ ] Virtual scrolling for large datasets
- [ ] Infinite scroll pagination option
- [ ] Drag and drop card reordering
- [ ] Card selection and bulk actions
- [ ] Export functionality (CSV, PDF)
- [ ] Advanced filtering UI
- [ ] Custom card templates
- [ ] Animation customization options

### Performance Optimizations

- [ ] Card virtualization
- [ ] Image lazy loading
- [ ] Progressive loading states
- [ ] Cached search results
- [ ] Service worker caching

## Troubleshooting

### Common Issues

**Cards not displaying:**

- Check data array is not empty
- Verify field mappings match your data structure
- Ensure required props are provided

**Search not working:**

- Confirm onSearch callback is implemented
- Check server-side search endpoint
- Verify debouncing is not too aggressive

**Pagination issues:**

- Ensure proper 0-based to 1-based conversion
- Check totalCount is correctly set
- Verify page change handler updates state

**Responsive issues:**

- Test on different screen sizes
- Check CSS grid classes are applied
- Verify Tailwind CSS is properly configured

### Debug Mode

Enable debug mode by adding to your data:

```tsx
const debugData = data.map((item, index) => ({
   ...item,
   _debug: { index, viewType: currentViewType },
}))
```

## Dependencies

- `@/components/ui/*` - Shadcn UI components
- `@/components/common/DynamicTable` - Base table component
- `lucide-react` - Icon components
- `next/navigation` - Next.js routing hooks
- `tailwindcss` - Styling framework

## Contributing

When contributing to this component:

1. Maintain responsive design principles
2. Test all view types on different screen sizes
3. Ensure accessibility standards
4. Add appropriate TypeScript types
5. Update documentation for new features
6. Test with different data structures

## License

This component is part of the Synergy Telecom project and follows the project's licensing terms.
