<script lang="ts">
	import FileUpload from './FileUpload.svelte';

	let singleFileUploader: FileUpload;
	let multipleFileUploader: FileUpload;

	// Handle file changes
	function handleFileChange(event: CustomEvent<{ files: File[] }>) {
		console.log('Files changed:', event.detail.files);
	}

	function handleFileRemove(event: CustomEvent<{ file: File; index: number }>) {
		console.log('File removed:', event.detail.file.name);
	}

	function handleClear() {
		console.log('Files cleared');
	}

	// Clear functions
	function clearSingleFiles() {
		singleFileUploader?.clear();
	}

	function clearMultipleFiles() {
		multipleFileUploader?.clear();
	}

	// Get files functions
	function logSingleFiles() {
		const files = singleFileUploader?.getFiles() || [];
		console.log('Single uploader files:', files);
	}

	function logMultipleFiles() {
		const files = multipleFileUploader?.getFiles() || [];
		console.log('Multiple uploader files:', files);
	}
</script>

<div class="file-upload-examples">
	<h2>File Upload Examples</h2>
	
	<div class="example-section">
		<h3>Single File Upload</h3>
		<FileUpload
			bind:this={singleFileUploader}
			accept={['.pdf', '.doc', '.docx']}
			multiple={false}
			labelTitle="Upload Document"
			labelDescription="Select a single document file (PDF, DOC, DOCX)"
			buttonLabel="Choose Document"
			on:change={handleFileChange}
			on:remove={handleFileRemove}
			on:clear={handleClear}
		/>
		<div class="button-group">
			<button class="btn-secondary" on:click={clearSingleFiles}>Clear Files</button>
			<button class="btn-primary" on:click={logSingleFiles}>Log Files</button>
		</div>
	</div>

	<div class="example-section">
		<h3>Multiple File Upload</h3>
		<FileUpload
			bind:this={multipleFileUploader}
			accept={['.jpg', '.jpeg', '.png', '.gif']}
			multiple={true}
			labelTitle="Upload Images"
			labelDescription="Select multiple image files (JPG, PNG, GIF)"
			buttonLabel="Choose Images"
			maxSize={10 * 1024 * 1024}
			on:change={handleFileChange}
			on:remove={handleFileRemove}
			on:clear={handleClear}
		/>
		<div class="button-group">
			<button class="btn-secondary" on:click={clearMultipleFiles}>Clear Files</button>
			<button class="btn-primary" on:click={logMultipleFiles}>Log Files</button>
		</div>
	</div>

	<div class="example-section">
		<h3>Basic File Upload</h3>
		<FileUpload
			on:change={handleFileChange}
			on:remove={handleFileRemove}
			on:clear={handleClear}
		/>
	</div>
</div>

<style>
	.file-upload-examples {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.example-section {
		margin-bottom: 3rem;
		padding: 1.5rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
	}

	.example-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #333;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s;
	}

	.btn-primary {
		background-color: #0f62fe;
		color: white;
	}

	.btn-primary:hover {
		background-color: #0353e9;
	}

	.btn-secondary {
		background-color: #f4f4f4;
		color: #161616;
		border: 1px solid #8d8d8d;
	}

	.btn-secondary:hover {
		background-color: #e8e8e8;
	}
</style> 