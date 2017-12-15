
function min(arr) {
    if (typeof arr !== 'array') arr = arguments;
    return Math.min.apply(null, arr);
}

function max(arr) {
    if (typeof arr !== 'array') arr = arguments;
    return Math.max.apply(null, arr);
}

function median(values) {
    values.sort(function (a, b) {
        return a - b;
    });

    if (values.length === 0) return 0

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
}

function average(values) {
    var sum = values.reduce(function (a, b) {
        return a + b;
    });
    if (sum === 0 || values.length === 0) return 0;
    return sum / values.length;
}


function qRed(pixel) {
    return pixel[0];
}

function qGreen(pixel) {
    return pixel[1];
}

function qBlue(pixel) {
    return pixel[2];
}

function qAlfa(pixel) {
    return pixel[3];
}

function qRgba(r, g, b, a) {
    return [
        parseInt(r, 10), parseInt(g, 10), parseInt(b, 10), a ? parseInt(a, 10) : 255
    ]
}

class AuxImage {
    constructor(imageData) {
        this.imageData = imageData;
    }

    pixel(x, y) {
        var i = x + (y * this.imageData.width);
        return [
            this.imageData.data[i * 4], //R
            this.imageData.data[i * 4 + 1], //G
            this.imageData.data[i * 4 + 2], //B   
            this.imageData.data[i * 4 + 3], //A  
        ];
    }

    setPixel(x, y, pixel) {
        var i = x + (y * this.imageData.width);
        this.imageData.data[i * 4] = pixel[0];//R
        this.imageData.data[i * 4 + 1] = pixel[1]; //G
        this.imageData.data[i * 4 + 2] = pixel[2]; //B  
        this.imageData.data[i * 4 + 3] = pixel[3]; //A
    }

    getData() {
        return this.imageData;
    }
}