// ===== AUTENTICACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
    checkRedirectAfterLogin();
});

function setupAuthForms() {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
}

// ===== LOGIN =====
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Validaciones básicas
    if (!validateEmail(data.email)) {
        showAlert('Por favor ingresa un email válido', 'error');
        return;
    }
    
    if (!data.password || data.password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            showAlert('¡Bienvenida de vuelta!', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectTo;
            }, 1500);
            
        } else {
            showAlert(result.message || 'Error al iniciar sesión', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== REGISTRO =====
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    // Validaciones
    if (!data.nombre || data.nombre.length < 2) {
        showAlert('El nombre debe tener al menos 2 caracteres', 'error');
        return;
    }
    
    if (!validateEmail(data.email)) {
        showAlert('Por favor ingresa un email válido', 'error');
        return;
    }
    
    if (!validatePhone(data.telefono)) {
        showAlert('Por favor ingresa un teléfono válido', 'error');
        return;
    }
    
    if (!data.password || data.password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (data.password !== data.confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            showAlert('¡Cuenta creada exitosamente!', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = '/services';
            }, 1500);
            
        } else {
            showAlert(result.message || 'Error al crear la cuenta', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== VALIDACIÓN EN TIEMPO REAL =====
function setupRealTimeValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    // Validación de email
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const isValid = validateEmail(this.value);
            toggleFieldValidation(this, isValid, 'Email válido', 'Email inválido');
        });
        
        input.addEventListener('input', function() {
            removeFieldValidation(this);
        });
    });
    
    // Validación de teléfono
    phoneInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const isValid = validatePhone(this.value);
            toggleFieldValidation(this, isValid, 'Teléfono válido', 'Teléfono inválido');
        });
        
        input.addEventListener('input', function() {
            removeFieldValidation(this);
            // Formatear teléfono mientras se escribe
            this.value = formatPhoneInput(this.value);
        });
    });
    
    // Validación de contraseña
    passwordInputs.forEach(input => {
        if (input.name === 'password') {
            input.addEventListener('input', function() {
                const strength = checkPasswordStrength(this.value);
                showPasswordStrength(this, strength);
            });
        }
        
        if (input.name === 'confirmPassword') {
            input.addEventListener('blur', function() {
                const password = document.querySelector('input[name="password"]').value;
                const isValid = this.value === password && this.value.length > 0;
                toggleFieldValidation(this, isValid, 'Contraseñas coinciden', 'Las contraseñas no coinciden');
            });
        }
    });
}

function toggleFieldValidation(field, isValid, successMessage, errorMessage) {
    const formGroup = field.closest('.form-group');
    
    removeFieldValidation(field);
    
    if (isValid) {
        formGroup.classList.add('success');
        addValidationMessage(formGroup, successMessage, 'success');
    } else {
        formGroup.classList.add('error');
        addValidationMessage(formGroup, errorMessage, 'error');
    }
}

function removeFieldValidation(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('success', 'error');
    
    const existingMessage = formGroup.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

function addValidationMessage(formGroup, message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `validation-message ${type}-message`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-circle'}"></i>
        ${message}
    `;
    formGroup.appendChild(messageEl);
}

// ===== UTILIDADES DE VALIDACIÓN =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

function formatPhoneInput(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
}

function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return {
        score: strength,
        level: strength <= 2 ? 'weak' : strength <= 3 ? 'medium' : 'strong'
    };
}

function showPasswordStrength(field, strength) {
    const formGroup = field.closest('.form-group');
    
    // Remover indicador existente
    const existingStrength = formGroup.querySelector('.password-strength');
    if (existingStrength) {
        existingStrength.remove();
    }
    
    if (field.value.length === 0) return;
    
    const strengthEl = document.createElement('div');
    strengthEl.className = 'password-strength';
    
    const levels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];
    
    strengthEl.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength.score / 5) * 100}%; background-color: ${colors[strength.score - 1] || colors[0]}"></div>
        </div>
        <span class="strength-text">${levels[strength.score - 1] || levels[0]}</span>
    `;
    
    formGroup.appendChild(strengthEl);
}

// ===== PROTECCIÓN DE RUTAS =====
function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
        return false;
    }
    return true;
}

function checkRedirectAfterLogin() {
    const token = localStorage.getItem('token');
    if (token && window.location.pathname === '/login') {
        window.location.href = '/';
    }
}

// ===== GESTIÓN DE TOKENS =====
function getAuthToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function isAuthenticated() {
    const token = getAuthToken();
    const user = getCurrentUser();
    return !!(token && user && user.id);
}

// ===== INTERCEPTOR PARA REQUESTS AUTENTICADOS =====
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Si el token expiró, redirigir al login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
        throw new Error('Token expirado');
    }
    
    return response;
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    fetch('/api/auth/logout', {
        method: 'POST'
    }).finally(() => {
        window.location.href = '/';
    });
}

// ===== ESTILOS DINÁMICOS PARA VALIDACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .form-group.success input {
            border-color: #28a745;
        }
        
        .form-group.error input {
            border-color: #dc3545;
        }
        
        .validation-message {
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .success-message {
            color: #28a745;
        }
        
        .error-message {
            color: #dc3545;
        }
        
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .strength-bar {
            width: 100%;
            height: 4px;
            background-color: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 0.25rem;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-text {
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .auth-btn.loading {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .form-group input:focus {
            box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.1);
        }
        
        .form-group.success input:focus {
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
        }
        
        .form-group.error input:focus {
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }
    `;
    document.head.appendChild(style);
});

// ===== EVENTOS GLOBALES =====
window.addEventListener('storage', function(e) {
    // Sincronizar estado de autenticación entre pestañas
    if (e.key === 'token' && !e.newValue) {
        // Token removido en otra pestaña, cerrar sesión
        window.location.href = '/login';
    }
});