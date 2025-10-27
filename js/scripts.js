// ===== MENU MOBILE =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animação do hamburguer
            this.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
});

// ===== MÁSCARAS DE ENTRADA =====
function maskCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

function maskPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

function maskCEP(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
}

// Aplicar máscaras
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('cpf');
    const phoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            e.target.value = maskCPF(e.target.value);
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = maskPhone(e.target.value);
        });
    }
    
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            e.target.value = maskCEP(e.target.value);
        });
        
        // Buscar CEP via API ViaCEP
        cepInput.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.erro) {
                            document.getElementById('logradouro').value = data.logradouro || '';
                            document.getElementById('bairro').value = data.bairro || '';
                            document.getElementById('cidade').value = data.localidade || '';
                            document.getElementById('estado').value = data.uf || '';
                            
                            // Focar no campo número
                            document.getElementById('numero').focus();
                        } else {
                            alert('CEP não encontrado.');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar CEP:', error);
                    });
            }
        });
    }
});

// ===== VALIDAÇÃO DO FORMULÁRIO =====
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    
    if (form) {
        // Validação do CPF
        function validarCPF(cpf) {
            cpf = cpf.replace(/\D/g, '');
            
            if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
                return false;
            }
            
            let soma = 0;
            let resto;
            
            for (let i = 1; i <= 9; i++) {
                soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
            }
            
            resto = (soma * 10) % 11;
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(cpf.substring(9, 10))) return false;
            
            soma = 0;
            for (let i = 1; i <= 10; i++) {
                soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
            }
            
            resto = (soma * 10) % 11;
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(cpf.substring(10, 11))) return false;
            
            return true;
        }
        
        // Validação de idade mínima (18 anos)
        function validarIdade(dataNascimento) {
            const hoje = new Date();
            const nascimento = new Date(dataNascimento);
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }
            
            return idade >= 18;
        }
        
        // Mostrar/ocultar campos baseado no interesse
        const interesseRadios = document.querySelectorAll('input[name="interesse"]');
        const adocaoDetails = document.getElementById('adocao-details');
        const voluntarioDetails = document.getElementById('voluntario-details');
        
        interesseRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (adocaoDetails) adocaoDetails.style.display = 'none';
                if (voluntarioDetails) voluntarioDetails.style.display = 'none';
                
                if (this.value === 'adocao' && adocaoDetails) {
                    adocaoDetails.style.display = 'block';
                } else if (this.value === 'voluntario' && voluntarioDetails) {
                    voluntarioDetails.style.display = 'block';
                }
            });
        });
        
        // Validação em tempo real
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('blur', function() {
                const errorMsg = this.nextElementSibling;
                if (this.value && !validarCPF(this.value)) {
                    errorMsg.textContent = 'CPF inválido';
                    errorMsg.classList.add('show');
                    this.setCustomValidity('CPF inválido');
                } else {
                    errorMsg.classList.remove('show');
                    this.setCustomValidity('');
                }
            });
        }
        
        // Validação de confirmação de e-mail
        const emailInput = document.getElementById('email');
        const emailConfirmInput = document.getElementById('email-confirm');
        
        if (emailConfirmInput) {
            emailConfirmInput.addEventListener('input', function() {
                const errorMsg = this.nextElementSibling;
                if (this.value !== emailInput.value) {
                    errorMsg.textContent = 'Os e-mails não coincidem';
                    errorMsg.classList.add('show');
                    this.setCustomValidity('Os e-mails não coincidem');
                } else {
                    errorMsg.classList.remove('show');
                    this.setCustomValidity('');
                }
            });
        }
        
        // Validação de idade
        const dataNascimentoInput = document.getElementById('data-nascimento');
        if (dataNascimentoInput) {
            dataNascimentoInput.addEventListener('blur', function() {
                const errorMsg = this.nextElementSibling;
                if (this.value && !validarIdade(this.value)) {
                    errorMsg.textContent = 'Você deve ter pelo menos 18 anos';
                    errorMsg.classList.add('show');
                    this.setCustomValidity('Idade mínima não atingida');
                } else {
                    errorMsg.classList.remove('show');
                    this.setCustomValidity('');
                }
            });
        }
        
        // Validação ao submeter
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // Validar todos os campos obrigatórios
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    const errorMsg = field.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.textContent = 'Este campo é obrigatório';
                        errorMsg.classList.add('show');
                    }
                    isValid = false;
                } else {
                    const errorMsg = field.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.classList.remove('show');
                    }
                }
            });
            
            // Validar CPF
            if (cpfInput && cpfInput.value && !validarCPF(cpfInput.value)) {
                isValid = false;
            }
            
            // Validar idade
            if (dataNascimentoInput && dataNascimentoInput.value && !validarIdade(dataNascimentoInput.value)) {
                isValid = false;
            }
            
            // Validar confirmação de e-mail
            if (emailConfirmInput && emailInput && emailConfirmInput.value !== emailInput.value) {
                isValid = false;
            }
            
            // Validar termos
            const termosCheckbox = document.getElementById('termos');
            if (termosCheckbox && !termosCheckbox.checked) {
                const errorMsg = termosCheckbox.closest('.checkbox-item').parentElement.nextElementSibling;
                if (errorMsg) {
                    errorMsg.textContent = 'Você deve aceitar os termos e condições';
                    errorMsg.classList.add('show');
                }
                isValid = false;
            }
            
            if (isValid) {
                // Simular envio do formulário
                form.style.display = 'none';
                const successMessage = document.getElementById('success-message');
                if (successMessage) {
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Em produção, aqui seria feito o envio real dos dados
                console.log('Formulário válido! Dados:', new FormData(form));
            } else {
                // Rolar até o primeiro erro
                const firstError = form.querySelector('.error-message.show');
                if (firstError) {
                    firstError.previousElementSibling.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        });
        
        // Limpar validação ao resetar
        form.addEventListener('reset', function() {
            const errorMessages = form.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.classList.remove('show'));
            
            const allInputs = form.querySelectorAll('input, select, textarea');
            allInputs.forEach(input => input.setCustomValidity(''));
        });
    }
});

