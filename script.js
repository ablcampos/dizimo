document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginInput = document.getElementById('login');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.button-text');
    const btnIcon = submitBtn.querySelector('.ph-arrow-right');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset error message
        errorMessage.textContent = '';
        errorMessage.classList.remove('visible');

        const login = loginInput.value.trim().toUpperCase();
        const senha = senhaInput.value.trim().toUpperCase();

        if (!login || !senha) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Loading state
        setLoading(true);

        try {
            // API connection attempt
            const response = await fetch(`${API_BASE_URL}/usuario/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ login, senha })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Check if user is newly registered and pending approval
                if (data.perfil === 'NOVO') {
                    showError('Agora, entre em Contato Com o Administrador para Liberação Do seu LOGIN...');
                    setLoading(false);
                    return;
                }

                // ARMAZENA O PERFIL PARA USO NO DASHBOARD
                sessionStorage.setItem('userProfile', data.perfil);

                // Success animation before redirect
                btnText.textContent = 'Acesso Autorizado!';
                submitBtn.style.background = 'var(--success)';
                setTimeout(() => {
                    // PASSA O USUARIO PELA URL
                    window.location.href = `dashboard.html?usuario=${login}`;
                }, 800);
            } else {
                let errorMsg = 'Credenciais inválidas. Tente novamente.';
                try {
                    const data = await response.json();
                    errorMsg = data.message || data.error || errorMsg;
                } catch (e) {
                    // Se não for JSON, tenta pegar texto
                    const text = await response.text();
                    if (text) errorMsg = text;
                }
                showError(errorMsg);
                
                // Limpa senha e foca no usuário como solicitado
                senhaInput.value = '';
                loginInput.focus();
            }
        } catch (error) {
            console.error('Erro na conexão:', error);
            
            // Verificação de erro comum (CORS ou Servidor Offline)
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showError('Erro de conexão ou CORS. Verifique se a API está online e aceita requisições do seu domínio.');
            } else {
                showError('Erro ao conectar com a API: ' + error.message);
            }

            // Fallback para demonstração se for admin/admin (opcional)
            if (login === 'admin' && senha === 'admin') {
                console.log('Usando modo demo como fallback...');
                btnText.textContent = 'Modo Demo: Sucesso!';
                submitBtn.style.background = 'var(--success)';
                setTimeout(() => {
                    window.location.href = `dashboard.html?usuario=${login}`;
                }, 1000);
            }
        } finally {
            if (btnText.textContent !== 'Acesso Autorizado!' && btnText.textContent !== 'Modo Demo: Sucesso!') {
                setLoading(false);
            }
        }
    });

    // --- Lógica do QR Code ---
    const generateQRCodeBtn = document.getElementById('generateQRCode');
    const qrModal = document.getElementById('qrModal');
    const closeQRBtn = document.getElementById('closeQR');
    const qrcodeContainer = document.getElementById('qrcode');
    let qrCodeGenerated = false;

    generateQRCodeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        qrModal.classList.add('active');

        if (!qrCodeGenerated) {
            // Limpa o container caso tenha algo
            qrcodeContainer.innerHTML = '';
            
            // Gera o QR Code apontando para o seu GitHub Pages
            new QRCode(qrcodeContainer, {
                text: "https://ablcampos.github.io/dizimo/index.html",
                width: 200,
                height: 200,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            qrCodeGenerated = true;
        }
    });

    closeQRBtn.addEventListener('click', () => {
        qrModal.classList.remove('active');
    });

    // Fechar ao clicar fora do conteúdo
    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        
        // Shake animation
        loginForm.animate([
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
            btnText.textContent = 'Autenticando...';
            btnIcon.className = 'ph ph-circle-notch ph-spin';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            btnText.textContent = 'Entrar no Sistema';
            btnIcon.className = 'ph ph-arrow-right';
        }
    }

    // Reset inputs on load
    loginForm.reset();
    loginInput.value = '';
    senhaInput.value = '';

    // Input effects and uppercase conversion
    [loginInput, senhaInput].forEach(input => {
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
