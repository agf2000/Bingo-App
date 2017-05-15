const { app, BrowserWindow, ipcRenderer } = eRequire('electron');
const storage = eRequire('electron-json-storage');
// const fs = eRequire('fs');

const $ = jQuery = require('jquery');
const boostrap = require('bootstrap');

// const configData = JSON.parse(fs.readFileSync(configDataLocale));

ipcRenderer.on('insertNumber', function (event, message) {
    $('#myModal').modal('show');
});

ipcRenderer.on('clearNumbers', function (event, message) {
    var wf = confirm('Deseja inciar um novo jogo?', 'Deletetar Números');
    if (wf == true) {
        storage.clear(function (error) {
            if (error) throw error;

            $('#adContainer').html('');
            $('#mainBall h2').html('');
            $('#mainBallContainer').addClass('hidden');
            numbersData = [];

            var elems = $('td').filter(function () {
                $(this).removeClass('selectedNumber');
            });
        });
    }
});

$(function () {

    var numbersData = [];

    $('#myModal').modal({
        show: false
    });

    var totalRows = 5;
    var cellsInRow = 15;
    var nextNum = 0;

    function drawTable() {
        // get the reference for the body
        var div1 = document.getElementById('numbersTable');

        // creates a <table> element
        var tbl = document.createElement("table");

        // creating rows
        for (var r = 0; r < totalRows; r++) {
            var row = document.createElement("tr");

            // create letter cell in row
            var cellLeft = document.createElement("td");
            var leftText = '';
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
            var cellTextLeft = document.createTextNode(leftText);
            cellLeft.appendChild(cellTextLeft);
            row.appendChild(cellLeft);

            // create cells in row
            for (var c = 0; c < cellsInRow; c++) {
                var cell = document.createElement("td");

                nextNum = nextNum + 1;
                var cellNum = document.createTextNode(nextNum);
                cell.appendChild(cellNum);
                row.appendChild(cell);
            }

            var cellRight = document.createElement("td");
            var rightText = '';
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
            var cellTextRight = document.createTextNode(rightText);
            cellRight.appendChild(cellTextRight);
            row.appendChild(cellRight);

            tbl.appendChild(row); // add the row to the end of the table body
        }

        div1.appendChild(tbl); // appends <table> into <div1>
    };

    $('#myModal').on('shown.bs.modal', function () {
        setTimeout(function () {
            $('#txtBoxNumber').focus().select();
        }, 200);
    });

    var indexOfArray = function (val, array) {
        for (var i = 0, len = array.length; i < len; i++) {
            for (var j = 0, len = array[i].numbers.length; j < len; j++) {
                if (array[i].numbers[j] == val) return i;
            }
        }
    };

    var setNumber = function (num) {
        var elems = $('td').filter(function () {
            if (parseInt(this.textContent.trim()) === num) {
                $(this).addClass('selectedNumber');
            }
        });
    };

    var sponsorsData = [];

    $('#btnApplyNumber').on('click', function (e) {
        var val = $('#txtBoxNumber').val();
        $('#adContainer').html('');
        $('#adContainer').append('<h1>' + sponsorsData[indexOfArray(val, sponsorsData)].title +
            '</h1><h3>' + sponsorsData[indexOfArray(val, sponsorsData)].subtitle +
            '</h3><img alt="" src="images/' + sponsorsData[indexOfArray(val, sponsorsData)].image + '">');
        $('#myModal').modal('toggle');

        numbersData.push(parseInt(val));
        storage.set('numbers', numbersData, function (error) {
            if (error) throw error;
        });

        setNumber(parseInt(val));
        $('#mainBall h2').html(val);
        $('#mainBallContainer').removeClass('hidden');
    });

    drawTable();

    storage.getMany(['numbers', 'sponsors'], function (error, data) {
        if (error) throw error;

        var lastNumber = 0;

        if (data.numbers) {
            lastNumber = data.numbers.slice(-1).pop();
            $('#mainBall h2').html(lastNumber);
            $('#mainBallContainer').removeClass('hidden');

            $.each(data.numbers, function (i, item) {
                setNumber(item);
            });

            numbersData = data.numbers;

            if (data.sponsors) {
                $('#adContainer').html('');
                $('#adContainer').append('<h1>' + data.sponsors[indexOfArray(lastNumber, data.sponsors)].title +
                    '</h1><h3>' + data.sponsors[indexOfArray(lastNumber, data.sponsors)].subtitle +
                    '</h3><img alt="" src="images/' + data.sponsors[indexOfArray(lastNumber, data.sponsors)].image + '">');

                sponsorsData = data.sponsors;
            }
        }
    });

}());

