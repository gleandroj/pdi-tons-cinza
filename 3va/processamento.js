var canvasPreview3x3FullCtx = null;
var canvasPreview3x3Full = null;

var canvasPreview5x5Full = null;
var canvasPreview5x5FullCtx = null;

var canvasPreview9x9Full = null;
var canvasPreview9x9FullCtx = null;

var canvasPreviewOriginalFull = null;
var canvasPreviewOriginalFullCtx = null;

var algoritimos = {
    'GAUSSIANO (Passa-baixa Linear)': gaussian,
    'Filtro de Média (Passa-baixa Linear)': meanFilter,
    'Filtro de Mediana (Passa-baixa Não Linear)': medianFilter
};

var selectedFilter = null;

var imageData = null;

function setLoading(loading, percent) {
    if (!loading) {
        $(".progress-bar").addClass("notransition");
        $("#progressbar").width('0%');
        setTimeout(function () {
            $(".progress-bar").removeClass("notransition");
        }, 10)
    }
    else {
        $("#progressbar").width(percent ? percent + '%' : '100%');
    }
}

$(document).ready(function () {

    canvasPreview3x3Full = document.getElementById('canvasPreview3x3Full');
    canvasPreview3x3FullCtx = canvasPreview3x3Full.getContext('2d');

    canvasPreview5x5Full = document.getElementById('canvasPreview5x5Full');
    canvasPreview5x5FullCtx = canvasPreview5x5Full.getContext('2d');

    canvasPreview9x9Full = document.getElementById('canvasPreview9x9Full');
    canvasPreview9x9FullCtx = canvasPreview9x9Full.getContext('2d');

    canvasPreviewOriginalFull = document.getElementById('canvasPreviewOriginalFull');
    canvasPreviewOriginalFullCtx = canvasPreviewOriginalFull.getContext('2d');

    Object.keys(algoritimos).forEach(function (key) {
        $('#filterSelect').append($('<option>',
            {
                value: key,
                text: key
            }));
    });

    $("#filterSelect").change(function ($event) {
        selectedFilter = algoritimos[$event.target.value];

        if($event.target.value !== 'Filtro de Mediana (Passa-baixa Não Linear)'){
            $("#row-2").addClass('hide');
            $("#firstText").text($event.target.value);
        }else{
            $("#row-2").removeClass('hide');
            $("#firstText").text('3x3');
        }

        if (imageData) {
            onImagemReadCompleted(imageData);
        }
    });

    $("#imagemInput").change(function ($event) {
        lerImagem($event, onImagemReadCompleted);
    });

});

function onImagemReadCompleted(imagemData) {
    if (!selectedFilter) {
        alert('Nenhum filtro selecionado');
        return;
    }

    var asyncTask = function () {
        setLoading(false);
        return new Promise(function (resolve) {
            setTimeout(function () {
                desenharImagemPreview(canvasPreviewOriginalFull, imagemData);
                setLoading(true, 25);
                desenharImagemPreview(canvasPreview3x3Full, selectedFilter(imagemData, 3));
                setLoading(true, 50);
                desenharImagemPreview(canvasPreview5x5Full, selectedFilter(imagemData, 5));
                setLoading(true, 75);
                desenharImagemPreview(canvasPreview9x9Full, selectedFilter(imagemData, 9));
                setLoading(true, 100);
                resolve();
            }, 100);
        });
    }

    asyncTask().then(function () { });
}

function lerImagem($event, doneCallback) {
    var img = new Image;

    img.onload = function () {
        var canvas = document.createElement("CANVAS");
        var context = canvas.getContext('2d');

        //  no downscaling:
        var ratio = 1.0, w = img.width, h = img.height;
        canvas.width = w;
        canvas.height = h;

        /*
        //  downscale image to fit the canvas:
        var	ratio = Math.min(1.0, canvas.width/img.width, canvas.height/img.height),
            w = Math.floor(ratio*img.width),
            h = Math.floor(ratio*img.height);
        */

        //  show image:
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, w, h);

        //  get pixel data:
        try {
            doneCallback(imageData = context.getImageData(0, 0, w, h));
        } catch (e) {
            alert(e);
            return;
        }
    };

    img.src = URL.createObjectURL($event.target.files[0]);
}

function desenharImagemPreview(canvas, imagemData) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.getContext('2d').putImageData(imagemData, 0, 0, 0, 0, imagemData.width, imagemData.height);
}

