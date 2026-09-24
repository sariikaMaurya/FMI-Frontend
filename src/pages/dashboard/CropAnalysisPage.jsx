import React, { useState, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { analyzeCropImage } from '../../features/ai/api';
import { toast } from 'react-toastify';

const MAX_SIZE_MB = 5;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function CropAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) {
      return 'Please select an image file to proceed.';
    }

    const mime = file.type ? file.type.toLowerCase() : '';
    // Also check extension fallback if mime is missing
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];

    if (!ALLOWED_TYPES.includes(mime) && !validExts.includes(ext)) {
      return 'Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.';
    }

    if (file.size > MAX_BYTES) {
      return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`;
    }

    if (file.size === 0) {
      return 'The selected file is empty. Please choose a valid image.';
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setErrorMessage('');
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setErrorMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      const msg = 'Please select a crop image to analyze.';
      setErrorMessage(msg);
      toast.warning(msg);
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setUploadProgress(0);

    try {
      const response = await analyzeCropImage(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response?.success && response?.data) {
        setAnalysisResult(response.data);
        toast.success('Crop health analysis complete!');
      } else {
        throw new Error(response?.message || 'Unexpected response received from AI service.');
      }
    } catch (err) {
      console.error('Crop analysis failure:', err);
      let userFriendlyMsg = 'Failed to analyze crop image. Please check your connection and try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.response?.status === 504) {
        userFriendlyMsg = 'The AI analysis service timed out. Please try uploading a clearer or slightly smaller image.';
      } else if (err.response?.status === 401) {
        userFriendlyMsg = 'Your session has expired. Please log in again to analyze crop images.';
      } else if (err.response?.status === 403) {
        userFriendlyMsg = 'Access restricted: Only registered farmers can use the AI crop analysis tool.';
      } else if (err.response?.data?.message) {
        userFriendlyMsg = err.response.data.message;
      } else if (!window.navigator.onLine) {
        userFriendlyMsg = 'Network offline. Please check your internet connection and try again.';
      }

      setErrorMessage(userFriendlyMsg);
      toast.error(userFriendlyMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout title="AI Crop Health Analysis">
      <div className="crop-analysis-container">
        {/* Header banner */}
        <div className="module-toolbar mb-4">
          <div>
            <h3 className="mb-1 text-primary-dark">AI Crop Health Analysis</h3>
            <p className="text-muted mb-0">
              Upload a clear photo of your plant or leaves to scan for preliminary health indicators, stress signs, and recommended care steps.
            </p>
          </div>
          <div className="toolbar-actions">
            <span className="badge bg-light text-dark border px-3 py-2">
              Farmer Workspace
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="flex-shrink-0">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <div>{errorMessage}</div>
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Upload & Preview Card */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100 analysis-input-card">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0 text-dark font-weight-bold">Upload Crop Image</h5>
              </div>
              <div className="card-body p-4 d-flex flex-column">
                {!previewUrl ? (
                  <div
                    className={`dropzone-box ${isDragOver ? 'dropzone-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="d-none"
                      onChange={handleInputChange}
                    />
                    <div className="dropzone-content text-center">
                      <div className="dropzone-icon mb-3">
                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-primary">
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                        </svg>
                      </div>
                      <h6 className="font-weight-bold mb-1">Click to browse or drag and drop image here</h6>
                      <p className="text-muted small mb-2">Supported formats: JPG, JPEG, PNG, WEBP (Max 5MB)</p>
                      <button type="button" className="btn btn-outline-primary btn-sm px-3 mt-1">
                        Select Crop Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="preview-container text-center position-relative">
                    <div className="preview-image-wrapper">
                      <img
                        src={previewUrl}
                        alt="Crop preview"
                        className={`img-fluid rounded preview-img ${isAnalyzing ? 'scanning-active' : ''}`}
                      />
                      {isAnalyzing && (
                        <div className="scanner-line"></div>
                      )}
                    </div>
                    <div className="mt-3 d-flex justify-content-between align-items-center bg-light p-2 rounded border">
                      <div className="text-start small text-truncate pe-2">
                        <strong>{selectedFile?.name}</strong>
                        <span className="text-muted ms-2">
                          ({(selectedFile?.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleReset}
                        disabled={isAnalyzing}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {isAnalyzing && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>{uploadProgress < 100 ? 'Uploading crop image...' : 'AI Analyzing image features...'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleSubmit}
                    disabled={!selectedFile || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Analyzing Crop...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                          <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                        </svg>
                        <span>Analyze Crop Health</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results Display */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100 analysis-results-card">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark font-weight-bold">Analysis Results</h5>
                {analysisResult && (
                  <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                    Completed
                  </span>
                )}
              </div>
              <div className="card-body p-4">
                {!analysisResult && !isAnalyzing && (
                  <div className="empty-results-state text-center py-5 text-muted">
                    <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="text-muted opacity-50 mb-3">
                      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.5 7.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" />
                    </svg>
                    <h6>No analysis results yet</h6>
                    <p className="small mb-0">Select or drop a crop image on the left and click "Analyze Crop Health".</p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="analyzing-state text-center py-5">
                    <div className="spinner-grow text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5>Inspecting plant foliage...</h5>
                    <p className="text-muted small">
                      Evaluating visual leaf patterns, color variations, and potential symptoms.
                    </p>
                  </div>
                )}

                {analysisResult && !isAnalyzing && (
                  <div className="analysis-result-content">
                    {/* Possible Issue */}
                    <div className="result-section mb-4">
                      <label className="text-muted text-uppercase small font-weight-bold d-block mb-1">
                        Possible Issue:
                      </label>
                      <div className="possible-issue-badge p-3 rounded bg-light border-start border-4 border-warning">
                        <h4 className="text-dark mb-0 font-weight-bold">
                          {analysisResult.possibleIssue || 'Possible crop-health issue detected'}
                        </h4>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="result-section mb-4">
                      <label className="text-muted text-uppercase small font-weight-bold d-block mb-1">
                        Confidence:
                      </label>
                      {analysisResult.confidence !== null && analysisResult.confidence !== undefined ? (
                        <div className="confidence-box d-flex align-items-center gap-3 p-3 bg-light rounded border">
                          <span className="display-6 font-weight-bold text-success mb-0">
                            {analysisResult.confidence}%
                          </span>
                          <div className="flex-grow-1">
                            <div className="progress" style={{ height: '10px' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${analysisResult.confidence}%` }}
                                aria-valuenow={analysisResult.confidence}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                            <span className="text-muted small mt-1 d-block">
                              Model visual feature certainty
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-secondary mb-0 py-2 px-3 small">
                          Confidence information was not provided by the analysis model.
                        </div>
                      )}
                    </div>

                    {/* Uncertainty information */}
                    {analysisResult.uncertainty && (
                      <div className="result-section mb-4">
                        <label className="text-muted text-uppercase small font-weight-bold d-block mb-1">
                          Uncertainty Information:
                        </label>
                        <div className="p-3 bg-light rounded border small text-muted">
                          {analysisResult.uncertainty}
                        </div>
                      </div>
                    )}

                    {/* Recommended Next Steps */}
                    <div className="result-section mb-4">
                      <label className="text-muted text-uppercase small font-weight-bold d-block mb-2">
                        Recommended Next Steps:
                      </label>
                      <ul className="list-group list-group-flush border rounded">
                        {(analysisResult.recommendedNextSteps || []).map((step, idx) => (
                          <li key={idx} className="list-group-item d-flex align-items-start gap-2 py-2">
                            <span className="step-bullet text-primary font-weight-bold">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mandatory Disclaimer */}
                    <div className="alert alert-warning border-warning d-flex align-items-start gap-2 mb-0" role="alert">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="flex-shrink-0 mt-1">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                      <div className="small">
                        <strong>Disclaimer: </strong>
                        {analysisResult.disclaimer || 'This AI analysis is preliminary and may be inaccurate. Consult an agricultural expert for confirmation.'}
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={handleReset}
                      >
                        Analyze Another Crop Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
