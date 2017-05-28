const { ipcRenderer, remote } = eRequire('electron');
const storage = eRequire('electron-json-storage');
// const fs = eRequire('fs');

const $ = jQuery = require('jquery');
const boostrap = require('bootstrap');

// const configData = JSON.parse(fs.readFileSync(configDataLocale));

$(function () {

    ipcRenderer.on('clearNumbers', function (event, args) {
        let wf = confirm('Deseja iniciar um novo jogo?', 'Deletetar Números');
        if (wf == true) {
            restartApp();
        }
    });

    let undoNumber = function (val) {
        let wf = confirm('Remover número ' + (val || numbersData.slice(-1).pop()) + '?', 'Deletetar Número');
        if (wf == true) {

            if (val == undefined) {
                val = parseInt(numbersData.slice(-1).pop());
            }

            let index = numbersData.indexOf(val);
            if (index > -1) {
                numbersData.splice(index, 1);
            }

            storage.remove('numbers', function (error) {
                if (error) throw error;

                storage.set('numbers', numbersData, function (error) {
                    if (error) throw error;
                });

                deselectNumber(parseInt(val));

                if (numbersData.length) {
                    $('#mainBall h2').html(numbersData.slice(-1).pop().toString()).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
                } else {
                    $('#mainBall h2').html('00');
                }

                $('#adContainer').html('');

                let bis = sponsorsData[indexOfArray(parseInt(numbersData.slice(-1).pop()), sponsorsData)];
                if (bis) {
                    $('#adContainer').append('<h1>' + bis.title + '</h1>' +
                        '<h3>' + bis.subtitle + '</h3>' +
                        '<div class="sizeControl">' +
                        '<img alt="" class="img-responsive center-block" src="' + bis.image + '">' +
                        '<div />');
                } else {
                    $('#adContainer').append('<h1>SEJA UM PATROCINADOR</h1>' +
                        '<h3>TENHA SEU LOGO AQUI</h3>' +
                        '<div class="sizeControl">' +
                        '<img alt="" class="img-responsive center-block" src="images/bingo-ball-bg_1.png">' +
                        '<div />');
                }
            });
        }
    };

    let undoMe = function (val) {
        undoNumber(parseInt(val));
    };

    ipcRenderer.on('undoNumber', function (event, args) {
        // $('#myModal').modal('show');
        undoNumber(parseInt(numbersData.slice(-1).pop()));
    });

    function eraseNumber() {
        let lastNumber = '00';
        if (!$.isEmptyObject(numbersData)) {
            if (parseInt(numbersData[0]) > 0) {
                lastNumber = parseInt(numbersData.slice(-1).pop());
            }
        }
        $('#mainBall h2').text(lastNumber).removeClass('text-red');
        if (!$('#red-dot').hasClass('hidden')) {
            $('#red-dot').addClass('hidden');
        }
        if ($('#green-dot').hasClass('hidden')) {
            $('#green-dot').removeClass('hidden');
        }
    };

    function fillNumber(num) {
        if ((num >= 48 && num <= 57) || (num >= 96 && num <= 105)) {
            if ($('#mainBall h2').hasClass('text-red')) {
                $('#mainBall h2').html($('#mainBall h2').text() + String.fromCharCode(num));
            } else {
                $('#mainBall h2').html(String.fromCharCode(num)).addClass('text-red');
            }
            if ($('#red-dot').hasClass('hidden')) {
                $('#red-dot').removeClass('hidden');
            }
            if (!$('#green-dot').hasClass('hidden')) {
                $('#green-dot').addClass('hidden');
            }
        }
    };

    function confirmNumber() {
        if (parseInt($('#mainBall h2').text()) <= 75) {
            let val = parseInt($('#mainBall h2').text());
            $('#adContainer').html('');

            let bis = sponsorsData[indexOfArray(val, sponsorsData)];
            if (bis) {
                $('#adContainer').append('<h1>' + sponsorsData[indexOfArray(val, sponsorsData)].title + '</h1>' +
                    '<h3>' + sponsorsData[indexOfArray(val, sponsorsData)].subtitle + '</h3>' +
                    '<div class="sizeControl">' +
                    '<img alt="" class="img-responsive center-block" src="' + sponsorsData[indexOfArray(val, sponsorsData)].image + '">' +
                    '<div />');
            } else {
                $('#adContainer').append('<h1>SEJA UM PATROCINADOR</h1>' +
                    '<h3>TENHA SEU LOGO AQUI</h3>' +
                    '<div class="sizeControl">' +
                    '<img alt="" class="img-responsive center-block" src="images/bingo-ball-bg_1.png">' +
                    '<div />');
            }

            numbersData.push(parseInt(val));
            storage.set('numbers', numbersData, function (error) {
                if (error) throw error;
            });

            setNumber(parseInt(val));
            $('#mainBall h2').removeClass('text-red').fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            val = 0;
            if (!$('#red-dot').hasClass('hidden')) {
                $('#red-dot').addClass('hidden');
            }
            if ($('#green-dot').hasClass('hidden')) {
                $('#green-dot').removeClass('hidden');
            }
        } else {
            let lastNumber = '00';
            if (!$.isEmptyObject(numbersData)) {
                if (parseInt(numbersData[0]) > 0) {
                    lastNumber = parseInt(numbersData.slice(-1).pop());
                }
            }
            $('#mainBall h2').text(lastNumber).removeClass('text-red');
            if (!$('#red-dot').hasClass('hidden')) {
                $('#red-dot').addClass('hidden');
            }
            if ($('#green-dot').hasClass('hidden')) {
                $('#green-dot').removeClass('hidden');
            }
        }
    }

    $(document).keypress(function (e) {
        if (e.keyCode == 45) {
            eraseNumber();
        }

        if ($('#mainBall h2').text().length <= 2) {
            fillNumber(e.keyCode);
        }

        if (e.keyCode == 13 && $('#mainBall h2').hasClass('text-red')) {
            confirmNumber();
        }
    });

    $('#aUndoLastNumber').click(function (e) {
        if (e.clientX === 0) {
            confirmNumber();
            return false;
        }
        e.preventDefault();

        undoNumber();
    });

    $('#aRestartApp').click(function (e) {
        if (e.clientX === 0) {
            confirmNumber();
            return false;
        }
        e.preventDefault();

        let wf = confirm('Deseja inciar um novo jogo?', 'Deletetar Números');
        if (wf == true) {
            restartApp();
        }
    });

    let numbersData = [];

    let totalRows = 5;
    let cellsInRow = 15;
    let nextNum = 0;

    function drawTable() {
        // get the reference for the body
        let div1 = document.getElementById('numbersTable');

        // creates a <table> element
        let tbl = document.createElement("table");

        // creating rows
        for (let r = 0; r < totalRows; r++) {
            let row = document.createElement("tr");

            // create letter cell in row
            let cellLeft = document.createElement("td");
            let leftText = '';
            switch (r) {
                case 0:
                    leftText = 'B';
                    break;
                case 1:
                    leftText = 'I';
                    break;
                case 2:
                    leftText = 'N';
                    break;
                case 3:
                    leftText = 'G';
                    break;
                case 4:
                    leftText = 'O';
                    break;
                default:
                    break;
            }
            let cellTextLeft = document.createTextNode(leftText);
            cellLeft.appendChild(cellTextLeft);
            row.appendChild(cellLeft);

            // create cells in row
            for (let c = 0; c < cellsInRow; c++) {
                let cell = document.createElement("td");

                nextNum = nextNum + 1;
                let cellNum = document.createTextNode(nextNum);
                cell.appendChild(cellNum);
                row.appendChild(cell);
            }

            let cellRight = document.createElement("td");
            let rightText = '';
            switch (r) {
                case 0:
                    rightText = 'B';
                    break;
                case 1:
                    rightText = 'I';
                    break;
                case 2:
                    rightText = 'N';
                    break;
                case 3:
                    rightText = 'G';
                    break;
                case 4:
                    rightText = 'O';
                    break;
                default:
                    break;
            }
            let cellTextRight = document.createTextNode(rightText);
            cellRight.appendChild(cellTextRight);
            row.appendChild(cellRight);

            tbl.appendChild(row); // add the row to the end of the table body
        }

        div1.appendChild(tbl); // appends <table> into <div1>

        $('table td').on("click", function () {
            e.preventDefault();

            undoMe($(this).text());
        });

        $('#adContainer').append('<h1>SEJA UM PATROCINADOR</h1>' +
            '<h3>TENHA SEU LOGO AQUI</h3>' +
            '<div class="sizeControl">' +
            '<img alt="" class="img-responsive center-block" src="images/bingo-ball-bg_1.png">' +
            '<div />');
    };

    let indexOfArray = function (val, array) {
        for (let i = 0, leni = array.length; i < leni; i++) {
            for (let j = 0, lenj = array[i].numbers.length; j < lenj; j++) {
                if (array[i].numbers[j] == parseInt(val)) return i;
            }
        }
    };

    let setNumber = function (num) {
        let elems = $('td').filter(function () {
            if (parseInt(this.textContent.trim()) === num) {
                $(this).addClass('selectedNumber');
            }
        });
    };

    let deselectNumber = function (num) {
        let elems = $('td').filter(function () {
            if (parseInt(this.textContent.trim()) === num) {
                $(this).removeClass('selectedNumber');
            }
        });
    };

    let sponsorsData = [];

    $('#btnApplyNumber').on('click', function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        let val = $('#txtBoxNumber').val();
        $('#adContainer').html('');

        let bis = sponsorsData[indexOfArray(val, sponsorsData)];
        if (bis) {
            $('#adContainer').append('<h1>' + sponsorsData[indexOfArray(val, sponsorsData)].title + '</h1>' +
                '<h3>' + sponsorsData[indexOfArray(val, sponsorsData)].subtitle + '</h3>' +
                '<div class="sizeControl">' +
                '<img alt="" class="img-responsive center-block" src="' + sponsorsData[indexOfArray(val, sponsorsData)].image + '">' +
                '<div />');
        } else {
            $('#adContainer').append('<h1>SEJA UM PATROCINADOR</h1>' +
                '<h3>TENHA SEU LOGO AQUI</h3>' +
                '<div class="sizeControl">' +
                '<img alt="" class="img-responsive center-block" src="images/bingo-ball-bg_1.png">' +
                '<div />');
        }
        $('#myModal').modal('toggle');

        numbersData.push(parseInt(val));
        storage.set('numbers', numbersData, function (error) {
            if (error) throw error;
        });

        setNumber(parseInt(val));
        $('#mainBall h2').html(val).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    });

    drawTable();

    storage.getMany(['numbers', 'sponsors', 'config'], function (error, data) {
        if (error) throw error;

        let userPath = ''; // app.getPath('userData')
        if (!$.isEmptyObject(data.config)) {
            userPath = data.config.userPath;
        }

        let lastNumber = 0;

        if (!$.isEmptyObject(data.numbers)) {
            if (parseInt(data.numbers[0]) > 0) {
                lastNumber = data.numbers.slice(-1).pop();
                $('#mainBall h2').html(lastNumber).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

                $.each(data.numbers, function (i, item) {
                    setNumber(item);
                });

                numbersData = data.numbers;

                if (!$.isEmptyObject(data.sponsors)) {
                    $('#adContainer').html('');
                    let bis = data.sponsors[indexOfArray(lastNumber, data.sponsors)];
                    if (bis) {
                        $('#adContainer').append('<h1>' + data.sponsors[indexOfArray(lastNumber, data.sponsors)].title + '</h1>' +
                            '<h3>' + data.sponsors[indexOfArray(lastNumber, data.sponsors)].subtitle + '</h3>' +
                            '<div class="sizeControl">' +
                            '<img alt="" class="img-responsive center-block" src="' + data.sponsors[indexOfArray(lastNumber, data.sponsors)].image + '">' +
                            '<div />');
                    } else {
                        $('#adContainer').append('<h1>SEJA UM PATROCINADOR</h1>' +
                            '<h3>TENHA SEU LOGO AQUI</h3>' +
                            '<div class="sizeControl">' +
                            '<img alt="" class="img-responsive center-block" src="images/bingo-ball-bg_1.png">' +
                            '<div />');
                    }
                }
            }
        }

        if (!$.isEmptyObject(data.sponsors)) {
            sponsorsData = data.sponsors;
        }
    });

    function restartApp() {
        storage.remove('numbers', function (error) {
            if (error) throw error;

            $('#mainBall h2').html('00');

            $('#adContainer').html('');
            $('#adContainer').append('<h1>SEJA UM PATROCINADOR</h1>' +
                '<h3>TENHA SEU LOGO AQUI</h3>' +
                '<div class="sizeControl">' +
                '<img alt="" class="img-responsive center-block" src="images/bingo-ball-bg_1.png">' +
                '<div />');

            numbersData = [];

            let elems = $('td').filter(function () {
                $(this).removeClass('selectedNumber');
            });
        });
    }

}());