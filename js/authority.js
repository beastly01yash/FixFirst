// ==================== AUTHORITY DASHBOARD ====================

let resolutionPhoto = null;
let cameraStreamAuthority = null;

function showAuthorityDashboard() {
    updateNav();
    
    const user = AppState.getUser();
    const onDeck = AppState.getIssuesByStatus('on-deck');
    const inProgress = AppState.getIssuesByStatus('in-progress');
    const resolved = AppState.getIssuesByStatus('resolved');
    
    render(`
        <div class="container">
            <div class="hero">
                <h2>${user.name}</h2>
                <p>${user.department || 'Municipal Authority Dashboard'}</p>
            </div>
            
            <div class="alert alert-info">
                <strong>📊 Smart Priority System:</strong> Issues automatically sorted by community upvotes. Photo evidence included for verification. Higher upvotes = Higher priority!
            </div>
            
            <div class="stats-grid">
                <div class="stat-card red">
                    <div class="stat-label">On Deck</div>
                    <div class="stat-number">${onDeck.length}</div>
                    <div class="stat-desc">Sorted by upvotes</div>
                </div>
                <div class="stat-card yellow">
                    <div class="stat-label">In Progress</div>
                    <div class="stat-number">${inProgress.length}</div>
                    <div class="stat-desc">Currently working</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-label">Resolved</div>
                    <div class="stat-number">${resolved.length}</div>
                    <div class="stat-desc">Completed</div>
                </div>
            </div>
            
            <div class="text-center mb-3">
                <button class="btn btn-primary" onclick="showMapView()">
                    🗺️ View All Issues on Map
                </button>
            </div>
            
            <div class="card">
                <div class="tabs">
                    <button class="tab active" onclick="switchTab('on-deck', event)">
                        On Deck (${onDeck.length})
                    </button>
                    <button class="tab" onclick="switchTab('in-progress', event)">
                        In Progress (${inProgress.length})
                    </button>
                    <button class="tab" onclick="switchTab('resolved', event)">
                        Resolved (${resolved.length})
                    </button>
                </div>
                
                <div id="tabContent"></div>
            </div>
        </div>
    `);
    
    displayTabContent('on-deck');
}

function switchTab(status, event) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    displayTabContent(status);
}

function displayTabContent(status) {
    const issues = AppState.getIssuesByStatus(status);
    const tabContent = document.getElementById('tabContent');
    
    if (issues.length === 0) {
        tabContent.innerHTML = `
            <div class="text-center" style="padding: 3rem; color: var(--gray-600);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <h3>No issues in this category</h3>
                <p>All clear for now!</p>
            </div>
        `;
        return;
    }
    
    tabContent.innerHTML = `
        <div class="issues-grid">
            ${issues.map(issue => renderAuthorityIssueCard(issue)).join('')}
        </div>
    `;
}