// ===== SMOOTH SCROLL PARA ÂNCORAS =====
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// ===== CONTADOR DE CARACTERES PARA TEXTAREA =====
document.addEventListener('DOMContentLoaded', function() {
    const mensagemTextarea = document.getElementById('mensagem');
    
    if (mensagemTextarea) {
        const maxLength = mensagemTextarea.getAttribute('maxlength');
        const small = mensagemTextarea.nextElementSibling;
        
        mensagemTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            if (small) {
                small.textContent = `${currentLength}/${maxLength} caracteres`;
                
                if (currentLength > maxLength * 0.9) {
                    small.style.color = 'var(--error-color)';
                } else {
                    small.style.color = 'var(--text-light)';
                }
            }
        });
    }
});

// ===== ANIMAÇÃO DE SCROLL =====
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.project-card, .team-member, .pet-card, .story-card, .step');
    elementsToAnimate.forEach(el => observer.observe(el));
});

// ===== ACESSIBILIDADE - ESC PARA FECHAR MENU =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.focus();
            }
        }
    }
});

// ===== PREVENIR ENVIO DUPLICADO DO FORMULÁRIO =====
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    
    if (form) {
        let isSubmitting = false;
        
        form.addEventListener('submit', function(e) {
            if (isSubmitting) {
                e.preventDefault();
                return false;
            }
            
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
                isSubmitting = true;
            }
        });
    }
});

// ===== LOG DE PERFORMANCE (APENAS PARA DESENVOLVIMENTO) =====
if (window.performance && console) {
    window.addEventListener('load', function() {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Tempo de carregamento da página:', (pageLoadTime / 1000).toFixed(2), 'segundos');
    });
}