// ===== RESERVAS =====

let userReservations = [];
let currentEditReservation = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    
    loadUserReservations();
    setupModals();
});

// ===== CARGAR RESERVAS =====
async function loadUserReservations() {
    try {
        showLoading();
        
        const response = await authenticatedFetch('/api/reservations/mis-reservas');
        
        if (response.ok) {
            userReservations = await response.json();
            displayReservations(userReservations);
        } else {
            throw new Error('Error al cargar reservas');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message === 'No hay token de autenticación' || error.message === 'Token expirado') {
            return; // El usuario será redirigido automáticamente
        }
        
        // Mostrar datos de ejemplo para desarrollo
        userReservations = getSampleReservations();
        displayReservations(userReservations);
        showAlert('Mostrando datos de ejemplo', 'info');
    } finally {
        hideLoading();
    }
}

function getSampleReservations() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return [
        {
            _id: '1',
            servicio: {
                _id: '1',
                nombre: 'Masaje Relajante Aromático',
                precio: 800,
                duracion: 60,
                imagen: '/images/masaje-relajante.jpg'
            },
            fecha: tomorrow.toISOString(),
            hora: '15:00',
            estado: 'confirmada',
            notas: 'Primera visita al spa',
            fechaCreacion: today.toISOString()
        },
        {
            _id: '2',
            servicio: {
                _id: '2',
                nombre: 'Facial Hidratante Premium',
                precio: 600,
                duracion: 45,
                imagen: '/images/facial-hidratante.jpg'
            },
            fecha: nextWeek.toISOString(),
            hora: '11:00',
            estado: 'pendiente',
            notas: '',
            fechaCreacion: today.toISOString()
        }
    ];
}

// ===== MOSTRAR RESERVAS =====
function displayReservations(reservations) {
    const reservationsContent = document.getElementById('reservationsContent');
    const noReservations = document.getElementById('noReservations');
    
    if (reservations.length === 0) {
        reservationsContent.style.display = 'none';
        noReservations.style.display = 'block';
        return;
    }
    
    noReservations.style.display = 'none';
    reservationsContent.style.display = 'block';
    
    // Separar reservas por estado
    const upcoming = reservations.filter(r => new Date(r.fecha) >= new Date() && r.estado !== 'cancelada');
    const past = reservations.filter(r => new Date(r.fecha) < new Date() || r.estado === 'cancelada');
    
    let html = '';
    
    if (upcoming.length > 0) {
        html += '<h3 class="reservations-section-title">Próximas Citas</h3>';
        html += '<div class="reservations-grid">';
        html += upcoming.map(reservation => createReservationCard(reservation, true)).join('');
        html += '</div>';
    }
    
    if (past.length > 0) {
        html += '<h3 class="reservations-section-title">Historial</h3>';
        html += '<div class="reservations-grid">';
        html += past.map(reservation => createReservationCard(reservation, false)).join('');
        html += '</div>';
    }
    
    reservationsContent.innerHTML = html;
}

