
var niveisCinzaChart = null, quantizacaoCinzaChart = null, histogramaEqualizerChart = null;
var niveisCinzaChartCtx = null, quantiazacaoCinzaChartCtx = null;

var canvasPreviewFullCtx = null;
var canvasPreviewSmallCtx = null;

var canvasPreviewFull = null;
var canvasPreviewSmall = null;

var canvasPreviewHistogramaEqualizerFull = null;
var canvasPreviewHistogramaEqualizerCtx = null;

var canvasPreviewResolutionFull = null;
var canvasPreviewResolutionFullCtx = null;

var quantizacaoLabels = ['0-32', '32-64', '62-96', '96-128', '128-163', '163-195', '195-227', '227-255'];

$(document).ready(function () {
    niveisCinzaChartCtx = document.getElementById("niveisCinzaChart").getContext('2d');
    quantiazacaoCinzaChartCtx = document.getElementById("quantizacaoCinzaChart").getContext('2d');
    //histogramaEqualizerChartCtx = document.getElementById("histogramaEqualizerChart").getContext('2d');

    canvasPreviewFull = document.getElementById('canvasPreviewFull');
    canvasPreviewFullCtx = canvasPreviewFull.getContext('2d');

    canvasPreviewSmall = document.getElementById('canvasPreviewSmall');
    canvasPreviewSmallCtx = canvasPreviewSmall.getContext('2d');

    canvasPreviewResolutionFull = document.getElementById('canvasPreviewResolutionFull');
    canvasPreviewResolutionFullCtx = canvasPreviewResolutionFull.getContext('2d');

    canvasPreviewHistogramaEqualizerFull = document.getElementById('canvasPreviewHistogramaEqualizerFull');
    canvasPreviewHistogramaEqualizerCtx = canvasPreviewHistogramaEqualizerFull.getContext('2d');

    $("#imagemInput").change(function ($event) {
        lerImagem($event, onImagemReadCompleted);
    });

    niveisCinzaChart = inicializarChart(niveisCinzaChartCtx, 'line', [], [], 'Amostragem de Niveis de cinza', 255);
    quantizacaoCinzaChart = inicializarChart(quantiazacaoCinzaChartCtx, 'line', [], quantizacaoLabels, 'Quantizacao de Niveis de cinza', 255);
    //histogramaEqualizerChart = inicializarChart(histogramaEqualizerChartCtx, 'bar', [], [], 'Histograma de Equalizacao', null);
});

function onImagemReadCompleted(imagemData, width, height) {
    var y = height / 2;
    var smallPreviewHeight = 1; // 1px
    var result = obterNiveisDeCinzaAndPreviewDaImagem(imagemData.data, width, height, y);
    var niveis = result.niveis;
    var quantizacao = result.quantizacao;
    var preview = result.preview;
    var labels = Array.apply(null, { length: width }).map(Number.call, Number);
    let scale = 1;
    document.getElementById("scale").textContent = 'x'+scale;
    
    desenharImagemPreview(canvasPreviewSmall, canvasPreviewSmallCtx, preview, width, smallPreviewHeight);
    desenharImagemPreview(canvasPreviewFull, canvasPreviewFullCtx, imagemData, width, height);
    //reduzirNiveisDeCinza(imagemData, 3, width, height);
    desenharImagemPreview(canvasPreviewResolutionFull, canvasPreviewResolutionFullCtx, imagemData, width, height);
    var hist = new Float32Array(256);
    equalizeHistogram(imagemData.data, null, hist);
    desenharImagemPreview(canvasPreviewHistogramaEqualizerFull, canvasPreviewHistogramaEqualizerCtx, imagemData, width, height);

    canvasPreviewFull.addEventListener("wheel", function ($event) {
        event.preventDefault();
        let delta = ($event.deltaY / 100);
        if (delta > 0) {
            scale *= 2;
        } else {
            scale /= 2;
        }

        document.getElementById("scale").textContent = 'x'+scale;
        canvasPreviewFull.height = height * scale;
        canvasPreviewFull.width = width * scale;
        desenharImagemPreview(canvasPreviewFull, canvasPreviewFullCtx, scaleImageData(canvasPreviewFullCtx, imagemData, scale), width * scale, height * scale);
    });
    
    updateData(niveisCinzaChart, labels, niveis);
    updateData(quantizacaoCinzaChart, quantizacaoLabels, quantizacao);
    //updateData(histogramaEqualizerChart, Array.from(hist.values()), Array.from(hist.keys()));
}

