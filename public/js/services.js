// ===== SERVICIOS =====

let allServices = [];
let currentService = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAllServices();
    setupFilters();
    setupModals();
    setupSearch();
    checkForDirectReservation();
});

// ===== CARGAR SERVICIOS =====
async function loadAllServices() {
    try {
        showLoading();
        
        const response = await fetch('/api/services');
        if (response.ok) {
            allServices = await response.json();
            displayAllServices(allServices);
        } else {
            throw new Error('Error al cargar servicios');
        }
    } catch (error) {
        console.error('Error:', error);
        // Usar datos de muestra para desarrollo
        allServices = getSampleServices();
        displayAllServices(allServices);
        showAlert('Mostrando datos de ejemplo', 'info');
    } finally {
        hideLoading();
    }
}

function getSampleServices() {
    return [
        {
            _id: '1',
            nombre: 'Masaje Relajante Aromático',
            descripcion: 'Un masaje completo de cuerpo entero utilizando aceites esenciales premium para liberar tensiones y promover la relajación profunda. Ideal para combatir el estrés diario.',
            precio: 800,
            duracion: 60,
            categoria: 'masajes',
            imagen: '/images/masaje-relajante.jpg',
            disponible: true
        },
        {
            _id: '2',
            nombre: 'Facial Hidratante Premium',
            descripcion: 'Tratamiento facial profundo con productos de alta gama que hidratan, nutren y rejuvenecen tu piel, dejándola radiante y suave.',
            precio: 600,
            duracion: 45,
            categoria: 'faciales',
            imagen: '/images/facial-hidratante.jpg',
            disponible: true
        },
        {
            _id: '3',
            nombre: 'Envoltura Corporal Detox',
            descripcion: 'Tratamiento corporal completo con arcillas y productos naturales que eliminan toxinas y tonifican la piel de todo el cuerpo.',
            precio: 1200,
            duracion: 90,
            categoria: 'corporales',
            imagen: '/images/envoltura-corporal.jpg',
            disponible: true
        },
        {
            _id: '4',
            nombre: 'Terapia de Piedras Calientes',
            descripcion: 'Relajante terapia que combina masaje con piedras volcánicas calientes para aliviar tensiones musculares profundas.',
            precio: 1000,
            duracion: 75,
            categoria: 'relajacion',
            imagen: '/images/piedras-calientes.jpg',
            disponible: true
        },
        {
            _id: '5',
            nombre: 'Manicure y Pedicure Spa',
            descripcion: 'Servicio completo de belleza para manos y pies con tratamiento hidratante y esmaltado profesional.',
            precio: 450,
            duracion: 60,
            categoria: 'belleza',
            imagen: '/images/manicure-spa.jpg',
            disponible: true
        },
        {
            _id: '6',
            nombre: 'Masaje de Tejido Profundo',
            descripcion: 'Masaje terapéutico intensivo diseñado para aliviar tensiones musculares crónicas y mejorar la circulación.',
            precio: 950,
            duracion: 60,
            categoria: 'masajes',
            imagen: '/images/masaje-tejido-profundo.jpg',
            disponible: true
        }
    ];
}

// ===== MOSTRAR SERVICIOS =====
function displayAllServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    if (services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="no-services">
                <i class="fas fa-spa"></i>
                <h3>No hay servicios disponibles</h3>
                <p>Próximamente tendremos nuevos servicios para ti.</p>
            </div>
        `;
        return;
    }
    
    servicesGrid.innerHTML = services.map((service, index) => `
        <div class="service-card ${index < 2 ? 'popular' : ''}" 
             data-service-id="${service._id}" 
             data-category="${service.categoria}"
             onclick="openServiceModal('${service._id}')"
             style="animation-delay: ${index * 0.1}s">
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
                <p>${service.descripcion.length > 100 ? service.descripcion.substring(0, 100) + '...' : service.descripcion}</p>
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
}

// ===== FILTROS =====
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos los botones
            filterButtons.forEach(b => b.classList.remove('active'));
            // Agregar active al botón clickeado
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterServices(category);
        });
    });
}