function createReservationCard(reservation, isUpcoming) {
    const date = new Date(reservation.fecha);
    const isToday = date.toDateString() === new Date().toDateString();
    const daysDiff = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    
    let statusBadge = '';
    let statusClass = '';
    
    switch (reservation.estado) {
        case 'pendiente':
            statusBadge = '<span class="status-badge pending">Pendiente</span>';
            statusClass = 'pending';
            break;
        case 'confirmada':
            statusBadge = '<span class="status-badge confirmed">Confirmada</span>';
            statusClass = 'confirmed';
            break;
        case 'completada':
            statusBadge = '<span class="status-badge completed">Completada</span>';
            statusClass = 'completed';
            break;
        case 'cancelada':
            statusBadge = '<span class="status-badge cancelled">Cancelada</span>';
            statusClass = 'cancelled';
            break;
    }
    
    let timeIndicator = '';
    if (isUpcoming) {
        if (isToday) {
            timeIndicator = '<div class="time-indicator today">¡Hoy!</div>';
        } else if (daysDiff === 1) {
            timeIndicator = '<div class="time-indicator tomorrow">Mañana</div>';
        } else if (daysDiff <= 7) {
            timeIndicator = `<div class="time-indicator soon">En ${daysDiff} días</div>`;
        }
    }
    
    return `
        <div class="reservation-card ${statusClass}" data-reservation-id="${reservation._id}">
            ${timeIndicator}
            <div class="reservation-image">
                <img src="${reservation.servicio.imagen || '/images/default-service.jpg'}" alt="${reservation.servicio.nombre}" loading="lazy">
                ${statusBadge}
            </div>
            <div class="reservation-content">
                <div class="reservation-header">
                    <h4>${reservation.servicio.nombre}</h4>
                    <div class="reservation-price">$${reservation.servicio.precio}</div>
                </div>
                <div class="reservation-details">
                    <div class="detail-row">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(reservation.fecha)}</span>
                    </div>
                    <div class="detail-row">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(reservation.hora)} (${reservation.servicio.duracion} min)</span>
                    </div>
                    ${reservation.notas ? `
                    <div class="detail-row">
                        <i class="fas fa-comment"></i>
                        <span>${reservation.notas}</span>
                    </div>` : ''}
                </div>
                ${isUpcoming && reservation.estado !== 'cancelada' ? `
                <div class="reservation-actions">
                    <button class="btn-edit" onclick="openEditModal('${reservation._id}')">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn-cancel" onclick="confirmCancelReservation('${reservation._id}')">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                </div>` : ''}
            </div>
        </div>
    `;
}

// ===== MODALES =====
function setupModals() {
    // Cerrar modales al hacer click fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeEditModal();
            closeConfirmationModal();
        }
    });
    
    // Setup formulario de edición
    const editForm = document.getElementById('editReservationForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditReservation);
        
        const editDateInput = document.getElementById('editDate');
        if (editDateInput) {
            editDateInput.addEventListener('change', loadEditAvailableTimes);
            editDateInput.min = new Date().toISOString().split('T')[0];
        }
    }
}

// ===== EDITAR RESERVA =====
function openEditModal(reservationId) {
    const reservation = userReservations.find(r => r._id === reservationId);
    if (!reservation) return;
    
    currentEditReservation = reservation;
    
    // Llenar el formulario con datos actuales
    document.getElementById('editDate').value = reservation.fecha.split('T')[0];
    document.getElementById('editNotes').value = reservation.notas || '';
    
    // Cargar horarios para la fecha actual
    loadEditAvailableTimes().then(() => {
        document.getElementById('editTime').value = reservation.hora;
    });
    
    const modal = document.getElementById('editReservationModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    const modal = document.getElementById('editReservationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    currentEditReservation = null;
}

async function loadEditAvailableTimes() {
    const dateInput = document.getElementById('editDate');
    const timeSelect = document.getElementById('editTime');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) return;
    
    try {
        timeSelect.innerHTML = '<option value="">Cargando horarios...</option>';
        
        const response = await fetch(`/api/reservations/horarios-disponibles/${selectedDate}`);
        
        let availableTimes;
        if (response.ok) {
            availableTimes = await response.json();
        } else {
            // Usar horarios de ejemplo
            availableTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        }
        
        // Agregar la hora actual de la reserva si no está en la lista
        if (currentEditReservation && !availableTimes.includes(currentEditReservation.hora)) {
            availableTimes.push(currentEditReservation.hora);
            availableTimes.sort();
        }
        
        timeSelect.innerHTML = '<option value="">Selecciona un horario</option>' +
            availableTimes.map(time => `<option value="${time}">${formatTime(time)}</option>`).join('');
            
    } catch (error) {
        console.error('Error:', error);
        timeSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
    }
}

async function handleEditReservation(e) {
    e.preventDefault();
    
    if (!currentEditReservation) return;
    
    const formData = new FormData(e.target);
    const data = {
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
        
        const response = await authenticatedFetch(`/api/reservations/${currentEditReservation._id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('Reserva actualizada exitosamente', 'success');
            closeEditModal();
            loadUserReservations(); // Recargar reservas
        } else {
            showAlert(result.message || 'Error al actualizar la reserva', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message === 'No hay token de autenticación' || error.message === 'Token expirado') {
            return;
        }
        
        showAlert('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== CANCELAR RESERVA =====
function confirmCancelReservation(reservationId) {
    const reservation = userReservations.find(r => r._id === reservationId);
    if (!reservation) return;
    
    const modal = document.getElementById('confirmationModal');
    const title = document.getElementById('confirmationTitle');
    const message = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmationButton');
    
    title.textContent = 'Cancelar Reserva';
    message.innerHTML = `¿Estás segura de que deseas cancelar tu reserva para <strong>${reservation.servicio.nombre}</strong> el ${formatDate(reservation.fecha)} a las ${formatTime(reservation.hora)}?`;
    
    confirmButton.onclick = () => cancelReservation(reservationId);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function cancelReservation(reservationId) {
    try {
        showLoading();
        closeConfirmationModal();
        
        const response = await authenticatedFetch(`/api/reservations/${reservationId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Reserva cancelada exitosamente', 'success');
            loadUserReservations(); // Recargar reservas
        } else {
            const result = await response.json();
            showAlert(result.message || 'Error al cancelar la reserva', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message === 'No hay token de autenticación' || error.message === 'Token expirado') {
            return;
        }
        
        showAlert('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        hideLoading();
    }
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== UTILIDADES =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// ===== ESTILOS DINÁMICOS =====
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .reservations-hero {
            min-height: 40vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #d63384 0%, #e85aa3 100%);
            color: white;
            text-align: center;
            padding-top: 70px;
        }
        
        .reservations-hero h1 {
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        
        .reservations-section {
            padding: 4rem 0;
            background: #fdf2f8;
        }
        
        .reservations-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
        }
        
        .reservations-header h2 {
            font-family: 'Playfair Display', serif;
            color: #333;
            font-size: 2.5rem;
        }
        
        .btn-new-reservation {
            background: linear-gradient(135deg, #d63384, #e85aa3);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .btn-new-reservation:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(214, 51, 132, 0.3);
        }
        
        .reservations-section-title {
            font-family: 'Playfair Display', serif;
            color: #333;
            font-size: 1.8rem;
            margin-bottom: 2rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #d63384;
        }
        
        .reservations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .reservation-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(214, 51, 132, 0.1);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .reservation-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 32px rgba(214, 51, 132, 0.15);
        }
        
        .time-indicator {
            position: absolute;
            top: 15px;
            left: 15px;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            z-index: 2;
        }
        
        .time-indicator.today {
            background: #dc3545;
            color: white;
            animation: pulse 2s infinite;
        }
        
        .time-indicator.tomorrow {
            background: #ffc107;
            color: #333;
        }
        
        .time-indicator.soon {
            background: #17a2b8;
            color: white;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .reservation-image {
            height: 200px;
            position: relative;
            overflow: hidden;
        }
        
        .reservation-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .status-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            z-index: 2;
        }
        
        .status-badge.pending {
            background: rgba(255, 193, 7, 0.9);
            color: #333;
        }
        
        .status-badge.confirmed {
            background: rgba(40, 167, 69, 0.9);
            color: white;
        }
        
        .status-badge.completed {
            background: rgba(23, 162, 184, 0.9);
            color: white;
        }
        
        .status-badge.cancelled {
            background: rgba(220, 53, 69, 0.9);
            color: white;
        }
        
        .reservation-content {
            padding: 1.5rem;
        }
        
        .reservation-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .reservation-header h4 {
            font-family: 'Playfair Display', serif;
            color: #333;
            font-size: 1.3rem;
            margin: 0;
            flex: 1;
        }
        
        .reservation-price {
            background: linear-gradient(135deg, #d63384, #e85aa3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .reservation-details {
            margin-bottom: 1.5rem;
        }
        
        .detail-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            color: #666;
        }
        
        .detail-row i {
            color: #d63384;
            width: 16px;
            text-align: center;
        }
        
        .reservation-actions {
            display: flex;
            gap: 1rem;
        }
        
        .btn-edit, .btn-cancel {
            flex: 1;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .btn-edit {
            background: linear-gradient(135deg, #17a2b8, #20c997);
            color: white;
        }
        
        .btn-edit:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(23, 162, 184, 0.3);
        }
        
        .btn-cancel {
            background: transparent;
            color: #dc3545;
            border: 2px solid #dc3545;
        }
        
        .btn-cancel:hover {
            background: #dc3545;
            color: white;
            transform: translateY(-2px);
        }
        
        .no-reservations {
            text-align: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 16px rgba(214, 51, 132, 0.1);
        }
        
        .no-reservations-content i {
            font-size: 4rem;
            color: #d63384;
            margin-bottom: 1rem;
        }
        
        .no-reservations-content h3 {
            font-family: 'Playfair Display', serif;
            color: #333;
            margin-bottom: 1rem;
        }
        
        .no-reservations-content p {
            color: #666;
            margin-bottom: 2rem;
        }
        
        .reservation-card.cancelled {
            opacity: 0.7;
        }
        
        .reservation-card.completed {
            border-left: 4px solid #28a745;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .reservations-hero h1 {
                font-size: 2.5rem;
            }
            
            .reservations-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .reservations-grid {
                grid-template-columns: 1fr;
            }
            
            .reservation-actions {
                flex-direction: column;
            }
        }
        
        /* Animaciones de entrada */
        .reservation-card {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        
        .reservation-card:nth-child(1) { animation-delay: 0.1s; }
        .reservation-card:nth-child(2) { animation-delay: 0.2s; }
        .reservation-card:nth-child(3) { animation-delay: 0.3s; }
        .reservation-card:nth-child(4) { animation-delay: 0.4s; }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Estilos de modal mejorados */
        .modal-content {
            animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        /* Mejoras del formulario */
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
        }
        
        /* Perfil específico */
        .profile-section {
            padding: 4rem 0;
            background: #fdf2f8;
            min-height: calc(100vh - 70px);
        }
        
        .profile-header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 16px rgba(214, 51, 132, 0.1);
        }
        
        .profile-avatar {
            margin-bottom: 1rem;
        }
        
        .profile-avatar i {
            font-size: 4rem;
            color: #d63384;
        }
        
        .profile-info h1 {
            font-family: 'Playfair Display', serif;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .profile-badge {
            background: linear-gradient(135deg, #ffc107, #fd7e14);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .profile-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
        }
        
        .profile-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 16px rgba(214, 51, 132, 0.1);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e9ecef;
        }
        
        .card-header h3 {
            font-family: 'Playfair Display', serif;
            color: #333;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .edit-btn {
            background: linear-gradient(135deg, #17a2b8, #20c997);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .edit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(23, 162, 184, 0.3);
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .profile-stats {
            display: grid;
            gap: 1.5rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 4px 16px rgba(214, 51, 132, 0.1);
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .stat-icon {
            background: linear-gradient(135deg, #d63384, #e85aa3);
            color: white;
            padding: 1rem;
            border-radius: 12px;
            font-size: 1.5rem;
        }
        
        .stat-info h4 {
            color: #333;
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
        }
        
        .stat-info p {
            color: #666;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .profile-content {
                grid-template-columns: 1fr;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
});