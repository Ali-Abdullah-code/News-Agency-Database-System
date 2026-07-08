const API = 'http://localhost:3000/api';

// --- ARTICLES ---

async function loadArticles() {
    const tbody = document.getElementById('articles-body');
    if (!tbody) return; // not on articles page
    
    try {
        const res  = await fetch(`${API}/articles`);
        const data = await res.json();
        tbody.innerHTML = '';
        data.forEach(article => {
            const statusClass = article.STATUS ? `badge-${article.STATUS.toLowerCase()}` : '';
            tbody.innerHTML += `
            <tr>
                <td>${article.ARTID}</td>
                <td>${article.TITLE}</td>
                <td>${article.JOURNALIST}</td>
                <td>${article.SECNAME}</td>
                <td><span class="badge ${statusClass}">${article.STATUS}</span></td>
                <td>${article.PUBDATE ? new Date(article.PUBDATE).toLocaleDateString() : 'N/A'}</td>
                <td>
                    ${article.STATUS !== 'Published' ? `<button class="btn btn-success" onclick="publishArticle(${article.ARTID})">Publish</button>` : ''}
                    <button class="btn btn-danger" onclick="deleteArticle(${article.ARTID})">Delete</button>
                </td>
            </tr>`;
        });
        
        // update stats if on homepage
        const totalArticles = document.getElementById('total-articles');
        if (totalArticles) totalArticles.innerText = data.length;
    } catch (err) {
        console.error('Error loading articles', err);
    }
}

async function publishArticle(id) {
    await fetch(`${API}/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Published' })
    });
    loadArticles();
}

async function deleteArticle(id) {
    if (!confirm('Delete this article?')) return;
    await fetch(`${API}/articles/${id}`, { method: 'DELETE' });
    loadArticles();
}

async function addArticle() {
    const editorVal = document.getElementById('editor').value;
    const body = {
        ArtID:        document.getElementById('artid').value,
        Title:        document.getElementById('title').value,
        Content:      document.getElementById('content').value,
        Status:       'Draft',
        JournalistID: document.getElementById('journalist').value,
        EditorID:     editorVal ? editorVal : null,
        SecName:      document.getElementById('section').value
    };
    await fetch(`${API}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    document.getElementById('add-article-form').reset();
    loadArticles();
}

// --- JOURNALISTS ---

async function loadJournalists() {
    const tbody = document.getElementById('journalists-body');
    if (!tbody) {
        // if not on journalists page, just fetch to update stats
        try {
            const res = await fetch(`${API}/journalists`);
            const data = await res.json();
            const total = document.getElementById('total-journalists');
            if (total) total.innerText = data.length;
        } catch (err) {}
        return;
    }
    
    try {
        const res  = await fetch(`${API}/journalists`);
        const data = await res.json();
        tbody.innerHTML = '';
        data.forEach(j => {
            tbody.innerHTML += `
            <tr>
                <td>${j.EMPID}</td>
                <td>${j.EMPNAME}</td>
                <td>${j.EMAIL}</td>
                <td>${j.SPECIALTYAREA}</td>
                <td>${j.ARTICLECOUNT}</td>
                <td>
                    <button class="btn btn-success" onclick="updateJournalist(${j.EMPID}, '${j.SPECIALTYAREA}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteJournalist(${j.EMPID})">Delete</button>
                </td>
            </tr>`;
        });
    } catch (err) {
        console.error('Error loading journalists', err);
    }
}

async function addJournalist() {
    const body = {
        EmpID:         document.getElementById('j-empid').value,
        EmpName:       document.getElementById('j-name').value,
        Email:         document.getElementById('j-email').value,
        SpecialtyArea: document.getElementById('j-specialty').value
    };
    await fetch(`${API}/journalists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    document.getElementById('add-journalist-form').reset();
    loadJournalists();
}

async function updateJournalist(id, currentSpecialty) {
    const newSpecialty = prompt('Enter new Specialty Area:', currentSpecialty);
    if (!newSpecialty || newSpecialty === currentSpecialty) return;
    
    await fetch(`${API}/journalists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SpecialtyArea: newSpecialty })
    });
    loadJournalists();
}