function renderAuthorityIssueCard(issue) {
    const totalDays = Math.floor((new Date() - issue.createdAt) / (1000*60*60*24));
    const timeWorking = getTimeWorking(issue.openedAt);
    const resolutionTime = getResolutionTime(issue.openedAt, issue.resolvedAt);
    
    return `
        <div class="issue-card ${issue.severity}" onclick="showIssueDetail(${issue.id})">
            <div class="issue-header">
                <div style="flex: 1;">
                    <div class="issue-title">${issue.type}</div>
                    <div class="issue-location">📍 ${issue.location}</div>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <div class="issue-badges">
                        <span class="badge ${issue.severity}">${issue.severity}</span>
                    </div>
                    <div style="text-align: center; padding: 0.5rem; background: #eff6ff; border-radius: 6px; min-width: 60px;">
                        <div style="font-size: 1.25rem;">👍</div>
                        <div style="font-weight: 700; color: var(--primary);">${issue.upvotes}</div>
                    </div>
                </div>
            </div>
            ${issue.image ? `
                <div style="position: relative;">
                    <img src="${issue.image}" class="issue-image" alt="${issue.type}" />
                    <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
                        📸 Before
                    </div>
                </div>
            ` : ''}
            ${issue.resolutionPhoto ? `
                <div style="position: relative;">
                    <img src="${issue.resolutionPhoto}" class="issue-image" alt="Fixed ${issue.type}" />
                    <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(34, 197, 94, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
                        ✅ After (Fixed)
                    </div>
                </div>
            ` : ''}
            <div class="issue-description">${issue.desc}</div>
            <div class="issue-meta">
                <div class="meta-item">📅 Reported ${daysAgo(issue.createdAt)}</div>
                <div class="meta-item">⏱️ ${totalDays}d total</div>
                ${timeWorking ? `<div class="meta-item">⚡ ${timeWorking} working</div>` : ''}
                ${resolutionTime ? `<div class="meta-item">✅ Resolved in ${resolutionTime}</div>` : ''}
            </div>
        </div>
    `;
}

function showIssueDetail(issueId) {
    const issue = AppState.getIssueById(issueId);
    if (!issue) {
        showError('Issue not found');
        return;
    }
    
    const modalBody = document.getElementById('modalBody');
    const user = AppState.getUser();
    const totalDays = Math.floor((new Date() - issue.createdAt) / (1000*60*60*24));
    const timeWorking = getTimeWorking(issue.openedAt);
    const resolutionTime = getResolutionTime(issue.openedAt, issue.resolvedAt);
    
    modalBody.innerHTML = `
        <div>
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div class="issue-badges">
                        <span class="badge ${issue.severity}">${issue.severity} Priority</span>
                        <span class="badge ${issue.status}">${issue.status.replace('-', ' ')}</span>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: #eff6ff; border-radius: 8px; min-width: 80px;">
                        <div style="font-size: 2rem;">👍</div>
                        <div style="font-weight: 700; font-size: 1.5rem; color: var(--primary);">${issue.upvotes}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-600);">upvotes</div>
                    </div>
                </div>
                
                <h2 style="margin-bottom: 0.5rem;">${issue.type}</h2>
                <p style="color: var(--gray-600);">📍 ${issue.location}</p>
            </div>
            
            ${issue.image || issue.resolutionPhoto ? `
                <div style="margin-bottom: 1.5rem;">
                    ${issue.image && issue.resolutionPhoto ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <img src="${issue.image}" style="width: 100%; border-radius: 8px; box-shadow: var(--shadow-md);" alt="${issue.type}" />
                                <p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">📸 Before (Reported)</p>
                            </div>
                            <div>
                                <img src="${issue.resolutionPhoto}" style="width: 100%; border-radius: 8px; box-shadow: var(--shadow-md);" alt="Fixed ${issue.type}" />
                                <p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--success);">✅ After (Fixed)</p>
                            </div>
                        </div>
                    ` : issue.image ? `
                        <img src="${issue.image}" style="width: 100%; border-radius: 8px; box-shadow: var(--shadow-md);" alt="${issue.type}" />
                        <p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">📸 Photo Evidence</p>
                    ` : `
                        <img src="${issue.resolutionPhoto}" style="width: 100%; border-radius: 8px; box-shadow: var(--shadow-md);" alt="Fixed ${issue.type}" />
                        <p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--success);">✅ Resolution Photo</p>
                    `}
                </div>
            ` : ''}
            
            <div style="background: var(--gray-50); padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.5rem;">Description</h4>
                <p style="line-height: 1.6;">${issue.desc}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 6px;">
                    <div style="font-size: 0.75rem; color: var(--gray-600); font-weight: 600; margin-bottom: 0.25rem;">
                        REPORTED ON
                    </div>
                    <div style="font-weight: 600;">${formatDate(issue.createdAt)}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">${daysAgo(issue.createdAt)}</div>
                </div>
                
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 6px;">
                    <div style="font-size: 0.75rem; color: var(--gray-600); font-weight: 600; margin-bottom: 0.25rem;">
                        TOTAL TIME
                    </div>
                    <div style="font-weight: 600;">${totalDays} days</div>
                </div>
                
                ${issue.openedAt ? `
                    <div style="background: var(--gray-50); padding: 1rem; border-radius: 6px;">
                        <div style="font-size: 0.75rem; color: var(--gray-600); font-weight: 600; margin-bottom: 0.25rem;">
                            WORK STARTED
                        </div>
                        <div style="font-weight: 600;">${formatDate(issue.openedAt)}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">${timeWorking} ago</div>
                    </div>
                ` : ''}
                
                ${issue.resolvedAt ? `
                    <div style="background: var(--gray-50); padding: 1rem; border-radius: 6px;">
                        <div style="font-size: 0.75rem; color: var(--gray-600); font-weight: 600; margin-bottom: 0.25rem;">
                            RESOLVED IN
                        </div>
                        <div style="font-weight: 600; color: var(--success);">${resolutionTime}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">${formatDate(issue.resolvedAt)}</div>
                    </div>
                ` : ''}
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <button class="btn btn-secondary btn-block" onclick="showIssueOnMap(${issue.id})">
                    📍 View on Map
                </button>
            </div>
            
            ${user && user.role === 'authority' ? `
                <div style="border-top: 2px solid var(--gray-200); padding-top: 1.5rem;">
                    <h4 style="margin-bottom: 1rem;">Update Status</h4>
                    
                    <div class="form-group">
                        <label for="statusSelect">Change Status</label>
                        <select id="statusSelect" onchange="handleStatusChange(${issue.id})">
                            <option value="on-deck" ${issue.status === 'on-deck' ? 'selected' : ''}>
                                On Deck - Not Started
                            </option>
                            <option value="in-progress" ${issue.status === 'in-progress' ? 'selected' : ''}>
                                In Progress - Currently Working
                            </option>
                            <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>
                                Resolved - Completed
                            </option>
                        </select>
                    </div>
                    
                    <div id="resolutionPhotoSection" style="display: none;">
                        <div class="form-group">
                            <label>Upload Proof of Resolution * (Required)</label>
                            <div class="alert alert-info" style="margin-bottom: 1rem;">
                                <strong>📸 Photo Required:</strong> Please capture a photo showing the fixed/resolved issue before marking as resolved.
                            </div>
                            <div class="image-upload-container" id="resolutionImageContainer">
                                <div id="resolutionUploadPrompt" onclick="openResolutionCamera()">
                                    <div class="upload-icon">📸</div>
                                    <div class="upload-text">
                                        <strong>Click to take photo of fixed issue</strong><br>
                                        <small>Show the resolved/repaired area</small>
                                    </div>
                                </div>
                                <video id="resolutionCameraPreview" style="display: none; width: 100%; border-radius: 8px;" autoplay playsinline></video>
                                <canvas id="resolutionPhotoCanvas" style="display: none;"></canvas>
                                <img id="resolutionImagePreview" class="image-preview" alt="Resolution Preview">
                                <div id="resolutionCameraControls" style="display: none; margin-top: 1rem; text-align: center; gap: 0.5rem;">
                                    <button type="button" class="btn btn-primary" onclick="captureResolutionPhoto()" style="margin-right: 0.5rem;">
                                        📸 Capture Photo
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="closeResolutionCamera()">
                                        ❌ Cancel
                                    </button>
                                </div>
                                <div id="resolutionRetakeControls" style="display: none; margin-top: 1rem; text-align: center;">
                                    <button type="button" class="btn btn-secondary" onclick="retakeResolutionPhoto()">
                                        🔄 Retake Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${issue.resolutionPhoto ? `
                        <div class="form-group">
                            <label>Resolution Photo</label>
                            <img src="${issue.resolutionPhoto}" style="width: 100%; border-radius: 8px; box-shadow: var(--shadow-md);" alt="Resolution proof" />
                            <p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">✅ Proof of resolution</p>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-success btn-block" onclick="updateIssueStatus(${issue.id})">
                            ✓ Update Status
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal()">
                            Cancel
                        </button>
                    </div>
                </div>
            ` : `
                <button class="btn btn-secondary btn-block" onclick="closeModal()">
                    Close
                </button>
            `}
        </div>
    `;
    
    showModal('issueModal');
}

