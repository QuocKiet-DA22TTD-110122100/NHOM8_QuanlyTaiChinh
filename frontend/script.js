document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // I. DỮ LIỆU VÀ KHAI BÁO BIẾN
    // =======================================================

    // === Dữ liệu mẫu (sau này sẽ lấy từ API backend) ===
    let mockData = {
        transactions: [
            { id: 1, type: 'income', description: 'Nhận lương tháng 6', amount: 30000000, date: '2023-06-01' },
            { id: 2, type: 'expense', description: 'Thanh toán tiền nhà', amount: 7000000, date: '2023-06-02' },
            { id: 3, type: 'expense', description: 'Đi siêu thị', amount: 1500000, date: '2023-06-05' },
            { id: 4, type: 'expense', description: 'Đổ xăng xe', amount: 500000, date: '2023-06-06' },
            { id: 5, type: 'income', description: 'Thưởng dự án', amount: 5000000, date: '2023-06-10' },
            { id: 6, type: 'expense', description: 'Ăn tối với bạn bè', amount: 800000, date: '2023-06-12' },
        ],
        chartData: {
            labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
            income: [10, 15, 12, 18], // Đơn vị: triệu đồng
            expense: [5, 7, 6, 8],
        }
    };

    // === Lấy các elements từ DOM một lần duy nhất ===
    // Dashboard
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const balanceEl = document.getElementById('balance');
    const transactionListEl = document.getElementById('transaction-list');
    const chartCanvas = document.getElementById('main-chart');

    // Sidebar và Header
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const logoutBtn = document.querySelector('.sidebar-footer .nav-item');
    const addBtn = document.querySelector('.add-btn');

    // Modal
    const modal = document.getElementById('add-transaction-modal');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const transactionForm = document.getElementById('transaction-form');
    
    // Biến cho biểu đồ
    let mainChart; 


    // =======================================================
    // II. CÁC HÀM XỬ LÝ GIAO DIỆN (RENDER FUNCTIONS)
    // =======================================================

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    function renderKPIs(transactions) {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        totalIncomeEl.textContent = formatCurrency(income);
        totalExpenseEl.textContent = formatCurrency(expense);
        balanceEl.textContent = formatCurrency(balance);
    }

    function renderTransactions(transactions) {
        transactionListEl.innerHTML = '';
        const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        if (recentTransactions.length === 0) {
            transactionListEl.innerHTML = '<li style="text-align: center; color: var(--text-secondary);">Không có giao dịch nào.</li>';
            return;
        }

        recentTransactions.forEach(t => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            const isIncome = t.type === 'income';
            
            li.innerHTML = `
                <span class="description">${t.description}</span>
                <span class="amount ${t.type}">${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}</span>
            `;
            transactionListEl.appendChild(li);
        });
    }

    // ======================================================================
    // === HÀM createChart ĐÃ ĐƯỢC THAY THẾ BẰNG PHIÊN BẢN NÂNG CẤP MỚI ===
    // ======================================================================
    function createChart(data) {
        // Hủy biểu đồ cũ nếu nó đã tồn tại để tránh lỗi
        if (mainChart) {
            mainChart.destroy();
        }

        const ctx = chartCanvas.getContext('2d');

        // Tạo hiệu ứng Gradient cho vùng tô dưới đường line
        const incomeGradient = ctx.createLinearGradient(0, 0, 0, chartCanvas.clientHeight);
        incomeGradient.addColorStop(0, 'rgba(40, 167, 69, 0.4)'); // --income-color với độ trong suốt
        incomeGradient.addColorStop(1, 'rgba(40, 167, 69, 0)');

        const expenseGradient = ctx.createLinearGradient(0, 0, 0, chartCanvas.clientHeight);
        expenseGradient.addColorStop(0, 'rgba(220, 53, 69, 0.4)'); // --expense-color với độ trong suốt
        expenseGradient.addColorStop(1, 'rgba(220, 53, 69, 0)');

        mainChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Thu Nhập',
                        data: data.income,
                        borderColor: 'var(--income-color)',
                        backgroundColor: incomeGradient, // Sử dụng gradient
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'var(--income-color)',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 7,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'var(--income-color)',
                    },
                    {
                        label: 'Chi Tiêu',
                        data: data.expense,
                        borderColor: 'var(--expense-color)',
                        backgroundColor: expenseGradient, // Sử dụng gradient
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'var(--expense-color)',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 7,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'var(--expense-color)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: 'var(--text-secondary)',
                            font: { weight: '500' }
                        },
                        grid: { 
                            color: 'rgba(255, 255, 255, 0.1)', // Dùng màu nhạt hơn cho lưới
                            borderDash: [5, 5] // Tạo đường lưới dạng gạch nối
                        }
                    },
                    x: {
                        ticks: { 
                            color: 'var(--text-secondary)',
                            font: { weight: '500' }
                        },
                        grid: { 
                            display: false // Ẩn đường lưới dọc cho sạch sẽ
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: { 
                            color: 'var(--text-primary)',
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(26, 26, 46, 0.8)', // Nền kính mờ cho tooltip
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-secondary)',
                        titleFont: { weight: 'bold' },
                        bodyFont: { weight: '500' },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        boxPadding: 4
                    }
                }
            }
        });
    }

    // =======================================================
    // III. GẮN CÁC SỰ KIỆN (EVENT LISTENERS)
    // =======================================================
    // --- Logic cho Sidebar ---
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const page = item.getAttribute('title');
            alert(`Chuyển đến trang: ${page}. (Chức năng này đang được phát triển)`);
        });
    });

    // --- Logic cho nút Đăng xuất ---
    logoutBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            alert('Đã đăng xuất! (Chức năng này sẽ đưa bạn về trang login)');
        }
    });
    
    // --- Logic cho Modal ---
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    addBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const descriptionInput = document.getElementById('description');
        const amountInput = document.getElementById('amount');
        const dateInput = document.getElementById('date');
        const typeInput = document.querySelector('input[name="type"]:checked');

        if (!descriptionInput.value || !amountInput.value || !dateInput.value) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            description: descriptionInput.value,
            amount: +amountInput.value,
            date: dateInput.value,
            type: typeInput.value
        };

        mockData.transactions.push(newTransaction);
        init();
        
        transactionForm.reset();
        closeModal();
    });


    // =======================================================
    // IV. HÀM KHỞI TẠO CHÍNH
    // =======================================================

    function init() {
        renderKPIs(mockData.transactions);
        renderTransactions(mockData.transactions);
        createChart(mockData.chartData);
    }

    // Chạy ứng dụng lần đầu khi tải trang xong
    init();
});