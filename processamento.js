
var niveisCinzaChart = null, quantizacaoCinzaChart = null;

var niveisCinzaChartCtx = null, quantiazacaoCinzaChartCtx = null;

var canvasPreviewFullCtx = null;
var canvasPreviewSmallCtx = null;

var canvasPreviewFull = null;
var canvasPreviewSmall = null;

var quantizacaoLabels = ['0-32', '32-64', '62-96', '96-128', '128-163', '163-195', '195-227', '227-255'];

$(document).ready(function(){
    niveisCinzaChartCtx = document.getElementById("niveisCinzaChart").getContext('2d');
    quantiazacaoCinzaChartCtx = document.getElementById("quantizacaoCinzaChart").getContext('2d');
    
    canvasPreviewFull = document.getElementById('canvasPreviewFull');
    canvasPreviewFullCtx = canvasPreviewFull.getContext('2d');
    
    canvasPreviewSmall = document.getElementById('canvasPreviewSmall');
    canvasPreviewSmallCtx = canvasPreviewSmall.getContext('2d');

    $("#imagemInput").change(function ($event) {
        lerImagem($event, onImagemReadCompleted);
    });

    niveisCinzaChart = inicializarChart(niveisCinzaChartCtx, 'line', [], [], 'Amostragem de Niveis de cinza');
    quantizacaoCinzaChart = inicializarChart(quantiazacaoCinzaChartCtx, 'line', [], quantizacaoLabels, 'Quantizacao de Niveis de cinza');
});

function onImagemReadCompleted(imagemData, width, height){
    var y = height / 2;
    var smallPreviewHeight = 1; // 1px
    var result = obterNiveisDeCinzaAndPreviewDaImagem(imagemData.data, width, height, y);
    var niveis = result.niveis;
    var quantizacao = result.quantizacao;
    var preview = result.preview;
    var labels = Array.apply(null, {length: width}).map(Number.call, Number);
    
    desenharImagemPreview(canvasPreviewSmallCtx, preview, width, smallPreviewHeight);
    desenharImagemPreview(canvasPreviewFullCtx, imagemData, width, height);
    
    console.log(quantizacao);

    updateData(niveisCinzaChart, labels, niveis);
    updateData(quantizacaoCinzaChart, quantizacaoLabels, quantizacao);
}

function updateData(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data = data;
    chart.update();
}


function lerImagem($event, doneCallback){
    var imgFile = $event.target.files[0],
            ctx = document.createElement("CANVAS").getContext('2d'),
            imgHtml = new Image(),
            reader = new FileReader();

        imgHtml.onload = function () {
            ctx.drawImage(imgHtml, 0, 0);
            var w = imgHtml.width;
            var h = imgHtml.height;
            var imgData = ctx.getImageData(0, 0, w, h);
            doneCallback(imgData, w, h);
        };

        reader.onloadend = function () {
            imgHtml.src = reader.result;
        };

        reader.readAsDataURL(imgFile);
}

function inicializarChart(ctx, type, data, labels, label) {
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                fill: false,
                pointRadius: 1,
                pointHoverRadius: 10,
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize : 15,
                        suggestedMin: 0,
                        suggestedMax: 255,
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Nivel de cinza'
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Pixels da Imagem'
                    }
                }]
            }
        }
    });
}

function fn_quantizacao(fator, dados){
    if(fator < 32) dados[0] = dados[0] + 1;
    if(fator >= 32 && fator < 64) dados[1] = dados[1] + 1;
    else if(fator >= 64 && fator < 96) dados[2] = dados[2] + 1;
    else if(fator >= 96 && fator < 128) dados[3] = dados[3] + 1;
    else if(fator >= 128 && fator < 163) dados[4] = dados[4] + 1;
    else if(fator >= 163 && fator < 195) dados[5] = dados[5] + 1;
    else if(fator >= 195 && fator < 227) dados[6] = dados[6] + 1;
    else dados[7] = dados[7] + 1;
}

function obterNiveisDeCinzaAndPreviewDaImagem(pixels, width, height, yCoordenada){
    var l = width * height;
    var m = yCoordenada;
    var niveis = [];
    var niveisQuanti = [0, 0, 0, 0, 0, 0, 0, 0];
    var previewData = [];

    for (var i = 0; i < l; i++) {
        // get color of pixel
        var r = pixels[i * 4]; // Red
        var g = pixels[i * 4 + 1]; // Green
        var b = pixels[i * 4 + 2]; // Blue
        var a = pixels[i * 4 + 3]; // Alpha

        // get the position of pixel
        var y = parseInt(i / width, 10);
        var x = i - y * width;

        if (y == m) {
            var factor = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            fn_quantizacao(factor, niveisQuanti);
            previewData = previewData.concat([r, g, b, a]);
            niveis.push(factor);		
        }
    }
    
    var imageData = document.createElement("CANVAS").getContext('2d').createImageData(width, 1);
    for (var i = 0; i < previewData.length; i++) imageData.data[i] = previewData[i];

    return {
        niveis: niveis,
        quantizacao: niveisQuanti,
        preview: imageData
    };
}

function desenharImagemPreview(ctx, imagemData, width, height){
    ctx.clearRect(0, 0, canvasPreviewSmall.width, canvasPreviewSmall.height);
    ctx.putImageData(imagemData, 0, 0, 0, 0, width, height);
}