function showIssueOnMap(issueId) {
    const issue = AppState.getIssueById(issueId);
    if (!issue) return;
    
    closeModal();
    showMapView([issue]);
}

function handleStatusChange(issueId) {
    const selectedStatus = document.getElementById('statusSelect').value;
    const photoSection = document.getElementById('resolutionPhotoSection');
    
    // Show photo upload section only when changing to "resolved"
    if (selectedStatus === 'resolved') {
        photoSection.style.display = 'block';
        resolutionPhoto = null; // Reset photo when status changes to resolved
    } else {
        photoSection.style.display = 'none';
        resolutionPhoto = null;
        closeResolutionCamera(); // Close camera if open
    }
}

async function openResolutionCamera() {
    try {
        const video = document.getElementById('resolutionCameraPreview');
        const uploadPrompt = document.getElementById('resolutionUploadPrompt');
        const cameraControls = document.getElementById('resolutionCameraControls');
        
        // Request camera access - rear camera preferred on mobile
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };
        
        cameraStreamAuthority = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStreamAuthority;
        
        // Show camera preview and hide upload prompt
        uploadPrompt.style.display = 'none';
        video.style.display = 'block';
        cameraControls.style.display = 'block';
        
    } catch (error) {
        console.error('Camera access error:', error);
        showError('Unable to access camera. Please ensure camera permissions are granted.');
    }
}

