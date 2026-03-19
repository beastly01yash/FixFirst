// ==================== AUTHENTICATION ====================

function showLogin() {
    updateNav();
    
    render(`
        <div class="container-narrow">
            <div class="card" style="margin-top: 3rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 class="card-title">Welcome to FixFirst</h1>
                    <p class="card-subtitle">Report and track infrastructure issues in your city</p>
                </div>
                
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="your@email.com"
                            value="citizen@demo.com"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="••••••••"
                            value="demo"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Login
                    </button>
                </form>
                
                <div class="alert alert-info mt-3">
                    <strong>Demo Accounts:</strong><br>
                    <strong>Citizen:</strong> citizen@demo.com / demo<br>
                    <strong>Authority:</strong> admin@demo.com / admin
                </div>
                
                <div class="text-center mt-3" style="color: var(--gray-600);">
                    Don't have an account? 
                    <a href="#" onclick="showRegister(); return false;" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                        Create Account
                    </a>
                </div>
            </div>
        </div>
    `);
}

function showRegister() {
    updateNav();
    
    render(`
        <div class="container-narrow">
            <div class="card" style="margin-top: 3rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 class="card-title">Create Account</h1>
                    <p class="card-subtitle">Join FixFirst to start reporting issues</p>
                </div>
                
                <form onsubmit="handleRegister(event)">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            placeholder="Your name"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="••••••••"
                            minlength="4"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Create Account
                    </button>
                </form>
                
                <div class="text-center mt-3" style="color: var(--gray-600);">
                    Already have an account? 
                    <a href="#" onclick="showLogin(); return false;" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                        Login
                    </a>
                </div>
            </div>
        </div>
    `);
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    const user = DB.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        AppState.setUser(user);
        
        if (user.role === 'citizen') {
            showCitizenDashboard();
        } else {
            showAuthorityDashboard();
        }
        
        showSuccess(`Welcome back, ${user.name}!`);
    } else {
        showError('Invalid email or password');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (DB.users.find(u => u.email === email)) {
        showError('Email already registered');
        return;
    }
    
    const newUser = {
        id: DB.users.length + 1,
        email,
        password,
        name,
        role: 'citizen'
    };
    
    DB.users.push(newUser);
    AppState.setUser(newUser);
    
    showSuccess(`Account created successfully! Welcome, ${name}!`);
    showCitizenDashboard();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        AppState.logout();
        showSuccess('Logged out successfully');
        showLogin();
    }
}

function updateNav() {
    if (!AppState.isAuthenticated()) {
        setNav('');
        return;
    }
    
    const user = AppState.getUser();
    
    if (user.role === 'citizen') {
        setNav(`
            <button onclick="showCitizenDashboard()">Dashboard</button>
            <button onclick="showReportForm()">Report Issue</button>
            <button onclick="showMapView()">🗺️ Map</button>
            <button onclick="logout()" class="btn-primary">Logout</button>
        `);
    } else {
        setNav(`
            <button onclick="showAuthorityDashboard()">Dashboard</button>
            <button onclick="showMapView()">🗺️ Map</button>
            <button onclick="logout()" class="btn-primary">Logout</button>
        `);
    }
}