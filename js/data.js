// ==================== DATABASE ====================
const DB = {
    users: [
        { 
            id: 1, 
            email: 'citizen@demo.com', 
            password: 'demo', 
            role: 'citizen', 
            name: 'Raj Kumar' 
        },
        { 
            id: 2, 
            email: 'admin@demo.com', 
            password: 'admin', 
            role: 'authority', 
            name: 'Municipal Officer',
            department: 'Nagar Nigam, Lucknow'
        },
        { 
            id: 3, 
            email: 'roshan@demo.com', 
            password: 'demo', 
            role: 'citizen', 
            name: 'Roshan Kumar' 
        },
        { 
            id: 4, 
            email: 'sunita@demo.com', 
            password: 'demo', 
            role: 'citizen', 
            name: 'Sunita Sharma' 
        }
    ],
    
    issues: [
    ],
    
    nextIssueId: 1
};

// ==================== STATE MANAGEMENT ====================
const AppState = {
    currentUser: null,
    
    setUser(user) {
        this.currentUser = user;
    },
    
    getUser() {
        return this.currentUser;
    },
    
    logout() {
        this.currentUser = null;
    },
    
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    isCitizen() {
        return this.currentUser && this.currentUser.role === 'citizen';
    },
    
    isAuthority() {
        return this.currentUser && this.currentUser.role === 'authority';
    },
    
    getIssues() {
        return DB.issues;
    },
    
    getIssueById(id) {
        return DB.issues.find(issue => issue.id === id);
    },
    
    getUserIssues() {
        if (!this.currentUser) return [];
        return DB.issues.filter(issue => issue.userId === this.currentUser.id);
    },
    
    getIssuesByStatus(status) {
        // Sort by upvotes (priority)
        return DB.issues
            .filter(issue => issue.status === status)
            .sort((a, b) => b.upvotes - a.upvotes);
    },
    
    addIssue(issue) {
        issue.id = DB.nextIssueId++;
        issue.userId = this.currentUser.id;
        issue.createdAt = new Date();
        issue.openedAt = null;
        issue.resolvedAt = null;
        issue.upvotes = 0;
        issue.upvotedBy = [];
        DB.issues.unshift(issue);
        return issue;
    },
    
    updateIssueStatus(issueId, newStatus, resolutionPhoto) {
        const issue = this.getIssueById(issueId);
        if (!issue) return false;
        
        const oldStatus = issue.status;
        issue.status = newStatus;
        
        if (newStatus === 'in-progress' && oldStatus === 'on-deck') {
            issue.openedAt = new Date();
        }

        if (newStatus === 'resolved') {
            // Mark resolved time and save resolution photo regardless of previous status
            issue.resolvedAt = new Date();
            if (resolutionPhoto) {
                issue.resolutionPhoto = resolutionPhoto;
            }
            // If work was never started, set openedAt to createdAt for duration calculations
            if (!issue.openedAt) {
                issue.openedAt = issue.createdAt;
            }
        }
        
        return true;
    },
    
    toggleUpvote(issueId) {
        const issue = this.getIssueById(issueId);
        if (!issue || !this.currentUser) return false;
        
        const userId = this.currentUser.id;
        const index = issue.upvotedBy.indexOf(userId);
        
        if (index > -1) {
            issue.upvotedBy.splice(index, 1);
            issue.upvotes--;
        } else {
            issue.upvotedBy.push(userId);
            issue.upvotes++;
        }
        
        return true;
    },
    
    hasUpvoted(issueId) {
        const issue = this.getIssueById(issueId);
        if (!issue || !this.currentUser) return false;
        return issue.upvotedBy.includes(this.currentUser.id);
    }
};