function closeResolutionCamera() {
    if (cameraStreamAuthority) {
        cameraStreamAuthority.getTracks().forEach(track => track.stop());
        cameraStreamAuthority = null;
    }
    
    const video = document.getElementById('resolutionCameraPreview');
    const uploadPrompt = document.getElementById('resolutionUploadPrompt');
    const cameraControls = document.getElementById('resolutionCameraControls');
    
    if (video) video.style.display = 'none';
    if (cameraControls) cameraControls.style.display = 'none';
    if (uploadPrompt) uploadPrompt.style.display = 'flex';
}

function captureResolutionPhoto() {
    const video = document.getElementById('resolutionCameraPreview');
    const canvas = document.getElementById('resolutionPhotoCanvas');
    const preview = document.getElementById('resolutionImagePreview');
    const cameraControls = document.getElementById('resolutionCameraControls');
    const retakeControls = document.getElementById('resolutionRetakeControls');
    const container = document.getElementById('resolutionImageContainer');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert canvas to base64 image
    resolutionPhoto = canvas.toDataURL('image/jpeg', 0.8);
    
    // Stop camera stream
    if (cameraStreamAuthority) {
        cameraStreamAuthority.getTracks().forEach(track => track.stop());
        cameraStreamAuthority = null;
    }
    
    // Show preview and hide camera
    video.style.display = 'none';
    cameraControls.style.display = 'none';
    preview.src = resolutionPhoto;
    preview.classList.add('show');
    retakeControls.style.display = 'block';
    container.classList.add('has-image');
}

function retakeResolutionPhoto() {
    const preview = document.getElementById('resolutionImagePreview');
    const retakeControls = document.getElementById('resolutionRetakeControls');
    const container = document.getElementById('resolutionImageContainer');
    
    resolutionPhoto = null;
    preview.classList.remove('show');
    preview.src = '';
    retakeControls.style.display = 'none';
    container.classList.remove('has-image');
    
    // Reopen camera
    openResolutionCamera();
}

function updateIssueStatus(issueId) {
    const newStatus = document.getElementById('statusSelect').value;
    const issue = AppState.getIssueById(issueId);
    
    if (!issue) {
        showError('Issue not found');
        return;
    }
    
    // Validate resolution photo requirement
    if (newStatus === 'resolved' && issue.status !== 'resolved' && !resolutionPhoto) {
        showError('Please capture a photo of the fixed issue before marking as resolved');
        return;
    }
    
    const oldStatus = issue.status;
    
    // Update status with resolution photo if applicable
    if (AppState.updateIssueStatus(issueId, newStatus, resolutionPhoto)) {
        let message = `Status updated to ${newStatus.replace('-', ' ')}`;
        
        if (newStatus === 'in-progress' && oldStatus === 'on-deck') {
            message += ' - Work timer started!';
        } else if (newStatus === 'resolved') {
            if (oldStatus === 'in-progress') {
                const resolutionTime = getResolutionTime(issue.openedAt, issue.resolvedAt);
                message += ` - Completed in ${resolutionTime}!`;
            }
            message += ' Resolution photo saved.';
        }
        
        showSuccess(message);
        resolutionPhoto = null; // Reset for next use
        closeResolutionCamera(); // Clean up camera
        closeModal();
        showAuthorityDashboard();
    } else {
        showError('Failed to update status');
    }
}