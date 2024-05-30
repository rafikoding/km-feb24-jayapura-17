import data from './sample.json' assert { type: 'json' };

document.addEventListener('DOMContentLoaded', () => {
  const ctxLine = document.getElementById('myChart').getContext('2d');
  const ctxBar = document.getElementById('stackedBarChart').getContext('2d');
  const storeSelect = document.getElementById('storeSelect');
  const filterButton = document.getElementById('filterButton');
  const metricSelect = document.getElementById('metricSelect');
  const totalRevenueElement = document.getElementById('totalRevenue');
  const totalTransactionsElement = document.getElementById('totalTransactions');
  let currentLineChart;
  let currentBarChart;


  // menghitung total berdasarkan toko, bulan, dan metrik
  function calculateTotalByStoreAndMonth(data, metric) {
    const stores = {
      "Astoria": Array(6).fill(0),
      "Hell's Kitchen": Array(6).fill(0),
      "Lower Manhattan": Array(6).fill(0)
    };

    data.forEach(item => {
      const store = item.store_location;
      const month = new Date(item.transaction_date).getMonth();
      const value = metric === 'total_revenue' ? parseFloat(item.sales_revenue) : parseInt(item.transaction_qty);

      if (store in stores) {
        stores[store][month] += value;
      }
    });

    return stores;
  }


   // menghitung total pendapatan dan transaksi
  function calculateTotals(data) {
    let totalRevenue = 0;
    let totalTransactions = 0;

    data.forEach(item => {
      totalRevenue += parseFloat(item.sales_revenue);
      totalTransactions += parseInt(item.transaction_qty);
    });

    return { totalRevenue, totalTransactions };
  }

  // Fungsi untuk membuat grafik stacked bar 
  function calculateCategoryTotals(data, metric) {
    const categoryTotals = {};

    data.forEach(item => {
      const category = item.product_category;
      const value = metric === 'total_revenue' ? parseFloat(item.sales_revenue) : parseInt(item.transaction_qty);

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }

      categoryTotals[category] += value;
    });

    return categoryTotals;
  }

  // Fungsi untuk membuat grafik garis  
  function createLineChart(data, metric) {
    
    // Hancurkan chart sebelumnya jika ada
    if (currentLineChart) {
      currentLineChart.destroy();
    }

    const chartData = {
      labels: ["Januari", "Februari", "Maret", "April", "Mei", "Juni"],
      datasets: [
        {
          label: "Astoria",
          data: data["Astoria"],
          borderColor: "red",
          fill: false
        },
        {
          label: "Hell's Kitchen",
          data: data["Hell's Kitchen"],
          borderColor: "blue",
          fill: false
        },
        {
          label: "Lower Manhattan",
          data: data["Lower Manhattan"],
          borderColor: "green",
          fill: false
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      title: {
        display: true,
        text: `Total ${metric === 'total_revenue' ? 'Revenue' : 'Transactions'} by Store and Month`
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Month"
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: `Total ${metric === 'total_revenue' ? 'Revenue' : 'Transactions'}`
          }
        }]
      }
    };

    // Buat chart baru
    currentLineChart = new Chart(ctxLine, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  }

  //Menghancurkan stacked bar sebelumnya 
  function createStackedBarChart(data, metric) {
    if (currentBarChart) {
      currentBarChart.destroy();
    }
    const labels = Object.keys(data);
    const values = Object.values(data);
    const total = values.reduce((sum, value) => sum + value, 0);
    const percentages = values.map(value => (value / total * 100).toFixed(2));

    const chartData = {
      labels: labels,
      datasets: [{
        label: `Total ${metric === 'total_revenue' ? 'Revenue' : 'Transactions'} (%)`,
        data: percentages,
        backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'yellow']
      }]
    };

    const chartOptions = {
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function(value) { return value + "%" }
          }
        }]
      },
      title: {
        display: true,
        text: `Percentage of ${metric === 'total_revenue' ? 'Revenue' : 'Transactions'} by Product Category`
      }
    };

  // stacked bar baru 
  currentBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: chartData,
    options: chartOptions
  });
}

  // Fungsi untuk memperbarui kotak total
  function updateTotalsBox(totals) {
    totalRevenueElement.textContent = totals.totalRevenue.toFixed(2);
    totalTransactionsElement.textContent = totals.totalTransactions;
  }

  // Load data awal
  const initialMetric = metricSelect.value;
  const initialTotalByStoreAndMonth = calculateTotalByStoreAndMonth(data, initialMetric);
  createLineChart(initialTotalByStoreAndMonth, initialMetric);
  const initialTotals = calculateTotals(data);
  updateTotalsBox(initialTotals);

  // Event listener untuk filter
  filterButton.addEventListener('click', () => {
    const selectedStore = storeSelect.value;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const metric = metricSelect.value;

     // Filter data berdasarkan toko, rentang tanggal, dan metrik
    const filteredData = data.filter(item => {
      const transactionDate = new Date(item.transaction_date);
      return (selectedStore === 'All' || item.store_location === selectedStore) &&
             (transactionDate >= startDate && transactionDate <= endDate);
    });

     // Hitung total berdasarkan toko, bulan, dan metrik
    const filteredTotal = calculateTotalByStoreAndMonth(filteredData, metric);
    const filteredTotals = calculateTotals(filteredData);
    const categoryTotals = calculateCategoryTotals(filteredData, metric);

    createLineChart(filteredTotal, metric);
    createStackedBarChart(categoryTotals, metric);
    updateTotalsBox(filteredTotals);
  });
});
