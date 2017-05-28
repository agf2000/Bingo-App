const electron = eRequire('electron').remote;
const storage = eRequire('electron-json-storage');
const ko = eRequire('knockout');
const fs = eRequire('fs');
const path = eRequire('path');
const uuid = eRequire('uuid/v1');

const $ = jQuery = require('jquery');
const boostrap = require('bootstrap');

const dialog = electron.dialog;
const app = electron.app;

$(function () {

    let my = {};

    let Sponsor = function (data) {
        this.id = data.id;
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.image = data.image;
        this.numbers = data.numbers;
    };

    // The view model is an abstract description of the state of the UI, but without any knowledge of the UI technology (HTML)
    let vm = function () {
        let self = this;

        self.id = ko.observable(),
        self.title = ko.observable(),
        self.subtitle = ko.observable(),
        self.image = ko.observable(),
        self.numbers = ko.observable(),
        self.sponsors = ko.observableArray([]),

        self.edit = function (item) {
            my.id = item.id;
            my.img = item.image;
            $('#txtBoxTitle').val(item.title);
            $('#txtBoxSubtitle').val(item.subtitle);
            $('#txtBoxImage').val(item.image.replace(/^.*[\\\/]/, ''));
            $('#txtBoxNumbers').val(item.numbers.toString());
            $('#myModal').modal('show');
        },

        self.removeSponsor = function (item) {
            let inItems = self.sponsors().filter(function (elem) {
                return elem.id === item.id; // find the item with the same id
            })[0];

            self.sponsors.remove(inItems);
        },

        self.remove = function (item) {
            let wf = confirm('Excluir o patrocinador ' + item.title + '?', 'Deletetar Número');
            if (wf == true) {
                if (fs.existsSync(item.image.replace('file://', ''))) {
                    fs.unlinkSync(item.image.replace('file://', ''));
                }

                self.sponsors.remove(item);

                storage.set('sponsors', self.sponsors(), function (error) {
                    if (error) throw error;
                });
            }
        };

        return {
            id: id,
            title: title,
            subtitle: subtitle,
            image: image,
            numbers: numbers,
            sponsors: sponsors,
            removeSponsor: removeSponsor
        };

    }();

    ko.applyBindings(vm);

    storage.getMany(['sponsors', 'numbers'], function (error, data) {
        if (error) throw error;

        if (!$.isEmptyObject(data.sponsors)) {
            $.each(data.sponsors, function (i, item) {
                let sponsor = {
                    id: item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    image: item.image,
                    numbers: item.numbers
                }
                vm.sponsors.push(new Sponsor(sponsor));
            });
        }
    });

    $('#btnOpenDialog').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        dialog.showOpenDialog({
            properties: ['openFile']
        },
            function (filename) {
                if (filename) {
                    $('#txtBoxImage').val(filename.toString().replace(/^.*[\\\/]/, '')).attr('title', filename.toString());
                }
            }
        );
    });

    $('#myModal').on('shown.bs.modal', function () {
        setTimeout(function () {
            $('#txtBoxTitle').focus();
        }, 200);
    });

    $('#myModal').on('hidden.bs.modal', function () {
        my.id = null;
        my.img = null;
        $('#txtBoxTitle').val('');
        $('#txtBoxSubtitle').val('');
        $('#txtBoxImage').val('');
        $('#txtBoxNumbers').val('');
    });

    $('#aRegister').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        my.id = null;
        my.img = null;
        $('#myModal').modal('show');
    });

    // storage.getMany(['numbers', 'sponsors'], function (error, data) {
    //     if (error) throw error;

    //     if (data.sponsors) {
    //         sponsorsData = data.sponsors;
    //     }
    // });

    $('#btnSave').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        let arrNumbers = $('#txtBoxNumbers').val().split(",").map(function (arrNumbers) {
            return Number(arrNumbers);
        });

        let id = '';
        if (my.id) {
            if (my.id.length) {
                id = my.id;
            } else {
                my.id = uuid();
            }
        } else {
            my.id = uuid();
        }

        let sponsor = {
            id: my.id,
            title: $('#txtBoxTitle').val(),
            subtitle: $('#txtBoxSubtitle').val(),
            image: $('#txtBoxImage').val(),
            numbers: arrNumbers
        };

        let originalfile = '';
        if (my.img) {
            if (my.img.length) {
                originalfile = my.img.replace('file://', '').replace(/^.*[\\\/]/, '');
            }
        }

        let newFile = (app.getPath('userData') + '\\storage\\' + $('#txtBoxImage').val()).replace(/^.*[\\\/]/, '');

        if (originalfile !== newFile) {
            let content = fs.readFileSync($('#txtBoxImage').attr('title'), 'base64');

            fs.writeFile(app.getPath('userData') + '\\storage\\' + $('#txtBoxImage').val(),
                content, 'base64',
                function (err) {
                    console.log(err);
                });

            if (fs.existsSync(app.getPath('userData') + '\\storage\\' + newFile)) {
                sponsor.image = 'file://' + app.getPath('userData') + '\\storage\\' + newFile;
                if (originalfile !== '') {
                    fs.unlinkSync(my.img.replace('file://', ''));
                }
            }
        } else {
            sponsor.image = 'file://' + app.getPath('userData') + '\\storage\\' + originalfile;
        }

        if (my.id) {
            if (my.id.length) {
                vm.removeSponsor(sponsor);
            }
        }

        if (originalfile !== newFile) {
            window.setTimeout(function () {
                vm.sponsors.unshift(new Sponsor(sponsor));
            }, 500);
        } else {
            vm.sponsors.unshift(new Sponsor(sponsor));
        }

        window.setTimeout(function () {
            storage.set('sponsors', vm.sponsors(), function (error) {
                if (error) throw error;
            });
        }, 3000);

        $('#myModal').modal('hide');

        my.id = null;
        my.img = null;
    });

}());