function filterServices(category) {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach((card, index) => {
        const serviceCategory = card.getAttribute('data-category');
        
        if (category === 'all' || serviceCategory === category) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.6s ease forwards`;
            card.style.animationDelay = `${index * 0.1}s`;
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== MODALES =====
function setupModals() {
    // Cerrar modales al hacer click fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeServiceModal();
            closeReservationModal();
        }
    });
    
    // Setup formulario de reserva
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservation);
        
        const dateInput = document.getElementById('reservationDate');
        if (dateInput) {
            dateInput.addEventListener('change', loadAvailableTimes);
            // Establecer fecha mínima como hoy
            dateInput.min = new Date().toISOString().split('T')[0];
        }
    }
}

function openServiceModal(serviceId) {
    const service = allServices.find(s => s._id === serviceId);
    if (!service) return;
    
    currentService = service;
    
    const modal = document.getElementById('serviceModal');
    
    // Llenar datos del modal
    document.getElementById('modalTitle').textContent = service.nombre;
    document.getElementById('modalImage').src = service.imagen || '/images/default-service.jpg';
    document.getElementById('modalDuration').textContent = `${service.duracion} minutos`;
    document.getElementById('modalPrice').textContent = `$${service.precio}`;
    document.getElementById('modalCategory').textContent = getCategoryName(service.categoria);
    document.getElementById('modalDescription').textContent = service.descripcion;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function reserveService() {
    if (!isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
        return;
    }
    
    closeServiceModal();
    openReservationModal();
}

function quickReserve(serviceId) {
    if (!isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', `/services?reserve=${serviceId}`);
        window.location.href = '/login';
        return;
    }
    
    const service = allServices.find(s => s._id === serviceId);
    if (service) {
        currentService = service;
        openReservationModal();
    }
}

function openReservationModal() {
    if (!currentService) return;
    
    const modal = document.getElementById('reservationModal');
    
    // Llenar resumen de la reserva
    document.getElementById('summaryService').textContent = currentService.nombre;
    document.getElementById('summaryDuration').textContent = `${currentService.duracion} minutos`;
    document.getElementById('summaryPrice').textContent = `$${currentService.precio}`;
    
    // Limpiar formulario
    document.getElementById('reservationForm').reset();
    document.getElementById('reservationTime').innerHTML = '<option value="">Primero selecciona una fecha</option>';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== HORARIOS DISPONIBLES =====
async function loadAvailableTimes() {
    const dateInput = document.getElementById('reservationDate');
    const timeSelect = document.getElementById('reservationTime');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) return;
    
    try {
        timeSelect.innerHTML = '<option value="">Cargando horarios...</option>';
        
        const response = await fetch(`/api/reservations/horarios-disponibles/${selectedDate}`);
        
        if (response.ok) {
            const availableTimes = await response.json();
            populateTimeOptions(availableTimes);
        } else {
            throw new Error('Error al cargar horarios');
        }
    } catch (error) {
        console.error('Error:', error);
        // Usar horarios de ejemplo
        const defaultTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        populateTimeOptions(defaultTimes);
    }
}

function populateTimeOptions(availableTimes) {
    const timeSelect = document.getElementById('reservationTime');
    
    if (availableTimes.length === 0) {
        timeSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
        return;
    }
    
    timeSelect.innerHTML = '<option value="">Selecciona un horario</option>' +
        availableTimes.map(time => `<option value="${time}">${formatTime(time)}</option>`).join('');
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// ===== MANEJO DE RESERVAS =====
async function handleReservation(e) {
    e.preventDefault();
    
    if (!currentService) {
        showAlert('Error: No hay servicio seleccionado', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const data = {
        servicioId: currentService._id,
        fecha: formData.get('fecha'),
        hora: formData.get('hora'),
        notas: formData.get('notas') || ''
    };
    
    // Validaciones
    if (!data.fecha) {
        showAlert('Por favor selecciona una fecha', 'error');
        return;
    }
    
    if (!data.hora) {
        showAlert('Por favor selecciona un horario', 'error');
        return;
    }
    
    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(data.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showAlert('No puedes reservar en fechas pasadas', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await authenticatedFetch('/api/reservations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('¡Reserva creada exitosamente!', 'success');
            closeReservationModal();
            
            // Mostrar detalles de la reserva
            setTimeout(() => {
                showReservationConfirmation(result.reservation);
            }, 1000);
            
        } else {
            showAlert(result.message || 'Error al crear la reserva', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message === 'No hay token de autenticación' || error.message === 'Token expirado') {
            return; // El usuario será redirigido automáticamente
        }
        
        showAlert('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        hideLoading();
    }
}

function showReservationConfirmation(reservation) {
    const confirmationHtml = `
        <div class="reservation-confirmation" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
            z-index: 10001;
        ">
            <div style="color: #28a745; font-size: 4rem; margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #333; margin-bottom: 1rem;">¡Reserva Confirmada!</h3>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <p><strong>Servicio:</strong> ${reservation.servicio.nombre}</p>
                <p><strong>Fecha:</strong> ${formatDate(reservation.fecha)}</p>
                <p><strong>Hora:</strong> ${formatTime(reservation.hora)}</p>
                <p><strong>Duración:</strong> ${reservation.servicio.duracion} min</p>
            </div>
            <button onclick="closeConfirmationAndRedirect()" style="
                background: linear-gradient(135deg, #d63384, #e85aa3);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
            ">Ver Mis Reservas</button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        " onclick="closeConfirmationAndRedirect()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHtml);
}

function closeConfirmationAndRedirect() {
    const confirmation = document.querySelector('.reservation-confirmation');
    const overlay = confirmation?.nextElementSibling;
    
    if (confirmation) confirmation.remove();
    if (overlay) overlay.remove();
    
    window.location.href = '/reservations';
}

// ===== RESERVA DIRECTA =====
function checkForDirectReservation() {
    const urlParams = new URLSearchParams(window.location.search);
    const reserveId = urlParams.get('reserve');
    
    if (reserveId) {
        // Esperar a que carguen los servicios
        const checkServices = setInterval(() => {
            if (allServices.length > 0) {
                clearInterval(checkServices);
                quickReserve(reserveId);
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => clearInterval(checkServices), 5000);
    }
}

// ===== UTILIDADES =====
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ===== EFECTOS VISUALES =====
function addServiceCardEffects() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Aplicar efectos después de cargar servicios
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addServiceCardEffects, 1000);
});

// ===== BÚSQUEDA EN TIEMPO REAL =====
function setupSearch() {
    const searchInput = document.getElementById('serviceSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterServicesBySearch(query);
        });
    }
}

