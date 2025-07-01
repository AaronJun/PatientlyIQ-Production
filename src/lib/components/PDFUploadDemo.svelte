<script lang="ts">
	import * as Card from "$lib/ui/card";
	import { Button } from "$lib/ui/button";
	import { onMount } from 'svelte';
	import { Upload } from 'phosphor-svelte';
	
	// Props
	export let addStudy: (study: { name: string; indication: string; phase: string; status: string }) => void;
	
	// Demo states
	let currentStep = 0;
	let uploadProgress = 0;
	let processingProgress = 0;
	let analysisProgress = 0;
	let isUploading = false;
	let isProcessing = false;
	let isAnalyzing = false;
	let isComplete = false;
	let fileName = "";
	let fileSize = "";

	// Processing steps with realistic descriptions
	const processingSteps = [
		"Extracting protocol text...",
		"Formatting schedule and assessments...",
		"Identifying PIQ datapoints...",
		"Processing clinical terminology...",
		"Mapping patient journey touchpoints...",
		"Building relevant participant personas...",
		"Generating insights and recommendations..."
	];

	let currentProcessingStep = 0;

	// Mock file upload
	function handleFileUpload(event: Event) {
		const files = (event.target as HTMLInputElement)?.files;
		if (files && files[0]) {
			startDemo(files[0]);
		}
	}

	// Handle drag and drop
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const files = event.dataTransfer?.files;
		if (files && files[0]) {
			startDemo(files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	// Start the demo simulation
	function startDemo(file?: File) {
		// Reset state
		currentStep = 1;
		uploadProgress = 0;
		processingProgress = 0;
		analysisProgress = 0;
		isUploading = true;
		isProcessing = false;
		isAnalyzing = false;
		isComplete = false;
		currentProcessingStep = 0;

		// Set mock file info
		fileName = file?.name || "Clinical_Protocol_Study_ABC123.pdf";
		fileSize = file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "2.4 MB";

		// Simulate upload progress
		const uploadInterval = setInterval(() => {
			uploadProgress += Math.random() * 15 + 5;
			if (uploadProgress >= 100) {
				uploadProgress = 100;
				isUploading = false;
				isProcessing = true;
				currentStep = 2;
				clearInterval(uploadInterval);
				startProcessing();
			}
		}, 200);
	}

	// Simulate processing steps
	function startProcessing() {
		const processingInterval = setInterval(() => {
			processingProgress += Math.random() * 10 + 3;
			
			// Update processing step description
			const stepProgress = Math.floor((processingProgress / 100) * processingSteps.length);
			if (stepProgress < processingSteps.length) {
				currentProcessingStep = stepProgress;
			}

			if (processingProgress >= 100) {
				processingProgress = 100;
				isProcessing = false;
				isAnalyzing = true;
				currentStep = 3;
				clearInterval(processingInterval);
				startAnalysis();
			}
		}, 300);
	}

	// Simulate analysis phase
	function startAnalysis() {
		const analysisInterval = setInterval(() => {
			analysisProgress += Math.random() * 8 + 4;
			if (analysisProgress >= 100) {
				analysisProgress = 100;
				isAnalyzing = false;
				isComplete = true;
				currentStep = 4;
				clearInterval(analysisInterval);
				
				// Add the new study when analysis completes
				addStudy({
					name: 'STUDY-302',
					indication: 'Focal Onset Seizures',
					phase: 'Phase III',
					status: 'active'
				});
			}
		}, 250);
	}

	// Reset demo
	function resetDemo() {
		currentStep = 0;
		uploadProgress = 0;
		processingProgress = 0;
		analysisProgress = 0;
		isUploading = false;
		isProcessing = false;
		isAnalyzing = false;
		isComplete = false;
		fileName = "";
		fileSize = "";
		currentProcessingStep = 0;
	}
</script>

<div class="pdf-upload-demo">
	<Card.Root class="max-w-4xl mx-auto">
		<Card.Header>
			<Card.Title class="text-2xl font-bold text-center">Protocol Upload</Card.Title>
			<Card.Description class="text-center">
Upload your clinical protocol in PDF or DOCX, or uploa a schedule of assessments as CSV or XLSX, to get started.			</Card.Description>
		</Card.Header>
		
		<Card.Content>
			{#if currentStep === 0}
				<!-- Initial Upload Interface -->
				<div class="upload-area" 
					 on:drop={handleDrop} 
					 on:dragover={handleDragOver}
					 role="button"
					 tabindex="0">
					<div class="upload-content">
						<Upload size={24} />
						<h3>Upload Your Clinical Protocol</h3>
						<p>Drag and drop your PDF or DOCX protocol draft, or a schedule of assessments in CSV or XLSX.</p>
						<input
							type="file"
							accept=".pdf"
							on:change={handleFileUpload}
							class="file-input"
							id="pdf-upload"
						/>
						<Button 
							variant="default" 
							size="lg"
							onclick={() => document.getElementById('pdf-upload')?.click()}
						>
							Choose File
						</Button>
					</div>
				</div>
			{:else}
				<!-- Progress Interface -->
				<div class="progress-container">
					<!-- File Info -->
					<div class="file-info">
						<div class="file-icon">📄</div>
						<div class="file-details">
							<div class="file-name">{fileName}</div>
							<div class="file-size">{fileSize}</div>
						</div>
						<div class="file-status">
							{#if isComplete}
								<span class="status-complete">✅ Complete</span>
							{:else if isAnalyzing}
								<span class="status-processing">🔍 Analyzing</span>
							{:else if isProcessing}
								<span class="status-processing">⚙️ Processing</span>
							{:else if isUploading}
								<span class="status-uploading">⬆️ Uploading</span>
							{/if}
						</div>
					</div>

					<!-- Progress Steps -->
					<div class="progress-steps">
						<!-- Step 1: Upload -->
						<div class="progress-step" class:active={currentStep >= 1} class:complete={currentStep > 1}>
							<div class="step-header">
								<div class="step-number">1</div>
								<div class="step-title">File Upload</div>
							</div>
							{#if currentStep >= 1}
								<div class="progress-bar">
									<div class="progress-fill" style="width: {uploadProgress}%"></div>
								</div>
								<div class="progress-text">{uploadProgress.toFixed(0)}% uploaded</div>
							{/if}
						</div>

						<!-- Step 2: Processing -->
						<div class="progress-step" class:active={currentStep >= 2} class:complete={currentStep > 2}>
							<div class="step-header">
								<div class="step-number">2</div>
								<div class="step-title">Document Processing</div>
							</div>
							{#if currentStep >= 2}
								<div class="progress-bar">
									<div class="progress-fill" style="width: {processingProgress}%"></div>
								</div>
								<div class="progress-text">
									{#if currentProcessingStep < processingSteps.length}
										{processingSteps[currentProcessingStep]}
									{:else}
										Processing complete
									{/if}
								</div>
							{/if}
						</div>

						<!-- Step 3: Analysis -->
						<div class="progress-step" class:active={currentStep >= 3} class:complete={currentStep > 3}>
							<div class="step-header">
								<div class="step-number">3</div>
								<div class="step-title">Journey Analysis</div>
							</div>
							{#if currentStep >= 3}
								<div class="progress-bar">
									<div class="progress-fill" style="width: {analysisProgress}%"></div>
								</div>
								<div class="progress-text">
									{#if analysisProgress < 100}
										Generating patient journey insights...
									{:else}
										Analysis complete
									{/if}
								</div>
							{/if}
						</div>

						<!-- Step 4: Results -->
						{#if currentStep >= 4}
							<div class="results-section">
								<div class="results-header">
									<h3>Processing Complete!</h3>
									<p>Your clinical protocol has been successfully analyzed</p>
								</div>
								
								<div class="results-grid">
									<div class="result-item">
										<div class="result-title">Burden Assessment</div>
										<div class="result-description">Identified 23 patient touchpoints across 8 study visits</div>
									</div>
									<div class="result-item">
										<div class="result-title">Schedule Optimization</div>
										<div class="result-description">Recommendations to reduce burden by 31%</div>
									</div>
									<div class="result-item">
										<div class="result-title">Key Insights</div>
										<div class="result-description">15 actionable recommendations generated</div>
									</div>
									<div class="result-item">
										<div class="result-title">Predicted Impact</div>
										<div class="result-description">18% improvement in retention rate</div>
									</div>
								</div>

								<div class="action-buttons">
									<Button variant="default" size="lg">View Full Analysis</Button>
									<Button variant="outline" size="lg" onclick={resetDemo}>Upload Another File</Button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<style>
	.pdf-upload-demo {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}

	.upload-area {
		border: 2px dashed #cbd5e1;
		border-radius: 12px;
		padding: 3rem;
		text-align: center;
		background: #f8fafc;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.upload-area:hover {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.upload-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.upload-content h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.upload-content p {
		color: #64748b;
		font-size: 0.8rem;
		margin: 0;
	}

	.file-input {
		display: none;
	}

	.progress-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.file-info {
		display: flex;
		align-items: center;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 8px;
		gap: 1rem;
	}

	.file-icon {
		font-size: 2rem;
	}

	.file-details {
		flex: 1;
	}

	.file-name {
		font-weight: 600;
		color: #1e293b;
	}

	.file-size {
		font-size: 0.9rem;
		color: #64748b;
	}

	.file-status {
		font-weight: 500;
	}

	.status-uploading {
		color: #3b82f6;
	}

	.status-processing {
		color: #f59e0b;
	}

	.status-complete {
		color: #10b981;
	}

	.progress-steps {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.progress-step {
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		background: #ffffff;
		opacity: 0.5;
		transition: all 0.3s ease;
	}

	.progress-step.active {
		opacity: 1;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	.progress-step.complete {
		opacity: 1;
		border-color: #10b981;
		background: #f0fdf4;
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.step-number {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
		color: #64748b;
	}

	.progress-step.active .step-number {
		background: #3b82f6;
		color: white;
	}

	.progress-step.complete .step-number {
		background: #10b981;
		color: white;
	}

	.step-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e2e8f0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #1d4ed8);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.9rem;
		color: #64748b;
		font-style: italic;
	}

	.results-section {
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid #10b981;
	}

	.results-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.results-header h3 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}

	.results-header p {
		color: #64748b;
		margin: 0;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.result-item {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #d1fae5;
		text-align: center;
	}

	.result-title {
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 0.25rem;
	}

	.result-description {
		font-size: 0.9rem;
		color: #64748b;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.upload-area {
			padding: 2rem 1rem;
		}

		.upload-icon {
			font-size: 2rem;
		}

		.file-info {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.progress-step {
			padding: 1rem;
		}

		.step-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.results-grid {
			grid-template-columns: 1fr;
		}

		.action-buttons {
			flex-direction: column;
			align-items: center;
		}

		.action-buttons :global(button) {
			width: 100%;
			max-width: 300px;
		}
	}
</style> 