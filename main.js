const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;
const SerialPort = require('serialport');
const Printer = require('thermalprinter');

const path = require('path');
const url = require('url');

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({ fullscreen: true });
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'public', 'index.html'),
			protocol: 'file:',
			slashes: true,
		})
	);
	// mainWindow.webContents.openDevTools();
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (mainWindow === null) createWindow();
});

// messages from the front
const serialPort = new SerialPort('/dev/ttyUSB0', { baudrate: 19200 });
const first = ['p', 'w', 'o'];
const second = ['p', 'o', 'w'];
const last = ['w', 'p', 'o'];

const opts = {
	maxPrintingDots: 10,
	heatingTime: 100,
	heatingInterval: 3,
	commandDelay: 3,
};

const p = path.join(__dirname, 'public', 'img', 'p.rotated.resized.png');
const o = path.join(__dirname, 'public', 'img', 'o.rotated.resized.png');
const w = path.join(__dirname, 'public', 'img', 'w.rotated.resized.png');

const printLetter = (printer, arg) => {
	switch (arg) {
		case 'p':
			printer.printImage(p);
			break;
		case 'o':
			printer.printImage(o);
			break;
		case 'w':
			printer.printImage(w);
			break;
		default:
			break;
	}
};

serialPort.on('open', () => {
	const printer = new Printer(serialPort, opts);
	printer.on('ready', () => {
		console.log('ready');
		setTimeout(() => {
			mainWindow.webContents.send('spin');
		}, 2000);
		ipcMain.on('result', (event, arg) => {
			printer.lineFeed(3);
			printer.center();
			printer.big();
			printer.printLine('http://pow.cool');
			printer.lineFeed(1);
			printLetter(printer, first[arg.first]);
			printer.lineFeed(1);
			printLetter(printer, second[arg.second]);
			printer.lineFeed(1);
			printLetter(printer, last[arg.last]);
			printer.lineFeed(1);
			printer.printLine('coucou@pow.cool');
			printer.lineFeed(3);
			printer.print(() => {
				console.log('done');
				event.sender.send('ok');
			});
			console.log(first[arg.first], second[arg.second], last[arg.last]);
		});
	});
});
