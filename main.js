const electron = require('electron')
const protocol = electron.protocol;
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')


protocol.registerStandardSchemes(['custom'], {secure:true});

// Custom protocol that maps to localhost
const registerCustomProtocol = () => {
  protocol.registerHttpProtocol( 'custom', (req, cb) => {
    const parsed = url.parse(req.url);

    if (!parsed.host) { return; }

    const path = parsed.pathname;
    const port = parsed.port;
    const newUrl = `http://localhost:${port}${path}`;

    cb({ url: newUrl });
  });
};

app.on('gpu-process-crashed', e=> console.log('crasssh', e))

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})
  registerCustomProtocol();

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // essentially the same request works fine...
  // mainWindow.loadURL( 'http://localhost:8888')


  mainWindow.loadURL( 'custom://p:8888')

  let filter = {
      urls: ['http://*/*', 'https://*/*' ]

    }


    mainWindow.webContents.session.webRequest.onHeadersReceived(filter, (details, cb ) =>
    {
      let responseHeaders = Object.assign( {}, details.responseHeaders  )

         console.log("Headers received:", responseHeaders);

		// alternatively delete AccessControAllowOrigin to prevent crash
		//   delete responseHeaders['Access-Control-Allow-Origin'];
      cb( { responseHeaders } )
    })


    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, cb) =>
	{
		let requestHeaders = Object.assign( {}, details.requestHeaders  )

		console.log("Headers sent: ", requestHeaders);

		// uncomment and webview/window does not crash.
		// delete requestHeaders.Origin;

		cb({ requestHeaders })
	})


}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
