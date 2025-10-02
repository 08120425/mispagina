// ===== FUNCIONES PRINCIPALES =====

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadServices();
    checkAuthentication();
});

// Inicializar la aplicación
function initializeApp() {
    setupNavigation();
    setupHamburgerMenu();
    setupScrollEffects();
}

// ===== NAVEGACIÓN =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Menú hamburguesa para móvil
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer click en un enlace
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== EFECTOS DE SCROLL =====
function setupScrollEffects() {
    // Navbar transparente en scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Animaciones de entrada para elementos
    observeElements();
}

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observar elementos que necesitan animación
    document.querySelectorAll('.service-card, .testimonial, .contact-item').forEach(el => {
        observer.observe(el);
    });
}

// ===== SERVICIOS =====
async function loadServices(limit = 6) {
    try {
        const response = await fetch('/api/services');
        if (response.ok) {
            const services = await response.json();
            displayServices(services.slice(0, limit));
        } else {
            console.error('Error al cargar servicios');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    if (services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="no-services">
                <i class="fas fa-spa"></i>
                <h3>No hay servicios disponibles</h3>
                <p>Estamos trabajando para traerte los mejores servicios de spa.</p>
            </div>
        `;
        return;
    }
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-service-id="${service._id}" onclick="openServiceModal('${service._id}')">
            <div class="service-image">
                <img src="${service.imagen || '/images/default-service.jpg'}" alt="${service.nombre}" loading="lazy">
                <div class="service-price">$${service.precio}</div>
                <div class="service-category">${getCategoryName(service.categoria)}</div>
            </div>
            <div class="service-content">
                <h3>${service.nombre}</h3>
                <div class="service-meta">
                    <div class="service-duration">
                        <i class="fas fa-clock"></i>
                        <span>${service.duracion} min</span>
                    </div>
                    <div class="service-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                </div>
                <p>${service.descripcion}</p>
                <div class="service-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); openServiceModal('${service._id}')">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                    <button class="btn-reserve" onclick="event.stopPropagation(); quickReserve('${service._id}')">
                        <i class="fas fa-calendar-plus"></i>
                        Reservar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Aplicar animaciones de entrada
    setTimeout(() => {
        servicesGrid.querySelectorAll('.service-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

function getCategoryName(category) {
    const categories = {
        'masajes': 'Masajes',
        'faciales': 'Faciales',
        'corporales': 'Corporales',
        'relajacion': 'Relajación',
        'belleza': 'Belleza'
    };
    return categories[category] || category;
}

// ===== MODALES =====
function openServiceModal(serviceId) {
    // Implementado en services.js
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function quickReserve(serviceId) {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Redirigir a servicios o abrir modal de reserva
    window.location.href = `/services?reserve=${serviceId}`;
}

// ===== AUTENTICACIÓN =====
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const profileLink = document.getElementById('profileLink');
    
    if (token && user.id) {
        // Usuario autenticado
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'block';
            logoutLink.onclick = logout;
        }
        if (profileLink) profileLink.style.display = 'block';
    } else {
        // Usuario no autenticado
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Llamar al endpoint de logout
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => {
        window.location.href = '/';
    }).catch(() => {
        window.location.href = '/';
    });
}

// ===== UTILIDADES =====
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alertMessage');
    if (!alert) return;
    
    const alertText = alert.querySelector('.alert-text');
    const alertIcon = alert.querySelector('.alert-icon');
    
    alertText.textContent = message;
    alert.className = `alert alert-${type}`;
    
    if (type === 'success') {
        alertIcon.className = 'alert-icon fas fa-check-circle';
    } else {
        alertIcon.className = 'alert-icon fas fa-exclamation-circle';
    }
    
    alert.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    const alert = document.getElementById('alertMessage');
    if (alert) {
        alert.style.display = 'none';
    }
}

function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Formatear fecha
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(price);
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar teléfono
function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s|-|\(|\)/g, ''));
}

// ===== EFECTOS VISUALES =====
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

// Aplicar efecto ripple a botones
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-primary') || 
        e.target.classList.contains('cta-button') ||
        e.target.classList.contains('auth-btn')) {
        addRippleEffect(e.target, e);
    }
});

// ===== INTERSECCIÓN OBSERVER PARA ANIMACIONES =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
        }
    });
}, observerOptions);

// ===== MANEJO DE ERRORES GLOBAL =====
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    // No mostrar errores al usuario en producción
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rechazada:', e.reason);
    e.preventDefault();
});

// ===== DATOS DE EJEMPLO PARA DESARROLLO =====
const sampleServices = [
    {
        _id: '1',
        nombre: 'Masaje Relajante',
        descripcion: 'Un masaje completo para liberar tensiones y estrés',
        precio: 800,
        duracion: 60,
        categoria: 'masajes',
        imagen: '/images/masaje-relajante.jpg'
    },
    {
        _id: '2',
        nombre: 'Facial Hidratante',
        descripcion: 'Tratamiento facial profundo para hidratar y rejuvenecer la piel',
        precio: 600,
        duracion: 45,
        categoria: 'faciales',
        imagen: '/images/facial-hidratante.jpg'
    },
    {
        _id: '3',
        nombre: 'Envoltura Corporal',
        descripcion: 'Tratamiento corporal completo con productos naturales',
        precio: 1200,
        duracion: 90,
        categoria: 'corporales',
        imagen: '/images/envoltura-corporal.jpg'
    }
];

// Usar datos de ejemplo si no hay conexión a la base de datos
async function loadServicesWithFallback(limit = 6) {
    try {
        const response = await fetch('/api/services');
        if (response.ok) {
            const services = await response.json();
            displayServices(services.slice(0, limit));
        } else {
            throw new Error('API no disponible');
        }
    } catch (error) {
        console.warn('Usando datos de ejemplo:', error);
        displayServices(sampleServices.slice(0, limit));
    }
}

// ===== CSS DINÁMICO =====
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            pointer-events: none;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .animate-fadeInUp {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .navbar.scrolled {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
        }
        
        .no-services {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--gray-500);
        }
        
        .no-services i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}

// Aplicar estilos dinámicos al cargar
document.addEventListener('DOMContentLoaded', addDynamicStyles);