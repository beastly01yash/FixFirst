// ==================== MAP FUNCTIONALITY ====================

let issuesMap = null;
let markersLayer = null;

// Create custom logo marker icon
function createLogoIcon() {
    return L.icon({
        iconUrl: 'assets/logo.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: 'custom-logo-icon'
    });
}

// Add marker styles
function addMarkerStyles() {
    if (document.getElementById('marker-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'marker-styles';
    style.innerHTML = `
        /* Style for image marker when using assets/logo.png */
        .leaflet-marker-icon.custom-logo-icon {
            border-radius: 8px;
            border: 2px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.25);
        }
    `;
    document.head.appendChild(style);
}

function initMap(containerId = 'issuesMap') {
    if (issuesMap) {
        issuesMap.remove();
    }
    
    addMarkerStyles();
    
    issuesMap = L.map(containerId).setView([26.8467, 80.9462], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(issuesMap);
    
    markersLayer = L.layerGroup().addTo(issuesMap);
    
    return issuesMap;
}

function createPopupContent(issue) {
    const statusBadge = `<span class="badge ${issue.status}">${issue.status}</span>`;
    const severityBadge = `<span class="badge ${issue.severity}">${issue.severity}</span>`;
    
    return `
        <div style="min-width: 220px;">
            ${issue.image ? `<img src="${issue.image}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />` : ''}
            <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem;">${issue.type}</h3>
            <div style="margin-bottom: 0.75rem;">
                ${severityBadge} ${statusBadge}
            </div>
            <div style="background: #f9fafb; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.75rem;">
                <strong>👍 ${issue.upvotes} upvotes</strong>
            </div>
            <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">${issue.desc}</p>
            <p style="margin: 0.5rem 0; color: #999; font-size: 0.85rem;">
                📍 ${issue.location}<br>
                📅 ${daysAgo(issue.createdAt)}
            </p>
            <button 
                onclick="showIssueDetail(${issue.id})" 
                style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                View Details
            </button>
        </div>
    `;
}

function plotIssuesOnMap(issues = null) {
    if (!issuesMap || !markersLayer) return;
    
    markersLayer.clearLayers();
    
    const issuesToPlot = issues || AppState.getIssues();
    
    issuesToPlot.forEach(issue => {
        if (issue.lat && issue.lon) {
            const marker = L.marker([issue.lat, issue.lon], {
                icon: createLogoIcon()
            });
            
            marker.bindPopup(createPopupContent(issue));
            marker.addTo(markersLayer);
        }
    });
    
    if (issuesToPlot.length > 0 && issuesToPlot.some(i => i.lat && i.lon)) {
        const bounds = markersLayer.getBounds();
        if (bounds.isValid()) {
            issuesMap.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

function showMapView(issues = null) {
    const modalBody = document.getElementById('mapModalBody');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 1rem;">Issues Map View</h2>
        <div class="alert alert-info" style="margin-bottom: 1rem;">
            <strong>📍 Map Pins:</strong> Each pin represents a reported issue. Click to see details!
        </div>
        <div class="map-container">
            <div id="issuesMap"></div>
        </div>
    `;
    
    showModal('mapModal');
    
    setTimeout(() => {
        initMap('issuesMap');
        plotIssuesOnMap(issues);
    }, 100);
}

function showLocationPicker(callback) {
    const modalBody = document.getElementById('mapModalBody');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 1rem;">Select Location</h2>
        <p style="color: #666; margin-bottom: 1rem;">Click on the map to select issue location or use your current location</p>
        <div style="margin-bottom: 1rem;">
            <button class="btn btn-primary" onclick="getCurrentLocation()">📍 Use My Current Location</button>
        </div>
        <div class="map-container">
            <div id="issuesMap"></div>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
            <button class="btn btn-success" id="confirmLocation">Confirm Location</button>
            <button class="btn btn-secondary" onclick="closeMapModal()">Cancel</button>
        </div>
    `;
    
    showModal('mapModal');
    
    let selectedLocation = null;
    let selectedMarker = null;
    
    setTimeout(() => {
        const map = initMap('issuesMap');
        
        window.getCurrentLocation = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        if (selectedMarker) {
                            map.removeLayer(selectedMarker);
                        }
                        
                        selectedMarker = L.marker([lat, lng], {
                            icon: createLogoIcon()
                        }).addTo(map);
                        
                        selectedLocation = { lat, lon: lng };
                        map.setView([lat, lng], 15);
                        
                        showSuccess('Current location captured!');
                    },
                    error => {
                        showError('Could not get your location. Please click on the map instead.');
                    }
                );
            } else {
                showError('Geolocation not supported. Please click on the map.');
            }
        };
        
        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            
            if (selectedMarker) {
                map.removeLayer(selectedMarker);
            }
            
            selectedMarker = L.marker([lat, lng], {
                icon: createLogoIcon()
            }).addTo(map);
            selectedLocation = { lat, lon: lng };
        });
        
        document.getElementById('confirmLocation').onclick = function() {
            if (selectedLocation && callback) {
                callback(selectedLocation);
                closeMapModal();
            } else {
                alert('Please select a location on the map or use your current location');
            }
        };
    }, 100);
}