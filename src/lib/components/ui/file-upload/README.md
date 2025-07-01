# FileUpload Component

A basic file upload component built with Carbon Design System components for Svelte/SvelteKit projects.

## Features

- **Single or Multiple File Selection**: Support for both single and multiple file uploads
- **File Type Validation**: Accept specific file types using the `accept` prop
- **File Size Validation**: Built-in file size validation with customizable limits
- **File Management**: Add, remove, and clear files with event callbacks
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Carbon Design System**: Uses Carbon's FileUploader and FileUploaderItem components

## Installation

This component requires `carbon-components-svelte` to be installed:

```bash
npm install carbon-components-svelte
```

## Basic Usage

```svelte
<script>
  import { FileUpload } from '$lib/components/ui/file-upload';

  function handleFileChange(event) {
    console.log('Files:', event.detail.files);
  }
</script>

<FileUpload on:change={handleFileChange} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string[]` | `[]` | Array of accepted file types (e.g., `['.pdf', '.jpg']`) |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `disabled` | `boolean` | `false` | Disable the file uploader |
| `labelTitle` | `string` | `'Upload files'` | Title text for the uploader |
| `labelDescription` | `string` | `'Max file size is 500MB. Only certain file types are supported.'` | Description text |
| `buttonLabel` | `string` | `'Add file'` | Text for the upload button |
| `maxSize` | `number` | `500 * 1024 * 1024` | Maximum file size in bytes (500MB default) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ files: File[] }` | Fired when files are added or removed |
| `remove` | `{ file: File, index: number }` | Fired when a specific file is removed |
| `clear` | `void` | Fired when all files are cleared |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `clear()` | `void` | Clears all selected files |
| `getFiles()` | `File[]` | Returns array of currently selected files |

## Examples

### Single File Upload

```svelte
<script>
  import { FileUpload } from '$lib/components/ui/file-upload';

  let fileUploader;

  function handleChange(event) {
    console.log('Selected file:', event.detail.files[0]);
  }
</script>

<FileUpload
  bind:this={fileUploader}
  accept={['.pdf', '.doc', '.docx']}
  multiple={false}
  labelTitle="Upload Document"
  labelDescription="Select a document file"
  on:change={handleChange}
/>
```

### Multiple File Upload with Size Limit

```svelte
<script>
  import { FileUpload } from '$lib/components/ui/file-upload';

  const maxSize = 10 * 1024 * 1024; // 10MB

  function handleChange(event) {
    console.log('Selected files:', event.detail.files);
  }
</script>

<FileUpload
  accept={['.jpg', '.jpeg', '.png', '.gif']}
  multiple={true}
  {maxSize}
  labelTitle="Upload Images"
  labelDescription="Select multiple image files (max 10MB each)"
  on:change={handleChange}
/>
```

### With File Management

```svelte
<script>
  import { FileUpload } from '$lib/components/ui/file-upload';

  let fileUploader;

  function clearFiles() {
    fileUploader.clear();
  }

  function getSelectedFiles() {
    const files = fileUploader.getFiles();
    console.log('Current files:', files);
  }
</script>

<FileUpload
  bind:this={fileUploader}
  multiple={true}
  on:change={(e) => console.log('Files changed:', e.detail.files)}
  on:remove={(e) => console.log('File removed:', e.detail.file.name)}
  on:clear={() => console.log('All files cleared')}
/>

<button on:click={clearFiles}>Clear All</button>
<button on:click={getSelectedFiles}>Get Files</button>
```

## Styling

The component uses Carbon's default styling. You can override styles by targeting the `.file-upload-wrapper` class:

```css
:global(.file-upload-wrapper) {
  /* Custom styles */
}
```

## Dependencies

- `carbon-components-svelte` - For FileUploader and FileUploaderItem components
- `svelte` - For createEventDispatcher

## File Validation

The component includes built-in validation for:
- **File Size**: Files exceeding `maxSize` are filtered out with a console warning
- **File Types**: Use the `accept` prop to restrict file types
- **Single vs Multiple**: Automatically handles single file selection when `multiple={false}`

## TypeScript Support

The component is fully typed with TypeScript. Event handlers receive properly typed event objects:

```typescript
function handleFileChange(event: CustomEvent<{ files: File[] }>) {
  // event.detail.files is properly typed as File[]
}
``` 