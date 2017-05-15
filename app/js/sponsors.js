var electron = eRequire('electron').remote;
const storage = eRequire('electron-json-storage');
const ko = eRequire('knockout');
const fs = eRequire('fs');
const path = eRequire('path');

const $ = jQuery = require('jquery');
const boostrap = require('bootstrap');

var dialog = electron.dialog;
var app = electron.app;
var nativeImage = electron.NativeImage;

$(function () {

    var my = {};

    my.Sponsor = function (data) {
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.image = data.image;
        this.numbers = data.numbers;
    };

    // The view model is an abstract description of the state of the UI, but without any knowledge of the UI technology (HTML)
    my.vm = function () {
        var self = this;

        self.title = ko.observable(),
            self.subtitle = ko.observable(),
            self.image = ko.observable(),
            self.numbers = ko.observable(),
            self.sponsors = ko.observableArray([]);

        return {
            title: title,
            subtitle: subtitle,
            image: image,
            numbers: numbers,
            sponsors: sponsors
        };

    }();

    ko.applyBindings(my.vm);

    storage.getMany(['sponsors', 'numbers'], function (error, data) {
        if (error) throw error;

        if (data.sponsors) {
            $.each(data.sponsors, function (i, item) {
                var sponsor = {
                    title: item.title,
                    subtitle: item.subtitle,
                    image: 'file://' + app.getPath('userData') + '\\storage\\' + item.image,
                    numbers: item.numbers
                }
                my.vm.sponsors.push(new my.Sponsor(sponsor));
            });
        }
    });

    $('#list').click(function (event) {
        event.preventDefault();
        $('#products .item').addClass('list-group-item');
    });

    $('#grid').click(function (event) {
        event.preventDefault();
        $('#products .item').removeClass('list-group-item');
        $('#products .item').addClass('grid-group-item');
    });

    $('#btnOpenDialog').click(function (e) {
        e.preventDefault();

        dialog.showOpenDialog({
            properties: ['openFile']
        },
            function (filename) {
                $('#txtBoxImage').val(filename.toString());
            }
        );
    });

    $('#myModal').on('shown.bs.modal', function () {
        setTimeout(function () {
            $('#txtBoxTitle').focus().select();
        }, 200);
    });

    // storage.getMany(['numbers', 'sponsors'], function (error, data) {
    //     if (error) throw error;

    //     if (data.sponsors) {
    //         sponsorsData = data.sponsors;
    //     }
    // });

    $('#btnSave').click(function (e) {
        e.preventDefault();

        var arrNumbers = $('#txtBoxNumbers').val();

        var sponsor = {
            title: $('#txtBoxTitle').val(),
            subtitle: $('#txtBoxSubtitle').val(),
            image: $('#txtBoxImage').val().replace(/^.*[\\\/]/, ''),
            numbers: arrNumbers.split(",").map(function (arrNumbers) {
                return Number(arrNumbers);
            })
        }

        var content = fs.readFileSync($('#txtBoxImage').val(), 'base64');

        fs.writeFile(app.getPath('userData') + '\\storage\\' + $('#txtBoxImage').val().replace(/^.*[\\\/]/, ''),
            content, 'base64',
            function (err) {
                console.log(err);
            });

        if (content.length) {
            if (fs.existsSync(app.getPath('userData') + '\\storage\\' + $('#txtBoxImage').val().replace(/^.*[\\\/]/, ''))) {

                // storage.set('sponsors', my.vm.sponsors(), function (error) {
                //     if (error) throw error;
                // });

                sponsor.image = 'file://' + app.getPath('userData') + '\\storage\\' + $('#txtBoxImage').val().replace(/^.*[\\\/]/, '');
                my.vm.sponsors.push(new my.Sponsor(sponsor));

            }
        } else {
            my.vm.sponsors.push(new my.Sponsor(sponsor));
        }

        var teste = '';
    });

}());