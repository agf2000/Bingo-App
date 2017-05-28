const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const storage = require('electron-json-storage');
let myAppMenu, menuTemplate;

storage.set('config', { "userPath": app.getPath('userData') }, function (error) {
    if (error) throw error;
});

app.on('window-all-closed', function () {
    app.quit();
});

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
        appWindow.show();
        // appWindow.toggleDevTools();
    });

    appWindow.on('closed', function () {
        appWindow = null;
    });

    let flashWindow = new BrowserWindow({
        width: 600,
        height: 450,
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
        }, 20000);
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
            label: 'Desfazer',
            accelerator: process.platform === 'darwin' ? 'Command+Z' : 'Ctrl+Z',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.webContents.send('undoNumber');
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
                    flashWindow.show();
                }
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

    let sponsorsWindow = null;

    function openAboutWindow() {
        if (sponsorsWindow) {
            sponsorsWindow.focus()
            return;
        }

        sponsorsWindow = new BrowserWindow({
            title: "Patrocinadores",
            minimizable: false,
            parent: appWindow,
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
                label: 'Gerenciar',
                accelerator: process.platform === 'darwin' ? 'Command+G' : 'Ctrl+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
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

    function undoNumber() {
        event.sender.send('undoNumber');
    };

    function restartApp() {
        event.sender.send('restartApp');
    };

});
