// ==================== DATE & TIME UTILITIES ====================

function daysAgo(date) {
    const days = Math.floor((new Date() - date) / (1000*60*60*24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
}

function daysBetween(start, end) {
    return Math.floor((end - start) / (1000*60*60*24));
}

function formatDate(date) {
    return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function getTimeWorking(openedAt) {
    if (!openedAt) return null;
    const diff = new Date() - openedAt;
    const hours = Math.floor(diff / (1000*60*60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
}

function getResolutionTime(openedAt, resolvedAt) {
    if (!openedAt || !resolvedAt) return null;
    const diff = resolvedAt - openedAt;
    const hours = Math.floor(diff / (1000*60*60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
}

// ==================== DISTANCE CALCULATION ====================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function checkDuplicates(type, lat, lon, radiusMeters = 50) {
    const duplicates = [];
    
    for (let issue of AppState.getIssues()) {
        if (issue.type === type && issue.lat && issue.lon) {
            const distance = calculateDistance(lat, lon, issue.lat, issue.lon);
            if (distance <= radiusMeters) {
                duplicates.push({
                    issue: issue,
                    distance: Math.round(distance)
                });
            }
        }
    }
    
    return duplicates;
}

// ==================== DOM UTILITIES ====================

function render(html) {
    document.getElementById('app').innerHTML = html;
}

function setNav(html) {
    document.getElementById('mainNav').innerHTML = html;
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function closeModal() {
    hideModal('issueModal');
}

function closeMapModal() {
    hideModal('mapModal');
}

// ==================== LOCATION GENERATOR ====================

function generateRandomLocation() {
    const wards = [
        { name: 'Ward 1, Alambagh', lat: 26.8506, lon: 80.9468 },
        { name: 'Ward 2, Aminabad', lat: 26.8520, lon: 80.9400 },
        { name: 'Ward 3, Gomti Nagar', lat: 26.8467, lon: 80.9462 },
        { name: 'Ward 4, Indira Nagar', lat: 26.8700, lon: 80.9900 },
        { name: 'Ward 5, Hazratganj', lat: 26.8389, lon: 80.9237 }
    ];
    
    const ward = wards[Math.floor(Math.random() * wards.length)];
    
    return {
        name: ward.name,
        lat: ward.lat + (Math.random() - 0.5) * 0.01,
        lon: ward.lon + (Math.random() - 0.5) * 0.01
    };
}

// ==================== VALIDATION ====================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
    alert(message);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

// ==================== IMAGE UTILITIES ====================

function handleImageUpload(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file selected');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject('Failed to read file');
        reader.readAsDataURL(file);
    });
}