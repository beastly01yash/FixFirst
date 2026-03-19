// ==================== CITIZEN DASHBOARD ====================

function showCitizenDashboard() {
    updateNav();
    
    const user = AppState.getUser();
    const myIssues = AppState.getUserIssues();
    const allIssues = AppState.getIssues().sort((a, b) => b.upvotes - a.upvotes);
    const pending = myIssues.filter(i => i.status !== 'resolved').length;
    const resolved = myIssues.filter(i => i.status === 'resolved').length;
    
    render(`
        <div class="container">
            <div class="hero">
                <h2>Welcome back, ${user.name}!</h2>
                <p>Track your reports and see issues in your area</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-label">Your Reports</div>
                    <div class="stat-number">${myIssues.length}</div>
                    <div class="stat-desc">Total issues reported</div>
                </div>
                <div class="stat-card yellow">
                    <div class="stat-label">Pending</div>
                    <div class="stat-number">${pending}</div>
                    <div class="stat-desc">Awaiting resolution</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-label">Resolved</div>
                    <div class="stat-number">${resolved}</div>
                    <div class="stat-desc">Fixed issues</div>
                </div>
            </div>
            
            <div class="text-center mb-3">
                <button class="btn btn-primary" onclick="showReportForm()">
                    📝 Report New Issue
                </button>
                <button class="btn btn-secondary" onclick="showMapView()">
                    🗺️ View Map
                </button>
            </div>
            
            ${myIssues.length > 0 ? `
                <div class="card">
                    <h3 style="margin-bottom: 1rem;">Your Reports</h3>
                    <div class="issues-grid">
                        ${myIssues.map(issue => renderIssueCard(issue)).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="card">
                <h3 style="margin-bottom: 1rem;">Top Issues in Your Area (by upvotes)</h3>
                <div class="issues-grid">
                    ${allIssues.slice(0, 5).map(issue => renderIssueCard(issue)).join('')}
                </div>
            </div>
        </div>
    `);
}

// ==================== REPORT FORM ====================

let reportLocation = null;
let reportImage = null;
let cameraStream = null;
let reportLat = null;
let reportLon = null;

async function openCamera() {
    try {
        const video = document.getElementById('cameraPreview');
        const uploadPrompt = document.getElementById('uploadPrompt');
        const cameraControls = document.getElementById('cameraControls');
        
        // Request camera access - rear camera preferred on mobile
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' }, // Use rear camera on mobile
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };
        
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStream;
        
        // Show camera preview and hide upload prompt
        uploadPrompt.style.display = 'none';
        video.style.display = 'block';
        cameraControls.style.display = 'block';
        
    } catch (error) {
        console.error('Camera access error:', error);
        showError('Unable to access camera. Please ensure camera permissions are granted.');
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    const video = document.getElementById('cameraPreview');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const cameraControls = document.getElementById('cameraControls');
    
    video.style.display = 'none';
    cameraControls.style.display = 'none';
    uploadPrompt.style.display = 'flex';
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('photoCanvas');
    const preview = document.getElementById('imagePreview');
    const cameraControls = document.getElementById('cameraControls');
    const retakeControls = document.getElementById('retakeControls');
    const container = document.getElementById('imageUploadContainer');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert canvas to base64 image
    reportImage = canvas.toDataURL('image/jpeg', 0.8);

    // Attempt to geotag the captured photo using device GPS
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                reportLat = position.coords.latitude;
                reportLon = position.coords.longitude;

                // Update hidden inputs (if present) so submission uses photo geotag
                const latInput = document.getElementById('lat');
                const lonInput = document.getElementById('lon');
                const locationDisplay = document.getElementById('locationDisplay');
                if (latInput) latInput.value = reportLat;
                if (lonInput) lonInput.value = reportLon;
                if (locationDisplay) locationDisplay.value = `Photo geotag (${reportLat.toFixed(4)}, ${reportLon.toFixed(4)})`;

                showSuccess('Photo geotag captured');
            },
            error => {
                console.warn('Geotagging failed:', error);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }
    
    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Show preview and hide camera
    video.style.display = 'none';
    cameraControls.style.display = 'none';
    preview.src = reportImage;
    preview.classList.add('show');
    retakeControls.style.display = 'block';
    container.classList.add('has-image');
}

function retakePhoto() {
    const preview = document.getElementById('imagePreview');
    const retakeControls = document.getElementById('retakeControls');
    const container = document.getElementById('imageUploadContainer');
    
    reportImage = null;
    reportLat = null;
    reportLon = null;
    preview.classList.remove('show');
    preview.src = '';
    retakeControls.style.display = 'none';
    container.classList.remove('has-image');
    
    // Reopen camera
    openCamera();
}

function showReportForm() {
    updateNav();
    
    const location = generateRandomLocation();
    reportLocation = location;
    reportImage = null;
    
    render(`
        <div class="container-narrow">
            <div class="card">
                <h1 class="card-title">Report Road Issue</h1>
                <p class="card-subtitle">Help us fix infrastructure problems in your area</p>
                
                <div class="alert alert-info mt-3">
                    <strong>🎯 Smart Features Active!</strong><br>
                    • Duplicate Detection (50m radius)<br>
                    • Photo Evidence Upload<br>
                    • GPS Location Tracking<br>
                    • Community Upvoting
                </div>
                
                <form onsubmit="handleReportSubmit(event)" id="reportForm" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label for="issueType">Issue Type *</label>
                        <select id="issueType" required>
                            <option value="">Select type</option>
                            <option value="Pothole">Pothole</option>
                            <option value="Road Crack">Road Crack</option>
                            <option value="Open Manhole">Open Manhole</option>
                            <option value="Broken Divider">Broken Divider</option>
                            <option value="Damaged Road">Damaged Road</option>
                            <option value="Street Light">Street Light Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Description *</label>
                        <textarea 
                            id="description" 
                            rows="4" 
                            placeholder="Describe the issue in detail..."
                            required
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Capture Photo * (Visual Evidence)</label>
                        <div class="image-upload-container" id="imageUploadContainer">
                            <div id="uploadPrompt" onclick="openCamera()">
                                <div class="upload-icon">📸</div>
                                <div class="upload-text">
                                    <strong>Click to take photo</strong><br>
                                    <small>Use your camera to capture live evidence</small>
                                </div>
                            </div>
                            <video id="cameraPreview" style="display: none; width: 100%; border-radius: 8px;" autoplay playsinline></video>
                            <canvas id="photoCanvas" style="display: none;"></canvas>
                            <img id="imagePreview" class="image-preview" alt="Preview" onclick="geotagPhoto()">
                            <div id="cameraControls" style="display: none; margin-top: 1rem; text-align: center; gap: 0.5rem;">
                                <button type="button" class="btn btn-primary" onclick="capturePhoto()" style="margin-right: 0.5rem;">
                                    📸 Capture Photo
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="closeCamera()">
                                    ❌ Cancel
                                </button>
                            </div>
                            <div id="retakeControls" style="display: none; margin-top: 1rem; text-align: center;">
                                <button type="button" class="btn btn-secondary" onclick="retakePhoto()">
                                    🔄 Retake Photo
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Location * (GPS Tracked)</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input 
                                type="text" 
                                id="locationDisplay" 
                                value="${location.name}"
                                readonly
                                style="flex: 1;"
                            >
                            <button 
                                type="button" 
                                class="btn btn-secondary" 
                                onclick="pickLocationOnMap()"
                            >
                                📍 Pick
                            </button>
                        </div>
                        <input type="hidden" id="lat" value="${location.lat}">
                        <input type="hidden" id="lon" value="${location.lon}">
                        <small style="color: var(--gray-600); display: block; margin-top: 0.5rem;">
                            📍 ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="severity">Severity *</label>
                        <select id="severity" required>
                            <option value="low">Low - Minor inconvenience</option>
                            <option value="medium" selected>Medium - Needs attention</option>
                            <option value="high">High - Urgent/Dangerous</option>
                        </select>
                    </div>
                    
                    <div id="duplicateWarning"></div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary btn-block">
                            Submit Report
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-secondary" 
                            onclick="showCitizenDashboard()"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `);
}

function pickLocationOnMap() {
    showLocationPicker(function(location) {
        reportLocation = location;
        document.getElementById('locationDisplay').value = `Custom Location (GPS)`;
        document.getElementById('lat').value = location.lat;
        document.getElementById('lon').value = location.lon;
    });
}

function handleReportSubmit(event) {
    event.preventDefault();
    
    if (!reportImage) {
        showError('Please upload a photo of the issue');
        return;
    }
    
    const type = document.getElementById('issueType').value;
    const desc = document.getElementById('description').value.trim();
    const severity = document.getElementById('severity').value;
    const latField = parseFloat(document.getElementById('lat').value);
    const lonField = parseFloat(document.getElementById('lon').value);
    // Prefer photo geotag if available
    const finalLat = (reportLat !== null && reportLon !== null) ? reportLat : latField;
    const finalLon = (reportLat !== null && reportLon !== null) ? reportLon : lonField;
    const location = (reportLat !== null && reportLon !== null)
        ? `Photo geotag (${finalLat.toFixed(4)}, ${finalLon.toFixed(4)})`
        : document.getElementById('locationDisplay').value;
    
    const duplicates = checkDuplicates(type, finalLat, finalLon);

    const reportData = { type, desc, severity, lat: finalLat, lon: finalLon, location, image: reportImage };

    if (duplicates.length > 0) {
        showDuplicateWarning(duplicates, reportData);
    } else {
        submitReport(reportData);
    }
}

function showDuplicateWarning(duplicates, reportData) {
    const warningDiv = document.getElementById('duplicateWarning');
    
    warningDiv.innerHTML = `
        <div class="alert alert-warning">
            <h4 style="margin-bottom: 0.75rem;">🎯 Duplicate Detection: Similar Issue Found!</h4>
            <p style="margin-bottom: 0.75rem;"><strong>Our smart system detected ${duplicates.length} similar ${reportData.type} issue(s) within 50 meters:</strong></p>
            ${duplicates.map(d => `
                <div style="background: white; padding: 1rem; border-radius: 6px; margin-bottom: 0.5rem; border-left: 3px solid #f59e0b;">
                    ${d.issue.image ? `<img src="${d.issue.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />` : ''}
                    <strong>${d.issue.type}</strong> - Only ${d.distance}m away<br>
                    <small style="color: var(--gray-600);">
                        Status: <span class="badge ${d.issue.status}">${d.issue.status}</span> • 
                        👍 ${d.issue.upvotes} upvotes •
                        ${daysAgo(d.issue.createdAt)}
                    </small><br>
                    <small style="color: var(--gray-600);">${d.issue.desc}</small>
                </div>
            `).join('')}
            <p style="margin-top: 0.75rem; color: #92400e;"><strong>💡 Tip:</strong> Consider upvoting the existing issue instead to increase its priority!</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button 
                    type="button"
                    class="btn btn-primary" 
                    onclick='submitReportAnyway(${JSON.stringify(reportData).replace(/'/g, "&apos;")})'
                >
                    Submit Anyway (Different Issue)
                </button>
                <button 
                    type="button"
                    class="btn btn-secondary" 
                    onclick="document.getElementById('duplicateWarning').innerHTML = ''"
                >
                    Review
                </button>
            </div>
        </div>
    `;
}

function submitReportAnyway(reportData) {
    submitReport(reportData);
}

function submitReport(reportData) {
    const newIssue = AppState.addIssue({
        type: reportData.type,
        desc: reportData.desc,
        severity: reportData.severity,
        status: 'on-deck',
        location: reportData.location,
        lat: reportData.lat,
        lon: reportData.lon,
        image: reportData.image
    });
    
    showSuccess('Issue reported successfully with photo evidence!');
    showCitizenDashboard();
}

// Manually trigger geotagging (also called when user clicks preview)
function geotagPhoto() {
    if (!reportImage) {
        showError('Take a photo first to geotag it');
        return;
    }

    if (!navigator.geolocation) {
        showError('Geolocation not supported on this device');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            reportLat = position.coords.latitude;
            reportLon = position.coords.longitude;

            const latInput = document.getElementById('lat');
            const lonInput = document.getElementById('lon');
            const locationDisplay = document.getElementById('locationDisplay');
            if (latInput) latInput.value = reportLat;
            if (lonInput) lonInput.value = reportLon;
            if (locationDisplay) locationDisplay.value = `Photo geotag (${reportLat.toFixed(4)}, ${reportLon.toFixed(4)})`;

            showSuccess('Photo geotag captured');
        },
        error => {
            showError('Unable to capture GPS for photo');
        },
        { enableHighAccuracy: true, timeout: 5000 }
    );
}

function renderIssueCard(issue) {
    const days = Math.floor((new Date() - issue.createdAt) / (1000*60*60*24));
    const timeWorking = getTimeWorking(issue.openedAt);
    const resolutionTime = getResolutionTime(issue.openedAt, issue.resolvedAt);
    const hasUpvoted = AppState.hasUpvoted(issue.id);
    
    return `
        <div class="issue-card ${issue.severity}">
            <div class="issue-header">
                <div style="flex: 1;" onclick="showIssueDetail(${issue.id})">
                    <div class="issue-title">${issue.type}</div>
                    <div class="issue-location">📍 ${issue.location}</div>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <div class="issue-badges">
                        <span class="badge ${issue.severity}">${issue.severity}</span>
                        <span class="badge ${issue.status}">${issue.status.replace('-', ' ')}</span>
                    </div>
                    <button 
                        class="upvote-btn ${hasUpvoted ? 'voted' : ''}" 
                        onclick="handleUpvote(event, ${issue.id})"
                        title="Upvote to increase priority"
                    >
                        <div class="upvote-icon">👍</div>
                        <div class="upvote-count">${issue.upvotes}</div>
                    </button>
                </div>
            </div>
            ${issue.image || issue.resolutionPhoto ? `
                ${issue.image && issue.resolutionPhoto ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <img src="${issue.image}" class="issue-image" onclick="showIssueDetail(${issue.id})" alt="${issue.type}" />
                        <img src="${issue.resolutionPhoto}" class="issue-image" onclick="showIssueDetail(${issue.id})" alt="Fixed ${issue.type}" />
                    </div>
                ` : issue.image ? `
                    <img src="${issue.image}" class="issue-image" onclick="showIssueDetail(${issue.id})" alt="${issue.type}" />
                ` : `
                    <img src="${issue.resolutionPhoto}" class="issue-image" onclick="showIssueDetail(${issue.id})" alt="Fixed ${issue.type}" />
                `}
            ` : ''}
            <div class="issue-description" onclick="showIssueDetail(${issue.id})">${issue.desc}</div>
            <div class="issue-meta" onclick="showIssueDetail(${issue.id})">
                <div class="meta-item">📅 ${daysAgo(issue.createdAt)}</div>
                <div class="meta-item">⏱️ ${days}d total</div>
                ${timeWorking ? `<div class="meta-item">⚡ ${timeWorking} working</div>` : ''}
                ${resolutionTime ? `<div class="meta-item">✅ ${resolutionTime}</div>` : ''}
            </div>
        </div>
    `;
}

function handleUpvote(event, issueId) {
    event.stopPropagation();
    
    if (AppState.toggleUpvote(issueId)) {
        showCitizenDashboard();
    }
}