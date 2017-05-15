const { app, BrowserWindow, Menu, ipcMain } = require('electron');
var myAppMenu, menuTemplate;

app.on('ready', function () {

    let appWindow = new BrowserWindow({
        width: 1070,
        height: 750,
        show: false,
        // resizable: false,
        autoHideMenuBar: true,
        title: 'BINGO :: Paróquia Nossa Senha das Graças'
    });

    appWindow.on('closed', () => {
        appWindow = null
    });
    appWindow.loadURL('file://' + __dirname + '/index.html');
    appWindow.once('ready-to-show', () => {
        appWindow.show()
    });

    appWindow.on('closed', function () {
        appWindow = null;
    });

    let flashWindow = new BrowserWindow({
        width: 450,
        height: 300,
        parent: appWindow,
        frame: false,
        transparent: true,
        modal: true,
        autoHideMenuBar: true,
        show: false
    });
    flashWindow.loadURL('file://' + __dirname + '/info.html')
    flashWindow.once('ready-to-show', () => {
        flashWindow.show();

        setTimeout(function () {
            flashWindow.hide();
        }, 10000);
    });

    flashWindow.on('closed', function () {
        flashWindow = null;
    });

    ipcMain.on('closeInfoWindow', function (event, args) {
        event.returnValue = '';
        flashWindow.hide();
        appWindow.focus();
    });

    menuTemplate = [{
        label: 'Aplicativo',
        submenu: [{
            label: 'Número',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+N' : 'Ctrl+Shift+N',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.webContents.send('insertNumber');
                }
            }
        },
        {
            label: 'Reinicar',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+R' : 'Ctrl+Shift+R',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.webContents.send('clearNumbers');
                }
            }
        },
        {
            role: 'togglefullscreen',
            label: 'Tela Cheia'
        },
        {
            type: 'separator'
        },
        {
            label: 'Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.toggleDevTools()
            }
        },
        {
            type: 'separator'
        },
        {
            role: 'about',
            label: 'Bingotron',
            accelerator: process.platform === 'darwin' ? 'Command+S' : 'Ctrl+S',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    const options = {
                        type: 'info',
                        title: 'Bingo Aplicativo',
                        buttons: ['Ok'],
                        message: 'Simples bingo aplicativo.'
                    }
                    electron.dialog.showMessageBox(focusedWindow, options, function () { })
                }
            }
        }
        ]
    },
    {
        label: 'Editar',
        submenu: [{
            role: 'undo',
            label: 'Desfazer'
        },
        {
            role: 'redo',
            label: 'Refazer'
        },
        {
            label: 'Recarregar',
            accelerator: 'CmdOrCtrl+R',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.reload()
            }
        }
        ]
    },
    {
        label: 'Patrocinador',
        submenu: [{
            role: 'manage',
            label: 'Gerenciar',
            accelerator: process.platform === 'darwin' ? 'Command+G' : 'Ctrl+G',
            click(item, focusedWindow) {
                if (focusedWindow) openAboutWindow();
            }
        },
        {
            role: 'insert',
            label: 'Inserir Novo',
            accelerator: process.platform === 'darwin' ? 'Command+G' : 'Ctrl+I',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.toggleDevTools()
            }
        }
        ]
    },
    {
        role: 'quit',
        label: 'Sair'
    }
    ];

    myAppMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(myAppMenu);

    var sponsorsWindow = null;

    function openAboutWindow() {
        if (sponsorsWindow) {
            sponsorsWindow.focus()
            return;
        }

        sponsorsWindow = new BrowserWindow({
            title: "Patrocinadores",
            minimizable: false,
            // autoHideMenuBar: true,
            autoHideMenuBar: true,
            fullscreenable: false
        });

        sponsorsWindow.loadURL('file://' + __dirname + '/sponsors.html');

        sponsorsMenuTemplate = [{
            label: 'Aplicativo',
            submenu: [{
                label: 'Recarregar',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen',
                label: 'Tela Cheia'
            },
            {
                type: 'separator'
            },
            {
                label: 'Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            }
            ]
        }, {
            label: 'Patrocinador',
            submenu: [{
                role: 'insert',
                label: 'Inserir Novo',
                accelerator: process.platform === 'darwin' ? 'Command+G' : 'Ctrl+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            }]
        },
        {
            role: 'close',
            label: 'Fechar'
        }
        ];

        sponsorsWindow.loadURL('file://' + __dirname + '/sponsors.html');

        sponsorsMenu = Menu.buildFromTemplate(sponsorsMenuTemplate);

        sponsorsWindow.setMenu(sponsorsMenu);

        sponsorsWindow.on('closed', function () {
            sponsorsWindow = null;
        });
    };

    function insertNumber() {
        event.sender.send('sponsors');
    };

    function openFileDialog() {
        event.sender.send('openFileDialog');
    };
});

// var browserWindow = electron.BrowserWindow;
// var ipc = electron.ipcMain;
// var app = electron.app;

// app.on('ready', function () {
//     var appWindow, infoWindow;
//     appWindow = new browserWindow({
//         show: false
//     });
//     appWindow.loadURL('https://w1buy.com.br');

//     infoWindow = new browserWindow({
//         width: 400,
//         height: 300,
//         frame: false,
//         transparent: true
//     });

//     infoWindow.loadURL('file://' + __dirname + '/info.html');

//     appWindow.once('ready-to-show', function () {
//         setTimeout(function () {
//             infoWindow.show();
//         }, 1000);

//         setTimeout(function () {
//             infoWindow.hide();
//         }, 10000);
//     });

//     ipc.on('closeInfoWindow', function (event, args) {
//         event.returnValue = '';
//         infoWindow.hide();
//     });
// });