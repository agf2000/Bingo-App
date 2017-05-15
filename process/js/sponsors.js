const electron = eRequire('electron');
const $ = jQuery = eRequire('jquery');
const storage = eRequire('electron-json-storage');

$(function () {

    storage.get('sponsors', function (error, data) {
        if (error) throw error;

        console.log(data);
    });

}());