function filterServicesBySearch(query) {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const serviceName = card.querySelector('h3').textContent.toLowerCase();
        const serviceDescription = card.querySelector('p').textContent.toLowerCase();
        
        if (serviceName.includes(query) || serviceDescription.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== FAVORITOS (funcionalidad futura) =====
function toggleFavorite(serviceId) {
    // Implementar favoritos en futuras versiones
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(serviceId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showAlert('Eliminado de favoritos', 'info');
    } else {
        favorites.push(serviceId);
        showAlert('Agregado a favoritos', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const serviceId = btn.getAttribute('data-service-id');
        const icon = btn.querySelector('i');
        
        if (favorites.includes(serviceId)) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.classList.add('favorited');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.classList.remove('favorited');
        }
    });
}

// ===== COMPARTIR SERVICIO =====
function shareService(serviceId) {
    const service = allServices.find(s => s._id === serviceId);
    if (!service) return;
    
    if (navigator.share) {
        navigator.share({
            title: service.nombre,
            text: service.descripcion,
            url: `${window.location.origin}/services?service=${serviceId}`
        });
    } else {
        // Fallback: copiar al clipboard
        const url = `${window.location.origin}/services?service=${serviceId}`;
        navigator.clipboard.writeText(url).then(() => {
            showAlert('Enlace copiado al portapapeles', 'success');
        });
    }
}

// ===== ESTILOS DINÁMICOS =====
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .reservation-confirmation {
            animation: popIn 0.3s ease;
        }
        
        @keyframes popIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        .service-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .service-card:hover {
            box-shadow: 0 20px 40px rgba(214, 51, 132, 0.15);
        }
        
        .filter-btn.active {
            background: linear-gradient(135deg, #d63384, #e85aa3);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(214, 51, 132, 0.3);
        }
        
        .no-services {
            grid-column: 1 / -1;
            text-align: center;
            padding: 4rem 2rem;
            color: #6c757d;
        }
        
        .no-services i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #d63384;
        }
    `;
    document.head.appendChild(style);
});