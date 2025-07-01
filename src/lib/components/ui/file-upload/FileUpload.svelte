<script lang="ts">
	import { FileUploader, FileUploaderItem } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';

	// Props
	export let accept: string[] = [];
	export let multiple: boolean = false;
	export let disabled: boolean = false;
	export let labelTitle: string = 'Upload files';
	export let labelDescription: string = 'Max file size is 500MB. JSON, XLS, and PDF files are supported.';
	export let buttonLabel: string = 'Add file';
	export let maxSize: number = 500 * 1024 * 1024; // 500MB in bytes

	// State
	let files: File[] = [];
	let fileItems: any[] = [];
	let loadingFiles: Set<string> = new Set();
	let fileLoadingStatus: Map<string, string> = new Map();

	// Loading messages
	const loadingMessages = [
		'Processing protocol...',
		'Matching to indication database...',
		'Matching to patient sentiment database...',
		'Cleaning data...',
		'Finalizing analysis...'
	];

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		change: { files: File[] };
		remove: { file: File; index: number };
		clear: void;
		processingComplete: { file: File; index: number };
	}>();

	// Simulate file processing with loading animation
	async function simulateProcessing(fileId: string, file: File, index: number) {
		loadingFiles.add(fileId);
		loadingFiles = loadingFiles; // Trigger reactivity

		for (let i = 0; i < loadingMessages.length; i++) {
			fileLoadingStatus.set(fileId, loadingMessages[i]);
			fileLoadingStatus = fileLoadingStatus; // Trigger reactivity
			
			// Wait for a bit before moving to next message
			await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
		}

		// Processing complete
		loadingFiles.delete(fileId);
		fileLoadingStatus.delete(fileId);
		loadingFiles = loadingFiles; // Trigger reactivity
		fileLoadingStatus = fileLoadingStatus; // Trigger reactivity

		// Update file item status to complete
		fileItems = fileItems.map(item => 
			item.id === fileId 
				? { ...item, status: 'edit' as const }
				: item
		);

		dispatch('processingComplete', { file, index });
	}

	// Handle file addition
	function handleAdd(event: CustomEvent) {
		const newFiles = event.detail.addedFiles as File[];
		
		// Validate file sizes
		const validFiles = newFiles.filter(file => {
			if (file.size > maxSize) {
				console.warn(`File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
				return false;
			}
			return true;
		});

		if (multiple) {
			files = [...files, ...validFiles];
		} else {
			files = validFiles.slice(0, 1);
		}

		// Update file items for display
		fileItems = files.map((file, index) => ({
			id: `file-${index}`,
			name: file.name,
			status: 'uploading' as const,
			file
		}));

		// Start processing animation for each new file
		validFiles.forEach((file, relativeIndex) => {
			const absoluteIndex = multiple ? files.length - validFiles.length + relativeIndex : 0;
			const fileId = `file-${absoluteIndex}`;
			simulateProcessing(fileId, file, absoluteIndex);
		});

		dispatch('change', { files });
	}

	// Handle file removal
	function handleDelete(event: CustomEvent) {
		const { id } = event.detail;
		const index = parseInt(id.split('-')[1]);
		const removedFile = files[index];
		
		// Cancel loading if file is being removed
		if (loadingFiles.has(id)) {
			loadingFiles.delete(id);
			fileLoadingStatus.delete(id);
			loadingFiles = loadingFiles;
			fileLoadingStatus = fileLoadingStatus;
		}
		
		files = files.filter((_, i) => i !== index);
		fileItems = fileItems.filter((_, i) => i !== index);
		
		// Update IDs after removal
		fileItems = fileItems.map((item, i) => ({
			...item,
			id: `file-${i}`
		}));

		dispatch('remove', { file: removedFile, index });
		dispatch('change', { files });
	}

	// Clear all files
	export function clear() {
		files = [];
		fileItems = [];
		loadingFiles.clear();
		fileLoadingStatus.clear();
		loadingFiles = loadingFiles;
		fileLoadingStatus = fileLoadingStatus;
		dispatch('clear');
		dispatch('change', { files: [] });
	}

	// Expose files getter
	export function getFiles(): File[] {
		return [...files];
	}
</script>

<div class="file-upload-wrapper">
	<FileUploader
		{accept}
		{multiple}
		{disabled}
		{labelTitle}
		{labelDescription}
		{buttonLabel}
		on:add={handleAdd}
		on:remove={handleDelete}
	>
		{#each fileItems as item (item.id)}
			<div class="file-item-container">
				<FileUploaderItem
					id={item.id}
					name={item.name}
					status={item.status}
					on:delete={handleDelete}
				/>
			</div>
		{/each}
	</FileUploader>
</div>

<!-- Full-screen loading overlay -->
{#if loadingFiles.size > 0}
	<div class="fullscreen-loading-overlay">
		<div class="loading-content">
			<div class="loading-spinner"></div>
			<div class="loading-text">
				{Array.from(fileLoadingStatus.values())[0] || 'Processing...'}
			</div>
		</div>
	</div>
{/if}

<style>
	.file-upload-wrapper {
		width: 100%;
	}

	.file-item-container {
		position: relative;
	}

	.fullscreen-loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.98);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(2px);
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 48px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #e0e0e0;
		border-top: 4px solid #0f62fe;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-size: 18px;
		color: #161616;
		text-align: center;
		font-weight: 500;
		max-width: 400px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style> 