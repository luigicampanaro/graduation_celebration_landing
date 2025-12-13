// --- CONFIGURATION ---
const SHEET_ENDPOINT = 'PLACEHOLDER_GOOGLE_SHEET_ENDPOINT';
const DEFAULT_LANG = 'it';

// --- STATE ---
let currentLang = DEFAULT_LANG;
let configData = null;
let faqData = null;

// --- DOM ELEMENTS ---
const elements = {
    btnIT: document.getElementById('lang-it'),
    btnEN: document.getElementById('lang-en'),
    btnBA: document.getElementById('lang-ba'),
    eventTitle: document.getElementById('event-title'),
    eventSubtitle: document.getElementById('event-subtitle'),
    heroCTA: document.getElementById('hero-cta'),
    welcomeMessage: document.getElementById('welcome-message'),
    eventDate: document.getElementById('event-date'),
    eventTime: document.getElementById('event-time'),
    venueName: document.getElementById('venue-name'),
    venueAddress: document.getElementById('venue-address'),
    venueMap: document.getElementById('venue-map'),
    faqList: document.getElementById('faq-list'),
    rsvpTitle: document.getElementById('rsvp-title'),
    rsvpDeadline: document.getElementById('rsvp-deadline'),
    labelName: document.getElementById('label-name'),
    labelPlusOne: document.getElementById('label-plus-one'),
    submitBtn: document.getElementById('submit-btn'),
    formStatus: document.getElementById('form-status'),
    rsvpForm: document.getElementById('rsvp-form'),
    cursorDot: document.querySelector('.cursor-dot'),
    cursorCircle: document.querySelector('.cursor-circle'),
    modal: document.getElementById('rsvp-modal'),
    modalMessage: document.getElementById('modal-message'),
    modalIcon: document.getElementById('modal-icon'),
    modalClose: document.getElementById('modal-close')
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        setupEventListeners();
        setupAnimations();
        renderContent(currentLang);
    } catch (error) {
        console.error("Initialization failed:", error);
    }
});

// --- DATA LOADING ---
async function loadData() {
    try {
        const timestamp = Date.now();
        const [configResponse, faqResponse] = await Promise.all([
            fetch(`config.yaml?t=${timestamp}`),
            fetch(`faqs.yaml?t=${timestamp}`)
        ]);

        const configText = await configResponse.text();
        const faqText = await faqResponse.text();

        configData = jsyaml.load(configText);
        faqData = jsyaml.load(faqText);
    } catch (e) {
        console.error("Error parsing YAML:", e);
    }
}

