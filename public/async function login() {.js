async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await response.json();
        if(data.success) {
            localStorage.setItem('token', data.token);
            token = data.token; // Cập nhật lại biến token
            document.getElementById('mainApp').style.display = 'block';
            document.querySelector('.auth-section').style.display = 'none';
            loadTransactions();
        } else {
            alert('Lỗi: ' + (data.message || 'Đăng nhập thất bại'));
        }
    } catch(err) {
        alert('Lỗi kết nối: ' + err.message);
    }
}