document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const nomeInput = document.getElementById('nome');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.button-text');
    const btnIcon = submitBtn.querySelector('.ph-check');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset error message
        errorMessage.textContent = '';
        errorMessage.classList.remove('visible');
        errorMessage.style.background = 'rgba(244, 63, 94, 0.1)';
        errorMessage.style.color = 'var(--error)';

        const nome = nomeInput.value.trim().toUpperCase();
        const senha = senhaInput.value.trim().toUpperCase();
        const confirmarSenha = confirmarSenhaInput.value.trim().toUpperCase();

        // Validations
        if (!nome) {
            showError('O login deve ser preenchido.');
            return;
        }

        if (senha.length < 4) {
            showError('A senha deve ter pelo menos 4 caracteres.');
            return;
        }

        if (senha !== confirmarSenha) {
            showError('As senhas não coincidem.');
            return;
        }

        // Loading state
        setLoading(true);

        try {
            // API connection attempt to /usuario/-1
            const response = await fetch(`${API_BASE_URL}/usuario/-1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ nome, senha, perfil: 'NOVO' })
            });

            if (response.ok) {
                // Success feedback
                errorMessage.textContent = 'Cadastro realizado com sucesso!';
                errorMessage.style.background = 'rgba(16, 185, 129, 0.1)';
                errorMessage.style.color = 'var(--success)';
                errorMessage.classList.add('visible');
                
                btnText.textContent = 'Gravado!';
                submitBtn.style.background = 'var(--success)';
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                let errorMsg = 'Erro ao realizar cadastro.';
                try {
                    const data = await response.json();
                    errorMsg = data.message || data.error || errorMsg;
                } catch (e) {
                    const text = await response.text();
                    if (text) errorMsg = text;
                }
                showError(errorMsg);
            }
        } catch (error) {
            console.error('Erro na conexão:', error);
            showError('Erro de conexão com o servidor. Verifique se a API está online.');
        } finally {
            if (btnText.textContent !== 'Gravado!') {
                setLoading(false);
            }
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        
        // Shake animation
        registerForm.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 400,
            easing: 'ease-in-out'
        });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            btnText.textContent = 'Gravando...';
            btnIcon.className = 'ph ph-circle-notch ph-spin';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            btnText.textContent = 'Gravar Cadastro';
            btnIcon.className = 'ph ph-check';
        }
    }

    // Reset inputs on load
    registerForm.reset();
    nomeInput.value = '';
    senhaInput.value = '';
    confirmarSenhaInput.value = '';

    // Input effects and uppercase conversion
    [nomeInput, senhaInput, confirmarSenhaInput].forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
        });

        input.addEventListener('focus', () => {
            input.closest('.input-group').classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.closest('.input-group').classList.remove('focused');
        });
    });
});
