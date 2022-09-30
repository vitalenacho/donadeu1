window.onload = function() {
    moveMapToSantaFe(map);
    var ctx = document.getElementById('myChart').getContext('2d');
    var dataSet = getChartDataSaleQ({ type: 'bar', focus: 'Cantidad Vendida' });
    window.chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',
        fill: false,
        // The data for our dataset
        data: dataSet,
        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getChartDataSaleQ(input) {
    var dataProd0 = ($('#mainTable').bootstrapTable('getData').length > 0) ? $('#mainTable').bootstrapTable('getData') : window.sales;
    var prods = [];
    var detail = [];
    dataProd0.map(function(e0) {
        jsonData = JSON.parse(e0.detalle);
        jsonData.map(function(e1) {
            prods.push(e1.nombreArt);
            detail.push(e1);
        });

    });
    var dataSale = [];
    var uniqueProds = prods.filter(onlyUnique);
    var dataColors = [];
    uniqueProds.map(function(e2) {
        var filtroDet = detail.filter(det => det.nombreArt == e2);
        var cantTotal = filtroDet.reduce((total, item) => {
            total += item.cantidad;
            //console.log({ cantidad: item.cantidad, total: total });
            return total;
        }, 0);
        dataSale.push(cantTotal);
        dataColors.push(getRandomColor());
    })
    var finalDataSet = {
        labels: uniqueProds,
        datasets: [{
            label: input.focus,
            backgroundColor: dataColors,
            borderColor: "#2c2f33",
            data: dataSale,
            borderWidth: 1
        }]
    }
    return finalDataSet;
}

function getChartDataSaleTotal(input) {
    var dataProd0 = ($('#mainTable').bootstrapTable('getData').length > 0) ? $('#mainTable').bootstrapTable('getData') : window.sales;
    var fechas = [];
    var dataSet = [];
    dataProd0.map(function(e0) {
        fechas.push(e0.fecha);
        dataSet.push(e0);
    });
    var dataSale = [];
    var uniqueFechas = fechas.filter(onlyUnique);
    var dataColors = [];
    uniqueFechas.map(function(e1) {
        var filtroDate = dataSet.filter(dat => dat.fecha == e1);
        var cantTotal = filtroDate.reduce((total, item) => {
            total += item.monto;
            //console.log({ monto: item.monto, total: total })
            return total;
        }, 0);
        //console.log({ y: cantTotal, t: e1 });
        dataSale.push({ y: cantTotal, t: e1 });
        dataColors.push(getRandomColor());
    })
    var finalDataSet = {
        datasets: [{
            label: input.focus,
            backgroundColor: dataColors,
            borderColor: "#2c2f33",
            lineTension: 0,
            fill: false,
            data: dataSale,
            borderWidth: 1
        }]
    }
    return finalDataSet;
}


function displayChart(input, chart) {
    var dataSet;
    if (input.focus == 'Cantidad Vendida') {
        dataSet = getChartDataSaleQ(input);
        options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    } else if (input.focus == 'Ventas por dia') {
        dataSet = getChartDataSaleTotal(input);
        options = {
            responsive: true,
            scales: {
                xAxes: [{
                    type: 'time',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fecha'
                    },
                    time: {
                        unit: 'day'
                    },
                    ticks: {
                        major: {
                            fontStyle: 'bold',
                            fontColor: '#FF0000'
                        }
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Monto'
                    }
                }]
            }
        };
    }
    chart.options = options;
    chart.config.type = input.type
    chart.data = dataSet;
    chart.update();
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    console.log(data);
    chart.data.datasets.push(data);
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.pop()
    chart.update();
}