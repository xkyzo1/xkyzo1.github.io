// Fungsi untuk menghasilkan data candlestick acak
function generateCandlestickData(days = 30) {
    const data = [];
    let basePrice = 9450; // Harga dasar BBCA
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const open = basePrice * (1 + (Math.random() - 0.5) * 0.02);
        const high = open * (1 + Math.random() * 0.015);
        const low = open * (1 - Math.random() * 0.015);
        const close = (high + low) / 2;
        
        basePrice = close;
        
        data.push({
            time: date.getTime() / 1000,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: Math.floor(Math.random() * 1000000)
        });
    }
    return data;
}

// Inisialisasi chart
const chartContainer = document.getElementById('chart');
const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: 400,
    layout: {
        backgroundColor: '#2d2d2d',
        textColor: '#d1d4dc',
    },
    grid: {
        vertLines: {
            color: 'rgba(42, 46, 57, 0.5)',
        },
        horzLines: {
            color: 'rgba(42, 46, 57, 0.5)',
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
    },
    rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
    },
    timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
    },
});

// Menambahkan candlestick series
const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#00c853',
    downColor: '#ff3d00',
    borderDownColor: '#ff3d00',
    borderUpColor: '#00c853',
    wickDownColor: '#ff3d00',
    wickUpColor: '#00c853',
});

// Menambahkan volume series
const volumeSeries = chart.addHistogramSeries({
    color: '#26a69a',
    priceFormat: {
        type: 'volume',
    },
    priceScaleId: '',
    scaleMargins: {
        top: 0.8,
        bottom: 0,
    },
});

// Set data awal
const initialData = generateCandlestickData();
candlestickSeries.setData(initialData);

// Event listener untuk responsive chart
window.addEventListener('resize', () => {
    chart.applyOptions({
        width: chartContainer.clientWidth,
    });
});

// Event listener untuk tombol interval waktu
document.querySelectorAll('.time-button').forEach(button => {
    button.addEventListener('click', () => {
        // Hapus kelas active dari semua tombol
        document.querySelectorAll('.time-button').forEach(btn => btn.classList.remove('active'));
        // Tambah kelas active ke tombol yang diklik
        button.classList.add('active');
        
        // Generate data baru berdasarkan interval
        const interval = button.dataset.interval;
        let days;
        switch(interval) {
            case '1D': days = 1; break;
            case '1W': days = 7; break;
            case '1M': days = 30; break;
            case '3M': days = 90; break;
            case '1Y': days = 365; break;
            case 'ALL': days = 730; break;
            default: days = 30;
        }
        
        const newData = generateCandlestickData(days);
        candlestickSeries.setData(newData);
    });
});

// Fungsi untuk update harga total
function updateTotalValue() {
    const quantity = document.getElementById('quantity').value;
    const price = parseFloat(document.getElementById('market-price').textContent.replace('Rp ', '').replace(',', ''));
    const total = quantity * price * 100; // 1 lot = 100 lembar saham
    document.getElementById('total-value').textContent = `Rp ${total.toLocaleString()}`;
}

// Event listener untuk input quantity
document.getElementById('quantity').addEventListener('input', updateTotalValue);

// Fungsi untuk eksekusi trading
function executeTrade(type) {
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('market-price').textContent;
    const total = document.getElementById('total-value').textContent;
    
    alert(`${type.toUpperCase()} Order:
Quantity: ${quantity} lot
Price: ${price}
Total: ${total}`);
}

// Event listener untuk item yang bisa diklik
document.querySelectorAll('.clickable').forEach(item => {
    item.addEventListener('click', () => {
        const symbol = item.dataset.symbol;
        document.getElementById('selected-symbol').textContent = symbol;
        
        // Update chart dengan data baru
        const newData = generateCandlestickData();
        candlestickSeries.setData(newData);
        
        // Update harga di trading card
        const price = item.querySelector('.price').textContent;
        document.getElementById('market-price').textContent = price;
        updateTotalValue();
    });
});