function gaussian(imageData) {
    mask = 16;
    var canvas = document.createElement("CANVAS");
    canvas.setAttribute('width', 300);
    canvas.setAttribute('height', 300);
    var auxImage = new AuxImage(imageData);
    var auxImageData = canvas.getContext('2d').createImageData(imageData.width, imageData.height);
    var outAuxImage = new AuxImage(auxImageData);

    for (var j = 1; j < imageData.height - 2; j++) {
        for (var i = 1; i < imageData.width - 2; i++) {

            var red = 4 * qRed(auxImage.pixel(i, j)) +
                2 * (qRed(auxImage.pixel(i, j - 1)) + qRed(auxImage.pixel(i, j + 1)) + qRed(auxImage.pixel(i - 1, j)) + qRed(auxImage.pixel(i + 1, j))) +
                1 * (qRed(auxImage.pixel(i - 1, j + 1)) + qRed(auxImage.pixel(i + 1, j + 1)) + qRed(auxImage.pixel(i + 1, j - 1)) + qRed(auxImage.pixel(i - 1, j - 1)));

            red = (red / mask);

            var green = 4 * qGreen(auxImage.pixel(i, j)) +
                2 * (qGreen(auxImage.pixel(i, j - 1)) + qGreen(auxImage.pixel(i, j + 1)) + qGreen(auxImage.pixel(i - 1, j)) + qGreen(auxImage.pixel(i + 1, j))) +
                1 * (qGreen(auxImage.pixel(i - 1, j + 1)) + qGreen(auxImage.pixel(i + 1, j + 1)) + qGreen(auxImage.pixel(i + 1, j - 1)) + qGreen(auxImage.pixel(i - 1, j - 1)));

            green = (green / mask);

            var blue = 4 * qBlue(auxImage.pixel(i, j)) +
                2 * (qBlue(auxImage.pixel(i, j - 1)) + qBlue(auxImage.pixel(i, j + 1)) + qBlue(auxImage.pixel(i - 1, j)) + qBlue(auxImage.pixel(i + 1, j))) +
                1 * (qBlue(auxImage.pixel(i - 1, j + 1)) + qBlue(auxImage.pixel(i + 1, j + 1)) + qBlue(auxImage.pixel(i + 1, j - 1)) + qBlue(auxImage.pixel(i - 1, j - 1)));

            blue = (blue / mask);

            outAuxImage.setPixel(i, j, qRgba(red, green, blue));
        }
    }
    return outAuxImage.getData();
}

function meanFilter(imageData, mask) {
    var canvas = document.createElement("CANVAS");
    canvas.setAttribute('width', imageData.width);
    canvas.setAttribute('height', imageData.height);
    var auxImage = new AuxImage(imageData);
    var auxImageData = canvas.getContext('2d').createImageData(imageData.width, imageData.height);
    var outAuxImage = new AuxImage(auxImageData);

    for (var j = 1; j < imageData.height - 2; j++) {
        for (var i = 1; i < imageData.width - 2; i++) {

            var red =
                qRed(auxImage.pixel(i, j)) +
                qRed(auxImage.pixel(i, j - 1)) +
                qRed(auxImage.pixel(i, j + 1)) +

                qRed(auxImage.pixel(i - 1, j)) +
                qRed(auxImage.pixel(i + 1, j)) +
                qRed(auxImage.pixel(i - 1, j + 1)) +

                qRed(auxImage.pixel(i + 1, j + 1)) +
                qRed(auxImage.pixel(i + 1, j - 1)) +
                qRed(auxImage.pixel(i - 1, j - 1));

            red = (red / 9);

            var green = qGreen(auxImage.pixel(i, j)) + qGreen(auxImage.pixel(i, j - 1)) + qGreen(auxImage.pixel(i, j + 1)) + qGreen(auxImage.pixel(i - 1, j)) + qGreen(auxImage.pixel(i + 1, j)) +
                qGreen(auxImage.pixel(i - 1, j + 1)) + qGreen(auxImage.pixel(i + 1, j + 1)) + qGreen(auxImage.pixel(i + 1, j - 1)) + qGreen(auxImage.pixel(i - 1, j - 1));

            green = (green / 9);

            var blue = qBlue(auxImage.pixel(i, j)) + qBlue(auxImage.pixel(i, j - 1)) + qBlue(auxImage.pixel(i, j + 1)) + qBlue(auxImage.pixel(i - 1, j)) + qBlue(auxImage.pixel(i + 1, j)) +
                qBlue(auxImage.pixel(i - 1, j + 1)) + qBlue(auxImage.pixel(i + 1, j + 1)) + qBlue(auxImage.pixel(i + 1, j - 1)) + qBlue(auxImage.pixel(i - 1, j - 1));

            blue = (blue / 9);

            //Define o novo valor rgb na imagem sendo filtrada.
            var rgbColor = qRgba(red, green, blue);
            outAuxImage.setPixel(i, j, rgbColor);
        }
    }
    return outAuxImage.getData();
}

function meanFilter2(imageData, mask) {
    var canvas = document.createElement("CANVAS");
    canvas.setAttribute('width', 300);
    canvas.setAttribute('height', 300);

    canvas.getContext('2d').mozImageSmoothingEnabled = true;
    canvas.getContext('2d').webkitImageSmoothingEnabled = true;
    canvas.getContext('2d').msImageSmoothingEnabled = true;
    canvas.getContext('2d').imageSmoothingEnabled = true;

    canvas.getContext('2d').putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);

    return canvas.getContext('2d').getImageData(0, 0, imageData.width, imageData.height);
}

var filterEffect = new MedianFilter();
filterEffect.mode = 'quality';
filterEffect.shape = 'rectangular';
function medianFilter(imageData, mask) {
    var canvas = document.createElement("CANVAS");
    canvas.setAttribute('width', imageData.width);
    canvas.setAttribute('height', imageData.height);
    var auxImageData = canvas.getContext('2d').createImageData(imageData.width, imageData.height);
    filterEffect.maskWidth = mask;
    filterEffect.maskHeight = mask;
    
    for (var i = 0; i < imageData.data.length; i++) auxImageData.data[i] = imageData.data[i];

    return filterEffect.convertImage(auxImageData, imageData.width, imageData.height);
}