// --- ANIMATIONS & EFFECTS ---
function setupAnimations() {
    // Custom Cursor
    document.addEventListener('mousemove', (e) => {
        elements.cursorDot.style.left = e.clientX + 'px';
        elements.cursorDot.style.top = e.clientY + 'px';

        // Add a slight delay for the circle
        setTimeout(() => {
            elements.cursorCircle.style.left = e.clientX + 'px';
            elements.cursorCircle.style.top = e.clientY + 'px';
        }, 50);
    });

    document.querySelectorAll('a, button, input').forEach(el => {
        el.addEventListener('mouseenter', () => elements.cursorCircle.classList.add('hovered'));
        el.addEventListener('mouseleave', () => elements.cursorCircle.classList.remove('hovered'));
    });

    // Intersection Observer for Reveals
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));

    // Parallax Effect
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        document.querySelectorAll('.parallax').forEach(el => {
            const speed = el.getAttribute('data-speed');
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// --- RENDERING ---
function renderContent(lang) {
    console.log("Rendering content for lang:", lang);
    if (!configData || !faqData) {
        console.error("Data not loaded yet");
        return;
    }

    elements.btnIT.classList.toggle('active', lang === 'it');
    elements.btnEN.classList.toggle('active', lang === 'en');
    elements.btnBA.classList.toggle('active', lang === 'ba');

    // Text Content
    elements.eventTitle.innerHTML = configData.event[`title_${lang}`];
    elements.eventSubtitle.textContent = configData.event[`subtitle_${lang}`];
    elements.heroCTA.textContent = configData.rsvp[`cta_${lang}`];
    elements.welcomeMessage.textContent = configData.event[`welcome_message_${lang}`];

    elements.eventDate.textContent = configData.date_time[`date_${lang}`];
    elements.eventTime.textContent = configData.date_time.time;
    elements.venueName.textContent = configData.venue.name;
    elements.venueAddress.textContent = configData.venue.address;
    elements.venueMap.href = configData.venue.google_maps_link;

    renderFAQs(lang);

    elements.rsvpDeadline.textContent = configData.rsvp[`deadline_${lang}`];
    
    // Labels
    if (lang === 'it') {
        elements.labelName.textContent = 'Nome';
        elements.labelPlusOne.textContent = 'Accompagnatore?';
        elements.submitBtn.textContent = 'Invia';
    } else if (lang === 'ba') {
        elements.labelName.textContent = 'Nom';
        elements.labelPlusOne.textContent = 'Port qualcun?';
        elements.submitBtn.textContent = 'Mann';
    } else {
        elements.labelName.textContent = 'Name';
        elements.labelPlusOne.textContent = 'Plus One?';
        elements.submitBtn.textContent = 'Send';
    }
}

function renderFAQs(lang) {
    elements.faqList.innerHTML = '';

    faqData.faqs.forEach((item, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item reveal-text';
        faqItem.style.transitionDelay = `${index * 0.1}s`; // Staggered reveal

        const question = document.createElement('button');
        question.className = 'faq-question';
        question.textContent = item[`question_${lang}`];

        const answer = document.createElement('div');
        answer.className = 'faq-answer';
        const p = document.createElement('p');
        p.textContent = item[`answer_${lang}`];
        answer.appendChild(p);

        question.addEventListener('click', () => {
            const isActive = question.classList.contains('active');

            // Close all others (Accordion style)
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.style.maxHeight = null;
            });

            if (!isActive) {
                question.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });

        faqItem.appendChild(question);
        faqItem.appendChild(answer);
        elements.faqList.appendChild(faqItem);

        // Observe new elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        });
        observer.observe(faqItem);
    });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    elements.btnIT.addEventListener('click', () => {
        currentLang = 'it';
        renderContent('it');
    });

    elements.btnEN.addEventListener('click', () => {
        currentLang = 'en';
        renderContent('en');
    });

    elements.btnBA.addEventListener('click', () => {
        currentLang = 'ba';
        renderContent('ba');
    });

    elements.rsvpForm.addEventListener('submit', handleFormSubmit);

    // Modal close button
    elements.modalClose.addEventListener('click', closeModal);

    // Close modal when clicking outside
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeModal();
        }
    });
}

// --- GOLDEN SNITCH LOGIC ---
class GoldenSnitch {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'golden-snitch';

        // Add wings
        const leftWing = document.createElement('div');
        leftWing.className = 'golden-snitch-wing-left';
        const rightWing = document.createElement('div');
        rightWing.className = 'golden-snitch-wing-right';
        this.element.appendChild(leftWing);
        this.element.appendChild(rightWing);

        document.body.appendChild(this.element);

        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = 0;
        this.vy = 0;
        this.targetX = this.x;
        this.targetY = this.y;
        this.isCaught = false;
        this.hovering = false;

