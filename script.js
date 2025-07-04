// -- Data Dummy Price dan Chart Crypto --
const cryptoData = {
  BTC: {
    name: 'Bitcoin',
    price: 67500,
    change: 2.1,
    changePositive: true,
    currency: '$',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    decimals: 2
  },
  ETH: {
    name: 'Ethereum',
    price: 3470,
    change: -1.2,
    changePositive: false,
    currency: '$',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    decimals: 2
  },
  SOL: {
    name: 'Solana',
    price: 146.2,
    change: 4.8,
    changePositive: true,
    currency: '$',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    decimals: 2
  }
};

// Generate random OHLC for chart
function generateCandlestickData(basePrice, days = 30, decimals = 2) {
  const data = [];
  let price = basePrice;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const open = +(price * (1 + (Math.random() - 0.5) * 0.03)).toFixed(decimals);
    let high = +(open * (1 + Math.random() * 0.02)).toFixed(decimals);
    let low = +(open * (1 - Math.random() * 0.02)).toFixed(decimals);
    if (low > high) [low, high] = [high, low];
    const close = +(low + Math.random() * (high - low)).toFixed(decimals);
    price = close;
    data.push({
      time: Math.floor(date.getTime() / 1000),
      open, high, low, close
    });
  }
  return data;
}

// Chart
let chart, candlestickSeries;
function initChart(symbol, interval = '1M') {
  const chartContainer = document.getElementById('chart');
  chartContainer.innerHTML = '';
  chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.offsetWidth,
    height: chartContainer.offsetHeight,
    layout: { background: { color: '#232834' }, textColor: '#fff' },
    grid: { vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.3)' } },
    crosshair: { mode: 0 },
    rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.4)' },
    timeScale: { borderColor: 'rgba(197, 203, 206, 0.4)' }
  });
  candlestickSeries = chart.addCandlestickSeries({
    upColor: '#00e284', downColor: '#ff3d00',
    borderUpColor: '#00e284', borderDownColor: '#ff3d00',
    wickUpColor: '#00e284', wickDownColor: '#ff3d00'
  });
  updateChartData(symbol, interval);
}
function updateChartData(symbol, interval) {
  let days;
  switch(interval) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '3M': days = 90; break;
    case '1Y': days = 365; break;
    default: days = 30;
  }
  const base = cryptoData[symbol].price;
  const dec = cryptoData[symbol].decimals;
  candlestickSeries.setData(generateCandlestickData(base, days, dec));
}

// UI & Interaksi
let selectedSymbol = 'BTC';
let selectedInterval = '1M';

function updateUI(symbol) {
  const data = cryptoData[symbol];
  document.getElementById('selected-symbol').textContent = symbol;
  document.getElementById('current-price').textContent = data.currency + data.price.toLocaleString();
  document.getElementById('market-price').textContent = data.currency + data.price.toLocaleString();
  document.getElementById('current-change').textContent = (data.change > 0 ? '+' : '') + data.change + '%';
  document.getElementById('current-change').className = 'price-change ' + (data.change > 0 ? 'increase' : 'decrease');
  document.querySelectorAll('.ticker-item, .watchlist-item').forEach(item=>{
    item.classList.remove('active');
    if(item.getAttribute('data-symbol') === symbol) item.classList.add('active');
  });
  updateTotalValue();
}

function updateTotalValue() {
  const qty = parseFloat(document.getElementById('quantity').value);
  const price = cryptoData[selectedSymbol].price;
  const currency = cryptoData[selectedSymbol].currency;
  const total = qty * price;
  document.getElementById('total-value').textContent = currency + total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:8});
}

// Toast
function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = color || "#232834f2";
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1800);
}

// Event: pilih crypto di ticker/watchlist
document.querySelectorAll('.ticker-item, .watchlist-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    const symbol = item.getAttribute('data-symbol');
    selectedSymbol = symbol;
    updateUI(symbol);
    updateChartData(symbol, selectedInterval);
  });
});

// Event: interval chart
document.querySelectorAll('.time-button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.time-button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedInterval = btn.getAttribute('data-interval');
    updateChartData(selectedSymbol, selectedInterval);
  });
});

// Event: input amount
document.getElementById('quantity').addEventListener('input', updateTotalValue);

// Event: Buy/Sell
document.getElementById('buy-btn').onclick = ()=> {
  const qty = document.getElementById('quantity').value;
  showToast(`Buy ${qty} ${selectedSymbol} success!`, "#00e284");
}
document.getElementById('sell-btn').onclick = ()=> {
  const qty = document.getElementById('quantity').value;
  showToast(`Sell ${qty} ${selectedSymbol} success!`, "#ff3d00");
}

// Responsive: Chart resize
window.addEventListener('resize', ()=>{
  if(chart) {
    chart.applyOptions({ width: document.getElementById('chart').offsetWidth });
  }
});

// Inisialisasi awal
window.onload = ()=>{
  initChart(selectedSymbol, selectedInterval);
  updateUI(selectedSymbol);
};
