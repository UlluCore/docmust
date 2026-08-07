let currentStep = 1;
const totalSteps = 6;
const stepNames = ["Profile Info", "Work Experience", "Education History", "Core Skills", "Additional Info", "Design & Export"];

// Theme Control
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
    const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    themeBtn.textContent = targetTheme === 'dark' ? '🌙' : '☀️';
});

// Navigation Menu
const menuBtn = document.getElementById('menu-btn');
const navDrawer = document.getElementById('nav-drawer');
const navLinks = document.querySelectorAll('.nav-link');

menuBtn.addEventListener('click', () => {
    navDrawer.classList.toggle('active');
    menuBtn.classList.toggle('active');
});

function navigateToSection(targetId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-target') === targetId));
    document.getElementById(targetId).classList.add('active');
    navDrawer.classList.remove('active');
    menuBtn.classList.remove('active');
    window.scrollTo(0,0);
}
navLinks.forEach(l => l.addEventListener('click', (e) => { e.preventDefault(); navigateToSection(l.getAttribute('data-target')); }));

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `⚠️ <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// Multi-Step Navigation & Clickable Breadcrumbs
function updateProgressBar() {
    document.getElementById('status-step-name').textContent = `Step ${currentStep}: ${stepNames[currentStep-1]}`;
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        if(index + 1 === currentStep) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function goToStep(step) {
    if(step > currentStep) {
        let missing = false;
        document.querySelector(`.form-step[data-step="${currentStep}"]`).querySelectorAll('.required-field').forEach(input => {
            if (!input.value.trim()) { missing = true; input.style.borderColor = '#ff3333'; }
        });
        if(missing) return showToast("Complete required fields before skipping ahead!");
    }
    document.querySelector('.form-step.active').classList.remove('active');
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    document.getElementById('prev-btn').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    document.getElementById('next-btn').style.display = currentStep === totalSteps ? 'none' : 'block';
    updateProgressBar();
}
function changeStep(direction) { goToStep(currentStep + direction); }

// Sync Highlight Feature
document.querySelectorAll('.form-step').forEach(step => {
    step.addEventListener('mouseenter', () => {
        const syncId = step.getAttribute('data-sync');
        if(syncId && document.getElementById(syncId)) document.getElementById(syncId).classList.add('highlight-active');
    });
    step.addEventListener('mouseleave', () => {
        const syncId = step.getAttribute('data-sync');
        if(syncId && document.getElementById(syncId)) document.getElementById(syncId).classList.remove('highlight-active');
    });
});

// Live Text Sync
function syncText(inputId, previewId, fallbackText) {
    document.getElementById(inputId)?.addEventListener('input', (e) => document.getElementById(previewId).textContent = e.target.value.trim() || fallbackText);
}
syncText('in-name', 'p-name', 'YOUR FULL NAME');
syncText('in-role', 'p-role', 'Target Professional Role');
syncText('in-email', 'p-email', '📧 email@example.com');
syncText('in-phone', 'p-phone', '📞 +00 00000000');
syncText('in-summary', 'p-summary', 'Your high-level objectives and career path metrics go here...');
syncText('in-skills', 'p-skills', 'Core Competencies listing...');
syncText('in-additional', 'p-additional', 'Languages, accomplishments...');

['city', 'linkedin', 'github'].forEach(f => document.getElementById(`in-${f}`).addEventListener('input', () => {
    const loc = document.getElementById('in-city').value.trim();
    const link = document.getElementById('in-linkedin').value.trim();
    const git = document.getElementById('in-github').value.trim();
    document.getElementById('p-location').textContent = `📍 ${loc}`; document.getElementById('p-location').style.display = loc ? 'inline' : 'none';
    document.getElementById('p-linkedin').textContent = `🔗 ${link}`; document.getElementById('p-linkedin').style.display = link ? 'inline' : 'none';
    document.getElementById('p-github').textContent = `🐙 ${git}`; document.getElementById('p-github').style.display = git ? 'inline' : 'none';
}));

document.getElementById('in-photo').addEventListener('change', e => {
    const file = e.target.files[0];
    const previewImg = document.getElementById('p-avatar');
    if (file) {
        const reader = new FileReader();
        reader.onload = event => { previewImg.src = event.target.result; previewImg.style.display = 'block'; };
        reader.readAsDataURL(file);
    } else { previewImg.style.display = 'none'; }
});

document.getElementById('in-skills').addEventListener('input', e => document.getElementById('sec-skills').style.display = e.target.value.trim() ? 'block' : 'none');
document.getElementById('in-additional').addEventListener('input', e => document.getElementById('sec-additional').style.display = e.target.value.trim() ? 'block' : 'none');

// Dynamic Blocks with Delete Functionality
let expCount = 0;
function addExperienceBlock() {
    expCount++; const id = expCount;
    const div = document.createElement('div'); div.className = 'dynamic-wrapper'; div.id = `exp-input-block-${id}`;
    div.innerHTML = `
        <button type="button" class="btn-delete" onclick="deleteBlock('exp-input-block-${id}', syncExperiencePreview)">🗑️ Delete</button>
        <div class="form-group"><label>Company Name</label><input type="text" id="exp-comp-${id}" placeholder="Acme Corp"></div>
        <div class="form-group"><label>Role / Position</label><input type="text" id="exp-role-${id}" placeholder="Senior Developer"></div>
        <div class="form-group"><label>Start Year</label><input type="text" id="exp-start-${id}" placeholder="Jan 2022"></div>
        <div class="form-group"><label>End Year</label><input type="text" id="exp-end-${id}" placeholder="Present"></div>
        <div class="form-group" style="grid-column: 1 / -1;"><label>Responsibilities</label><textarea id="exp-desc-${id}" rows="4"></textarea></div>
    `;
    document.getElementById('experience-container').appendChild(div);
    [`exp-comp-${id}`, `exp-role-${id}`, `exp-start-${id}`, `exp-end-${id}`, `exp-desc-${id}`].forEach(fid => document.getElementById(fid).addEventListener('input', syncExperiencePreview));
    syncExperiencePreview();
}

function syncExperiencePreview() {
    const pList = document.getElementById('p-experience-list'); pList.innerHTML = ""; let hasContent = false;
    document.querySelectorAll('#experience-container .dynamic-wrapper').forEach(block => {
        const id = block.id.replace('exp-input-block-', '');
        const comp = document.getElementById(`exp-comp-${id}`).value.trim(), role = document.getElementById(`exp-role-${id}`).value.trim();
        const start = document.getElementById(`exp-start-${id}`).value.trim(), end = document.getElementById(`exp-end-${id}`).value.trim();
        const desc = document.getElementById(`exp-desc-${id}`).value.trim();
        let bullets = desc ? `<ul style="margin-top:5px; padding-left:20px; font-size:0.9rem;">${desc.split('\n').filter(b=>b.trim()).map(b=>`<li style="margin-bottom:3px;">${b}</li>`).join('')}</ul>` : "";
        if(comp || role) {
            hasContent = true;
            pList.innerHTML += `<div class="resume-item"><div class="resume-item-header"><span>${role||'Role'}</span><span>${comp||'Company'}</span></div><div class="resume-item-sub"><span>📅 ${start||'Start'} - ${end||'End'}</span></div>${bullets}</div>`;
        }
    });
    document.getElementById('sec-experience').style.display = hasContent ? 'block' : 'none';
}

let eduCount = 0;
function addEducationBlock() {
    eduCount++; const id = eduCount;
    const div = document.createElement('div'); div.className = 'dynamic-wrapper'; div.id = `edu-input-block-${id}`;
    div.innerHTML = `
        <button type="button" class="btn-delete" onclick="deleteBlock('edu-input-block-${id}', syncEducationPreview)">🗑️ Delete</button>
        <div class="form-group"><label>Institution Name</label><input type="text" id="edu-name-${id}" placeholder="Stanford University"></div>
        <div class="form-group"><label>Degree</label><input type="text" id="edu-deg-${id}" placeholder="B.S. Computer Science"></div>
        <div class="form-group"><label>Graduation Year</label><input type="text" id="edu-date-${id}" placeholder="May 2021"></div>
    `;
    document.getElementById('education-container').appendChild(div);
    [`edu-name-${id}`, `edu-deg-${id}`, `edu-date-${id}`].forEach(fid => document.getElementById(fid).addEventListener('input', syncEducationPreview));
    syncEducationPreview();
}

function syncEducationPreview() {
    const pList = document.getElementById('p-education-list'); pList.innerHTML = ""; let hasContent = false;
    document.querySelectorAll('#education-container .dynamic-wrapper').forEach(block => {
        const id = block.id.replace('edu-input-block-', '');
        const name = document.getElementById(`edu-name-${id}`).value.trim(), deg = document.getElementById(`edu-deg-${id}`).value.trim(), date = document.getElementById(`edu-date-${id}`).value.trim();
        if(name || deg) {
            hasContent = true;
            pList.innerHTML += `<div class="resume-item"><div class="resume-item-header"><span>${deg||'Degree'}</span><span>${name||'Institution'}</span></div><div class="resume-item-sub"><span>🎓 Graduation: ${date||'N/A'}</span></div></div>`;
        }
    });
    document.getElementById('sec-education').style.display = hasContent ? 'block' : 'none';
}

function deleteBlock(blockId, syncFunction) {
    document.getElementById(blockId).remove();
    syncFunction(); saveToLocalStorage();
}

// Data Utility Functions
function loadSampleData() {
    clearData(false);
    const sample = {
        "in-name": "Alex Sterling", "in-role": "Senior Frontend Developer", "in-email": "alex.sterling@example.com", "in-phone": "+1 555-0198",
        "in-summary": "Results-oriented Web Developer with 5+ years of experience building scalable, high-performance web applications. Specialized in React, modern CSS, and user-centric design principles.",
        "in-city": "San Francisco, CA", "in-linkedin": "linkedin.com/in/alexsterling",
        "in-skills": "JavaScript (ES6+), React.js, TypeScript\nHTML5, CSS3, SASS, TailwindCSS\nGit, Webpack, Agile/Scrum",
        "exp-comp-1": "TechFlow Solutions", "exp-role-1": "Frontend Lead", "exp-start-1": "2020", "exp-end-1": "Present", "exp-desc-1": "Led a team of 4 engineers to rebuild the core SaaS platform.\nImproved load times by 40% through code splitting and lazy loading.\nMentored junior developers and established code review guidelines.",
        "edu-name-1": "University of California, Berkeley", "edu-deg-1": "B.S. Computer Science", "edu-date-1": "2018"
    };
    if(document.querySelectorAll('#experience-container .dynamic-wrapper').length === 0) addExperienceBlock();
    if(document.querySelectorAll('#education-container .dynamic-wrapper').length === 0) addEducationBlock();
    
    Object.keys(sample).forEach(key => {
        const el = document.getElementById(key);
        if(el) { el.value = sample[key]; el.dispatchEvent(new Event('input')); }
    });
    setAccentColor("#0f172a");
    document.getElementById("template-selector").value = "template-harvard";
    document.getElementById("template-selector").dispatchEvent(new Event('change'));
}

function clearData(confirmPrompt = true) {
    if(confirmPrompt && !confirm("Are you sure you want to clear all data? This cannot be undone.")) return;
    document.getElementById('resume-form').reset();
    document.getElementById('experience-container').innerHTML = '';
    document.getElementById('education-container').innerHTML = '';
    localStorage.removeItem('docmust_saved_resume');
    addExperienceBlock(); addEducationBlock();
    document.querySelectorAll('input, textarea').forEach(el => el.dispatchEvent(new Event('input')));
}

// Styling & Download Engines
function setAccentColor(color) {
    document.querySelector('.resume-print-target').style.setProperty('--accent-color', color);
    document.getElementById('accent-color-picker').value = color;
    saveToLocalStorage();
}
document.getElementById('accent-color-picker').addEventListener('input', e => setAccentColor(e.target.value));

document.getElementById('template-selector').addEventListener('change', e => {
    const target = document.querySelector('.resume-print-target');
    target.classList.remove('template-modern', 'template-harvard', 'template-minimal');
    target.classList.add(e.target.value);
    saveToLocalStorage();
});

function downloadPDF() {
    const element = document.getElementById('resume-capture-node');
    const originalWidth = element.style.width;
    element.style.width = '794px';
    const opt = { margin: 0, filename: 'DocMust_Resume.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    html2pdf().set(opt).from(element).save().then(() => element.style.width = originalWidth);
}

// Mobile Modal
document.getElementById('mobile-fab-btn').addEventListener('click', () => document.getElementById('mobile-preview-modal').classList.add('modal-active'));
document.getElementById('close-modal-btn').addEventListener('click', () => document.getElementById('mobile-preview-modal').classList.remove('modal-active'));

// Autosave
function saveToLocalStorage() {
    const formData = {};
    document.querySelectorAll('input:not([type="file"]), textarea, select').forEach(input => formData[input.id] = input.value);
    localStorage.setItem('docmust_saved_resume', JSON.stringify(formData));
}
function loadFromLocalStorage() {
    const saved = localStorage.getItem('docmust_saved_resume');
    if (saved) {
        const formData = JSON.parse(saved);
        const expKeys = Object.keys(formData).filter(k => k.startsWith('exp-comp-'));
        const eduKeys = Object.keys(formData).filter(k => k.startsWith('edu-name-'));
        while(document.querySelectorAll('#experience-container .dynamic-wrapper').length < expKeys.length) addExperienceBlock();
        while(document.querySelectorAll('#education-container .dynamic-wrapper').length < eduKeys.length) addEducationBlock();
        
        for (const [id, value] of Object.entries(formData)) {
            const input = document.getElementById(id);
            if (input && value) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); }
        }
        if(formData['accent-color-picker']) setAccentColor(formData['accent-color-picker']);
    } else {
        addExperienceBlock(); addEducationBlock();
    }
}
document.getElementById('resume-form').addEventListener('input', saveToLocalStorage);
window.addEventListener('DOMContentLoaded', loadFromLocalStorage);