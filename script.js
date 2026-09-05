let currentStep = 1;
let currentQuestionIndex = 1;
let activeToolSection = 'home';
const totalStep1Questions = 8;
const totalSteps = 6;
const stepNames = ["Profile Info", "Work Experience", "Education History", "Core Skills", "Additional Info", "Design & Export"];

// Theme Control
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
    const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    themeBtn.textContent = targetTheme === 'dark' ? '🌙' : '☀️';
});

// Navigation Drawer
const menuBtn = document.getElementById('menu-btn');
const navDrawer = document.getElementById('nav-drawer');
const navLinks = document.querySelectorAll('.nav-link');

menuBtn.addEventListener('click', () => {
    navDrawer.classList.toggle('active');
    menuBtn.classList.toggle('active');
});

function navigateToSection(targetId) {
    activeToolSection = targetId;
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-target') === targetId));
    document.getElementById(targetId).classList.add('active');
    navDrawer.classList.remove('active');
    menuBtn.classList.remove('active');
    window.scrollTo(0, 0);

    // Sync Bottom App Bar visibility on mobile
    if (targetId === 'product' || targetId === 'cover-letter') {
        document.body.classList.add('is-builder-active');
        setMobileViewMode('edit');
    } else {
        document.body.classList.remove('is-builder-active');
    }
}
navLinks.forEach(l => l.addEventListener('click', (e) => { 
    e.preventDefault(); 
    navigateToSection(l.getAttribute('data-target')); 
}));

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `⚠️ <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 300); 
    }, 4000);
}

// Mobile View Mode Switcher (Form Edit vs. Live Preview)
function setMobileViewMode(mode) {
    const editBtn = document.getElementById('btn-mode-edit');
    const prevBtn = document.getElementById('btn-mode-preview');

    if (mode === 'preview') {
        document.body.classList.remove('mobile-mode-edit');
        document.body.classList.add('mobile-mode-preview');
        prevBtn.classList.add('active');
        editBtn.classList.remove('active');
    } else {
        document.body.classList.remove('mobile-mode-preview');
        document.body.classList.add('mobile-mode-edit');
        editBtn.classList.add('active');
        prevBtn.classList.remove('active');
    }
}

// Trigger Download for the Active Section (Resume vs Cover Letter)
function triggerActiveDownload() {
    if (activeToolSection === 'cover-letter') {
        downloadCLPDF();
    } else {
        downloadPDF();
    }
}

// Template Selection Engine (6 Templates)
const allTemplateClasses = [
    'template-tech-split', 
    'template-harvard', 
    'template-compact-grid', 
    'template-ivy-league', 
    'template-modern', 
    'template-minimal'
];

function openTemplatePicker() {
    document.getElementById('template-modal').classList.remove('hidden');
}

function selectInitialTemplate(templateClass, defaultColor) {
    const target = document.querySelector('.resume-print-target');
    allTemplateClasses.forEach(cls => target.classList.remove(cls));
    target.classList.add(templateClass);
    
    const selector = document.getElementById('template-selector');
    if (selector) selector.value = templateClass;
    if (defaultColor) setAccentColor(defaultColor);
    
    document.getElementById('template-modal').classList.add('hidden');
    navigateToSection('product');
    saveToLocalStorage();
}

// Step & Question Navigation
function updateProgressVisuals() {
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === currentStep);
    });

    let pct = 0;
    if (currentStep === 1) {
        pct = (currentQuestionIndex / totalStep1Questions) * 20;
    } else {
        pct = 20 + ((currentStep - 1) / (totalSteps - 1)) * 80;
    }
    document.getElementById('question-progress-bar').style.width = `${pct}%`;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (currentStep === 1 && currentQuestionIndex === 1) {
        prevBtn.style.visibility = 'hidden';
    } else {
        prevBtn.style.visibility = 'visible';
    }

    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'inline-flex';
        nextBtn.textContent = (currentStep === 1 && currentQuestionIndex < totalStep1Questions) ? 'Next Question ➜' : 'Next Section ➜';
    }
}

function handleNextQuestion() {
    if (currentStep === 1) {
        const activeCard = document.querySelector(`.form-step[data-step="1"] .question-card[data-q="${currentQuestionIndex}"]`);
        const requiredField = activeCard?.querySelector('.required-field');
        
        if (requiredField && !requiredField.value.trim()) {
            requiredField.focus();
            requiredField.style.borderColor = '#ff3333';
            return showToast("Please answer this question before moving forward!");
        } else if (requiredField) {
            requiredField.style.borderColor = '';
        }

        if (currentQuestionIndex < totalStep1Questions) {
            activeCard.classList.remove('active');
            currentQuestionIndex++;
            const nextCard = document.querySelector(`.form-step[data-step="1"] .question-card[data-q="${currentQuestionIndex}"]`);
            nextCard.classList.add('active');
            nextCard.querySelector('input, textarea')?.focus();
            updateProgressVisuals();
            return;
        }
    }

    if (currentStep < totalSteps) {
        jumpToStep(currentStep + 1);
    }
}

function handlePreviousQuestion() {
    if (currentStep === 1) {
        if (currentQuestionIndex > 1) {
            document.querySelector(`.form-step[data-step="1"] .question-card[data-q="${currentQuestionIndex}"]`).classList.remove('active');
            currentQuestionIndex--;
            const prevCard = document.querySelector(`.form-step[data-step="1"] .question-card[data-q="${currentQuestionIndex}"]`);
            prevCard.classList.add('active');
            prevCard.querySelector('input, textarea')?.focus();
            updateProgressVisuals();
            return;
        }
    } else {
        jumpToStep(currentStep - 1);
    }
}

function jumpToStep(step) {
    document.querySelector('.form-step.active')?.classList.remove('active');
    currentStep = step;
    
    const targetStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    targetStepEl.classList.add('active');

    if (currentStep === 1) {
        currentQuestionIndex = 1;
        targetStepEl.querySelectorAll('.question-card').forEach((qc, idx) => {
            qc.classList.toggle('active', idx === 0);
        });
        targetStepEl.querySelector('.question-card.active input')?.focus();
    } else {
        targetStepEl.querySelector('.question-card')?.classList.add('active');
    }

    updateProgressVisuals();
}

// Keydown Enter to Advance
document.getElementById('resume-form').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleNextQuestion();
    }
});

// Real-Time Preview Sync
function syncText(inputId, previewId, fallbackText) {
    document.getElementById(inputId)?.addEventListener('input', (e) => {
        document.getElementById(previewId).textContent = e.target.value.trim() || fallbackText;
    });
}
syncText('in-name', 'p-name', 'YOUR FULL NAME');
syncText('in-role', 'p-role', 'Target Professional Role');
syncText('in-email', 'p-email', '📧 email@example.com');
syncText('in-phone', 'p-phone', '📞 +00 00000000');
syncText('in-summary', 'p-summary', 'Your high-level objectives and career metrics go here...');
syncText('in-skills', 'p-skills', 'Core Competencies listing...');
syncText('in-additional', 'p-additional', 'Languages, accomplishments...');

function syncContactsAndSidebar() {
    const email = document.getElementById('in-email').value.trim() || 'email@example.com';
    const phone = document.getElementById('in-phone').value.trim() || '+1 234 567 890';
    const loc = document.getElementById('in-city').value.trim();
    const link = document.getElementById('in-linkedin').value.trim();
    const git = document.getElementById('in-github').value.trim();
    
    const locEl = document.getElementById('p-location');
    const linkEl = document.getElementById('p-linkedin');
    const gitEl = document.getElementById('p-github');
    
    locEl.textContent = `📍 ${loc}`; locEl.style.display = loc ? 'inline' : 'none';
    linkEl.textContent = `🔗 ${link}`; linkEl.style.display = link ? 'inline' : 'none';
    gitEl.textContent = `🐙 ${git}`; gitEl.style.display = git ? 'inline' : 'none';

    const sidebarContacts = document.getElementById('sidebar-contacts-list');
    if (sidebarContacts) {
        sidebarContacts.innerHTML = `
            <div>📧 ${email}</div>
            <div>📞 ${phone}</div>
            ${loc ? `<div>📍 ${loc}</div>` : ''}
            ${link ? `<div>🔗 ${link}</div>` : ''}
            ${git ? `<div>🐙 ${git}</div>` : ''}
        `;
    }
}
['in-email', 'in-phone', 'in-city', 'in-linkedin', 'in-github'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', syncContactsAndSidebar);
});

document.getElementById('in-photo').addEventListener('change', e => {
    const file = e.target.files[0];
    const previewImg = document.getElementById('p-avatar');
    if (file) {
        const reader = new FileReader();
        reader.onload = event => { 
            previewImg.src = event.target.result; 
            previewImg.style.display = 'block'; 
        };
        reader.readAsDataURL(file);
    } else { 
        previewImg.style.display = 'none'; 
    }
});

document.getElementById('in-skills').addEventListener('input', e => {
    const val = e.target.value.trim();
    document.getElementById('sec-skills').style.display = val ? 'block' : 'none';
    const sidebarSkills = document.getElementById('sidebar-skills-content');
    if (sidebarSkills) sidebarSkills.textContent = val || 'Core Skills';
});

document.getElementById('in-additional').addEventListener('input', e => {
    document.getElementById('sec-additional').style.display = e.target.value.trim() ? 'block' : 'none';
});

// Dynamic Blocks (Work & Education)
let expCount = 0;
function addExperienceBlock() {
    expCount++;
    const id = expCount;
    const div = document.createElement('div');
    div.className = 'dynamic-wrapper';
    div.id = `exp-input-block-${id}`;
    div.innerHTML = `
        <button type="button" class="btn-delete" onclick="deleteBlock('exp-input-block-${id}', syncExperiencePreview)">🗑️ Delete</button>
        <div class="form-group"><label>Company Name</label><input type="text" id="exp-comp-${id}" placeholder="Google / Microsoft"></div>
        <div class="form-group"><label>Role / Position</label><input type="text" id="exp-role-${id}" placeholder="Senior Engineer"></div>
        <div class="form-group"><label>Start Date</label><input type="text" id="exp-start-${id}" placeholder="Jan 2022"></div>
        <div class="form-group"><label>End Date</label><input type="text" id="exp-end-${id}" placeholder="Present"></div>
        <div class="form-group" style="grid-column: 1 / -1;"><label>Key Achievements</label><textarea id="exp-desc-${id}" rows="3" placeholder="Engineered 40% performance gain via distributed caching..."></textarea></div>
    `;
    document.getElementById('experience-container').appendChild(div);
    [`exp-comp-${id}`, `exp-role-${id}`, `exp-start-${id}`, `exp-end-${id}`, `exp-desc-${id}`].forEach(fid => {
        document.getElementById(fid)?.addEventListener('input', syncExperiencePreview);
    });
    syncExperiencePreview();
}

function syncExperiencePreview() {
    const pList = document.getElementById('p-experience-list');
    pList.innerHTML = "";
    let hasContent = false;
    
    document.querySelectorAll('#experience-container .dynamic-wrapper').forEach(block => {
        const id = block.id.replace('exp-input-block-', '');
        const comp = document.getElementById(`exp-comp-${id}`)?.value.trim() || '';
        const role = document.getElementById(`exp-role-${id}`)?.value.trim() || '';
        const start = document.getElementById(`exp-start-${id}`)?.value.trim() || '';
        const end = document.getElementById(`exp-end-${id}`)?.value.trim() || '';
        const desc = document.getElementById(`exp-desc-${id}`)?.value.trim() || '';
        
        let bullets = desc ? `<ul style="margin-top:4px; padding-left:18px; font-size:0.83rem;">${desc.split('\n').filter(b => b.trim()).map(b => `<li style="margin-bottom:2px;">${b}</li>`).join('')}</ul>` : "";
        if (comp || role) {
            hasContent = true;
            pList.innerHTML += `
                <div class="resume-item">
                    <div class="resume-item-header"><span>${role || 'Role'}</span><span>${comp || 'Company'}</span></div>
                    <div class="resume-item-sub"><span>📅 ${start || 'Start'} - ${end || 'End'}</span></div>
                    ${bullets}
                </div>`;
        }
    });
    document.getElementById('sec-experience').style.display = hasContent ? 'block' : 'none';
}

let eduCount = 0;
function addEducationBlock() {
    eduCount++;
    const id = eduCount;
    const div = document.createElement('div');
    div.className = 'dynamic-wrapper';
    div.id = `edu-input-block-${id}`;
    div.innerHTML = `
        <button type="button" class="btn-delete" onclick="deleteBlock('edu-input-block-${id}', syncEducationPreview)">🗑️ Delete</button>
        <div class="form-group"><label>Institution / University</label><input type="text" id="edu-name-${id}" placeholder="Stanford University"></div>
        <div class="form-group"><label>Degree / Field of Study</label><input type="text" id="edu-deg-${id}" placeholder="B.S. Computer Science"></div>
        <div class="form-group"><label>Graduation Year</label><input type="text" id="edu-date-${id}" placeholder="May 2021"></div>
    `;
    document.getElementById('education-container').appendChild(div);
    [`edu-name-${id}`, `edu-deg-${id}`, `edu-date-${id}`].forEach(fid => {
        document.getElementById(fid)?.addEventListener('input', syncEducationPreview);
    });
    syncEducationPreview();
}

function syncEducationPreview() {
    const pList = document.getElementById('p-education-list');
    pList.innerHTML = "";
    let hasContent = false;
    
    document.querySelectorAll('#education-container .dynamic-wrapper').forEach(block => {
        const id = block.id.replace('edu-input-block-', '');
        const name = document.getElementById(`edu-name-${id}`)?.value.trim() || '';
        const deg = document.getElementById(`edu-deg-${id}`)?.value.trim() || '';
        const date = document.getElementById(`edu-date-${id}`)?.value.trim() || '';
        if (name || deg) {
            hasContent = true;
            pList.innerHTML += `
                <div class="resume-item">
                    <div class="resume-item-header"><span>${deg || 'Degree'}</span><span>${name || 'Institution'}</span></div>
                    <div class="resume-item-sub"><span>🎓 ${date || 'N/A'}</span></div>
                </div>`;
        }
    });
    document.getElementById('sec-education').style.display = hasContent ? 'block' : 'none';
}

function deleteBlock(blockId, syncFunction) {
    document.getElementById(blockId)?.remove();
    syncFunction();
    saveToLocalStorage();
}

// Styling Engine
function setAccentColor(color) {
    document.querySelector('.resume-print-target').style.setProperty('--accent-color', color);
    const picker = document.getElementById('accent-color-picker');
    if (picker) picker.value = color;
    saveToLocalStorage();
}
document.getElementById('accent-color-picker').addEventListener('input', e => setAccentColor(e.target.value));

document.getElementById('template-selector').addEventListener('change', e => {
    const target = document.querySelector('.resume-print-target');
    allTemplateClasses.forEach(cls => target.classList.remove(cls));
    target.classList.add(e.target.value);
    saveToLocalStorage();
});

// PDF Exporter
function downloadPDF() {
    const element = document.getElementById('resume-capture-node');
    const originalWidth = element.style.width;
    element.style.width = '794px';
    
    const opt = { 
        margin: 0, 
        filename: 'DocMust_Resume.pdf', 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2, useCORS: true }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.width = originalWidth;
    });
}

// Sample Data
function loadSampleData() {
    clearData(false);
    const sample = {
        "in-name": "Alex Sterling", 
        "in-role": "Senior Frontend Developer", 
        "in-email": "alex.sterling@example.com", 
        "in-phone": "+1 555-0198",
        "in-summary": "Results-oriented Web Developer with 5+ years of experience building high-performance, accessible web apps. Specialized in React, TypeScript, and high-conversion design systems.",
        "in-city": "San Francisco, CA", 
        "in-linkedin": "linkedin.com/in/alexsterling",
        "in-skills": "JavaScript (ES6+), React.js, TypeScript\nHTML5, CSS3, TailwindCSS\nGit, Webpack, Agile & CI/CD",
        "exp-comp-1": "TechFlow Solutions", 
        "exp-role-1": "Lead Frontend Engineer", 
        "exp-start-1": "2021", 
        "exp-end-1": "Present", 
        "exp-desc-1": "Architected component system used across 4 enterprise applications.\nReduced first-contentful-paint latency by 45% via code splitting.\nMentored 5 junior developers in accessible front-end architecture.",
        "edu-name-1": "University of California, Berkeley", 
        "edu-deg-1": "B.S. Computer Science", 
        "edu-date-1": "2020"
    };
    
    if (document.querySelectorAll('#experience-container .dynamic-wrapper').length === 0) addExperienceBlock();
    if (document.querySelectorAll('#education-container .dynamic-wrapper').length === 0) addEducationBlock();
    
    Object.keys(sample).forEach(key => {
        const el = document.getElementById(key);
        if (el) { 
            el.value = sample[key]; 
            el.dispatchEvent(new Event('input')); 
        }
    });
    setAccentColor("#0f172a");
    document.getElementById("template-selector").value = "template-tech-split";
    document.getElementById("template-selector").dispatchEvent(new Event('change'));
}

function clearData(confirmPrompt = true) {
    if (confirmPrompt && !confirm("Clear all entries? This cannot be undone.")) return;
    document.getElementById('resume-form').reset();
    document.getElementById('experience-container').innerHTML = '';
    document.getElementById('education-container').innerHTML = '';
    localStorage.removeItem('docmust_saved_resume');
    addExperienceBlock(); 
    addEducationBlock();
    document.querySelectorAll('input, textarea').forEach(el => el.dispatchEvent(new Event('input')));
    jumpToStep(1);
}

// Autosave System
function saveToLocalStorage() {
    const formData = {};
    document.querySelectorAll('input:not([type="file"]), textarea, select').forEach(input => {
        formData[input.id] = input.value;
    });
    localStorage.setItem('docmust_saved_resume', JSON.stringify(formData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('docmust_saved_resume');
    if (saved) {
        const formData = JSON.parse(saved);
        const expKeys = Object.keys(formData).filter(k => k.startsWith('exp-comp-'));
        const eduKeys = Object.keys(formData).filter(k => k.startsWith('edu-name-'));
        
        while (document.querySelectorAll('#experience-container .dynamic-wrapper').length < expKeys.length) addExperienceBlock();
        while (document.querySelectorAll('#education-container .dynamic-wrapper').length < eduKeys.length) addEducationBlock();
        
        for (const [id, value] of Object.entries(formData)) {
            const input = document.getElementById(id);
            if (input && value) { 
                input.value = value; 
                input.dispatchEvent(new Event('input', { bubbles: true })); 
                input.dispatchEvent(new Event('change', { bubbles: true })); 
            }
        }
        if (formData['accent-color-picker']) setAccentColor(formData['accent-color-picker']);
        if (formData['template-selector']) {
            const target = document.querySelector('.resume-print-target');
            allTemplateClasses.forEach(cls => target.classList.remove(cls));
            target.classList.add(formData['template-selector']);
        }
    } else {
        addExperienceBlock(); 
        addEducationBlock();
    }
    syncContactsAndSidebar();
    updateProgressVisuals();
}
document.getElementById('resume-form').addEventListener('input', saveToLocalStorage);
window.addEventListener('DOMContentLoaded', loadFromLocalStorage);

/* Cover Letter Engine */
const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('cl-today-date').textContent = new Date().toLocaleDateString('en-US', dateOptions);

syncText('cl-in-manager', 'cl-p-hiring-manager', 'Hiring Manager Name');
syncText('cl-in-manager', 'cl-p-salutation-name', 'Hiring Manager');
syncText('cl-in-company', 'cl-p-company', 'Company Name');
syncText('cl-in-address', 'cl-p-company-address', 'Company Address');
syncText('cl-in-body', 'cl-p-body', 'Your professional cover letter body will appear here.');

function syncSenderInfoToCL() {
    const name = document.getElementById('in-name')?.value.trim() || 'YOUR FULL NAME';
    document.getElementById('cl-sender-name').textContent = name;
    document.getElementById('cl-p-signoff-name').textContent = name;
    
    const email = document.getElementById('in-email')?.value.trim() || 'email@example.com';
    const phone = document.getElementById('in-phone')?.value.trim() || '+1 234 567 890';
    document.getElementById('cl-sender-email').textContent = email;
    document.getElementById('cl-sender-phone').textContent = phone;
}
['in-name', 'in-email', 'in-phone'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', syncSenderInfoToCL);
});
window.addEventListener('DOMContentLoaded', () => setTimeout(syncSenderInfoToCL, 150));

function loadSampleCoverLetter() {
    const sample = {
        "cl-in-manager": "Sarah Jenkins",
        "cl-in-company": "TechFlow Solutions",
        "cl-in-address": "404 Innovation Drive, San Francisco, CA",
        "cl-in-body": "I am writing to express my enthusiasm for the Senior Developer position at TechFlow Solutions. With over 5 years of experience building scalable web applications and optimizing responsive interfaces, I am confident in my ability to immediately contribute to your engineering goals.\n\nThank you for your time and consideration."
    };
    Object.keys(sample).forEach(key => {
        const el = document.getElementById(key);
        if (el) { el.value = sample[key]; el.dispatchEvent(new Event('input')); }
    });
    syncSenderInfoToCL();
}

function downloadCLPDF() {
    const element = document.getElementById('cl-capture-node');
    const originalWidth = element.style.width;
    element.style.width = '794px';
    const opt = { 
        margin: 0, 
        filename: 'DocMust_CoverLetter.pdf', 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2, useCORS: true }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save().then(() => element.style.width = originalWidth);
}