function scaleImageData(c, imageData, scale) {
    var scaled = c.createImageData(imageData.width * scale, imageData.height * scale);
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = [
                imageData.data[(row * imageData.width + col) * 4 + 0],
                imageData.data[(row * imageData.width + col) * 4 + 1],
                imageData.data[(row * imageData.width + col) * 4 + 2],
                imageData.data[(row * imageData.width + col) * 4 + 3]
            ];
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                for (var x = 0; x < scale; x++) {
                    var destCol = col * scale + x;
                    for (var i = 0; i < 4; i++) {
                        scaled.data[(destRow * scaled.width + destCol) * 4 + i] = sourcePixel[i];
                    }
                }
            }
        }
    }

    return scaled;
}

function updateData(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data = data;
    chart.update();
}

function lerImagem($event, doneCallback) {
    var imgFile = $event.target.files[0],
        ctx = document.createElement("CANVAS").getContext('2d'),
        imgHtml = new Image(203, 102),
        reader = new FileReader();

    imgHtml.onload = function () {
        ctx.drawImage(imgHtml, 0, 0, imgHtml.width, imgHtml.height);
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

function inicializarChart(ctx, type, data, labels, label, suggestedMax) {
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
                        stepSize: 15,
                        suggestedMin: 0,
                        suggestedMax: suggestedMax,
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

function fn_quantizacao(fator, dados) {
    if (fator < 32) dados[0] = dados[0] + 1;
    if (fator >= 32 && fator < 64) dados[1] = dados[1] + 1;
    else if (fator >= 64 && fator < 96) dados[2] = dados[2] + 1;
    else if (fator >= 96 && fator < 128) dados[3] = dados[3] + 1;
    else if (fator >= 128 && fator < 163) dados[4] = dados[4] + 1;
    else if (fator >= 163 && fator < 195) dados[5] = dados[5] + 1;
    else if (fator >= 195 && fator < 227) dados[6] = dados[6] + 1;
    else dados[7] = dados[7] + 1;
}

function obterNiveisDeCinzaAndPreviewDaImagem(pixels, width, height, yCoordenada, scaleGray) {
    if(!scaleGray) scaleGray = 1;
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
            var factor = (0.2126 * r + 0.7152 * g + 0.0722 * b) / scaleGray;
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

function reduzirNiveisDeCinza(imgData, scaleGray, width, height){
    var l = width * height;
    for (var i = 0; i < l; i++) {
        // get color of pixel
        var r = imgData.data[i * 4]; // Red
        var g = imgData.data[i * 4 + 1]; // Green
        var b = imgData.data[i * 4 + 2]; // Blue
        var a = imgData.data[i * 4 + 3]; // Alpha
        let factor = (0.2126 * r + 0.7152 * g + 0.0722 * b) / scaleGray;
        // get color of pixel
        imgData.data[i * 4] = factor; // Red
        imgData.data[i * 4 + 1] = factor; // Green
        imgData.data[i * 4 + 2] = factor; // Blue
        //imgData.data[i * 4 + 3] = factor; // Alpha
    }
}

function desenharImagemPreview(canvas, ctx, imagemData, width, height) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imagemData, 0, 0, 0, 0, width, height);
}

function equalizeHistogram(src, dst, hist, niveis) {
    var srcLength = src.length;
    if (!dst) { dst = src; }
    if(!niveis) niveis = 1;
    // Compute histogram and histogram sum:
    var sum = 0;
    for (var i = 0; i < srcLength; ++i) {
        ++hist[~~src[i]];
        ++sum;
    }

    // Compute integral histogram:
    var prev = hist[0];
    for (var i = 1; i < 256; ++i) {
        prev = hist[i] += prev;
    }
    // Equalize image:
    var norm = (255 * niveis) / sum;
    for (var i = 0; i < srcLength; ++i) {
        dst[i] = hist[~~src[i]] * norm;
    }
    return dst;
}