        this.init();
    }

    init() {
        this.updatePosition();
        this.startRandomMovement();
        this.startHoverLogic();
        this.addInteractions();
        this.loop();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    startRandomMovement() {
        setInterval(() => {
            if (this.isCaught || this.hovering) return;
            // Pick a random target on screen
            this.targetX = Math.random() * (window.innerWidth - 50);
            this.targetY = Math.random() * (window.innerHeight - 50);
        }, 2000);
    }

    startHoverLogic() {
        setInterval(() => {
            if (this.isCaught) return;
            // Randomly enter hover mode (50% chance)
            if (Math.random() > 0.5) {
                this.hovering = true;
                setTimeout(() => {
                    this.hovering = false;
                }, 2000 + Math.random() * 1000); // Hover for 2-3s
            }
        }, 3000); // Check every 3 seconds
    }

    addInteractions() {
        // Avoid Cursor (Only when not hovering)
        document.addEventListener('mousemove', (e) => {
            if (this.isCaught || this.hovering) return;

            const dx = this.x - e.clientX;
            const dy = this.y - e.clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) { // Reduced detection radius for closer response
                const angle = Math.atan2(dy, dx);
                const force = (120 - dist) * 0.3; // Increased force for faster escape
                this.vx += Math.cos(angle) * force;
                this.vy += Math.sin(angle) * force;
            }
        });

        // Global Click Listener for Proximity Catch
        document.addEventListener('mousedown', (e) => {
            if (this.isCaught) return;

            const dx = this.x - e.clientX;
            const dy = this.y - e.clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Forgiving hitbox: 60px radius
            if (dist < 60) {
                this.catch();
            }
        });
    }

    catch() {
        if (this.isCaught) return;
        this.isCaught = true;
        this.hovering = false;
        this.element.classList.add('falling');
        this.element.style.top = `${window.innerHeight + 100}px`; // Fall off screen

        setTimeout(() => {
            this.respawn();
        }, 3000);
    }

    respawn() {
        this.isCaught = false;
        this.element.classList.remove('falling');

        // Random side respawn
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        switch (side) {
            case 0: this.x = Math.random() * window.innerWidth; this.y = -50; break;
            case 1: this.x = window.innerWidth + 50; this.y = Math.random() * window.innerHeight; break;
            case 2: this.x = Math.random() * window.innerWidth; this.y = window.innerHeight + 50; break;
            case 3: this.x = -50; this.y = Math.random() * window.innerHeight; break;
        }

        this.vx = 0;
        this.vy = 0;
        this.updatePosition();
    }

    createSparkle() {
        if (Math.random() > 0.3) return; // Limit sparkle rate

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${this.x + 4}px`; // Center offset
        sparkle.style.top = `${this.y + 4}px`;
        document.body.appendChild(sparkle);

        // Remove after animation
        setTimeout(() => sparkle.remove(), 1000);
    }

    loop() {
        if (!this.isCaught) {
            if (this.hovering) {
                // Hover behavior: Nearly stationary
                this.vx *= 0.85;
                this.vy *= 0.85;
                // Very gentle drift
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vy += (Math.random() - 0.5) * 0.05;
            } else {
                // Normal behavior
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                this.vx += dx * 0.0005;
                this.vy += dy * 0.0005;
                this.vx *= 0.98;
                this.vy *= 0.98;
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Boundary checks
            if (this.x < 0) this.x = 0;
            if (this.x > window.innerWidth - 12) this.x = window.innerWidth - 12;
            if (this.y < 0) this.y = 0;
            if (this.y > window.innerHeight - 12) this.y = window.innerHeight - 12;

            this.updatePosition();
            this.createSparkle();
        }
        requestAnimationFrame(() => this.loop());
    }
}

// Initialize Snitch
new GoldenSnitch();

// --- FORM SUBMISSION ---
async function handleFormSubmit(e) {
    e.preventDefault();

    if (SHEET_ENDPOINT.includes('PLACEHOLDER')) {
        alert("Please configure the Google Sheet Endpoint in script.js");
        return;
    }

    const formData = new FormData(elements.rsvpForm);
    const data = Object.fromEntries(formData.entries());
    data.plus_one = elements.rsvpForm.plus_one.checked; // Send boolean true/false

    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = '...';

    try {
        await fetch(SHEET_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Show success modal
        let successMessage;
        if (currentLang === 'it') {
            successMessage = 'Confermato! La tua partecipazione è stata registrata con successo.';
        } else if (currentLang === 'ba') {
            successMessage = 'Appost! T\'am signat.';
        } else {
            successMessage = 'Confirmed! Your attendance has been successfully registered.';
        }

        showModal('success', successMessage);
        elements.rsvpForm.reset();

    } catch (error) {
        console.error("Submission error:", error);
        let errorMessage;
        if (currentLang === 'it') {
            errorMessage = 'Errore. Si prega di riprovare.';
        } else if (currentLang === 'ba') {
            errorMessage = 'Non ha funziunat. Pruev arier.';
        } else {
            errorMessage = 'Error. Please try again.';
        }
        showModal('error', errorMessage);
    } finally {
        elements.submitBtn.disabled = false;
        setTimeout(() => {
            renderContent(currentLang);
        }, 500);
    }
}

// Modal functions
function showModal(type, message) {
    elements.modalMessage.textContent = message;
    elements.modalIcon.textContent = type === 'success' ? '✓' : '✗';
    elements.modalIcon.style.color = type === 'success' ? '#c0a062' : '#ff6b6b';
    elements.modal.classList.add('show');

    // Auto-close after 5 seconds
    setTimeout(() => closeModal(), 5000);
}

function closeModal() {
    elements.modal.classList.remove('show');
}