async function deleteJournalist(id) {
    if (!confirm('Delete this journalist?')) return;
    await fetch(`${API}/journalists/${id}`, { method: 'DELETE' });
    loadJournalists();
}

// --- EDITORS ---

async function loadEditors() {
    const tbody = document.getElementById('editors-body');
    if (!tbody) return; // not on editors page
    
    try {
        const res  = await fetch(`${API}/editors`);
        const data = await res.json();
        tbody.innerHTML = '';
        data.forEach(e => {
            tbody.innerHTML += `
            <tr>
                <td>${e.EMPID}</td>
                <td>${e.EMPNAME}</td>
                <td>${e.EMAIL}</td>
                <td>${e.SENIORITYLEVEL}</td>
                <td>
                    <button class="btn btn-success" onclick="updateEditor(${e.EMPID}, '${e.SENIORITYLEVEL}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteEditor(${e.EMPID})">Delete</button>
                </td>
            </tr>`;
        });
    } catch (err) {
        console.error('Error loading editors', err);
    }
}

async function addEditor() {
    const body = {
        EmpID:       document.getElementById('e-empid').value,
        EmpName:     document.getElementById('e-name').value,
        Email:       document.getElementById('e-email').value,
        EditorLevel: document.getElementById('e-level').value
    };
    await fetch(`${API}/editors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    document.getElementById('add-editor-form').reset();
    loadEditors();
}

async function updateEditor(id, currentLevel) {
    const newLevel = prompt('Enter new Seniority Level (Junior, Senior, Chief):', currentLevel);
    if (!newLevel || newLevel === currentLevel) return;
    
    await fetch(`${API}/editors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SeniorityLevel: newLevel })
    });
    loadEditors();
}

async function deleteEditor(id) {
    if (!confirm('Delete this editor?')) return;
    await fetch(`${API}/editors/${id}`, { method: 'DELETE' });
    loadEditors();
}

// --- SUBSCRIBERS ---

async function loadSubscribers() {
    const tbody = document.getElementById('subscribers-body');
    if (!tbody) {
        try {
            const res = await fetch(`${API}/subscribers`);
            const data = await res.json();
            const total = document.getElementById('total-subscribers');
            if (total) total.innerText = data.length;
            
            // set hardcoded sections stats for demo purposes
            const totalSections = document.getElementById('total-sections');
            if (totalSections) totalSections.innerText = '10';
        } catch (err) {}
        return;
    }
    
    try {
        const res  = await fetch(`${API}/subscribers`);
        const data = await res.json();
        tbody.innerHTML = '';
        data.forEach(s => {
            tbody.innerHTML += `
            <tr>
                <td>${s.SUBID}</td>
                <td>${s.USERNAME}</td>
                <td>${s.EMAIL}</td>
                <td>${s.MEMBERSHIPTYPE}</td>
                <td>${s.COMMENTCOUNT}</td>
                <td>
                    <button class="btn btn-success" onclick="updateSubscriber(${s.SUBID}, '${s.MEMBERSHIPTYPE}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteSubscriber(${s.SUBID})">Delete</button>
                </td>
            </tr>`;
        });
    } catch (err) {
        console.error('Error loading subscribers', err);
    }
}

async function addSubscriber() {
    const body = {
        SubID:          document.getElementById('s-subid').value,
        Username:       document.getElementById('s-username').value,
        Email:          document.getElementById('s-email').value,
        MembershipType: document.getElementById('s-membership').value
    };
    await fetch(`${API}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    document.getElementById('add-subscriber-form').reset();
    loadSubscribers();
}

async function updateSubscriber(id, currentMembership) {
    const newMembership = prompt('Enter new Membership Type (Free, Premium):', currentMembership);
    if (!newMembership || newMembership === currentMembership) return;
    
    await fetch(`${API}/subscribers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MembershipType: newMembership })
    });
    loadSubscribers();
}

async function deleteSubscriber(id) {
    if (!confirm('Delete this subscriber?')) return;
    await fetch(`${API}/subscribers/${id}`, { method: 'DELETE' });
    loadSubscribers();
}

// Run on page load
loadArticles();
loadJournalists();
loadEditors();
loadSubscribers();
