const ipcRenderer = require('electron').ipcRenderer;

$(document).ready(() => {
	let canSpin = true;
	const randomInt = (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	const first = $('#first').slotMachine();
	const second = $('#second').slotMachine();
	const last = $('#last').slotMachine();

	const spin = () => {
		canSpin = false;
		first.shuffle();
		second.shuffle();
		last.shuffle();
	};

	const stop = () => {
		first.stop();
		setTimeout(() => {
			second.stop();
		}, 500);
		setTimeout(() => {
			last.stop();
			const win = first.active === 0 && second.active === 1 && last.active === 0;
			ipcRenderer.send('result', {
				first: first.active,
				second: second.active,
				last: last.active,
			});
		}, 1000);
	};

	ipcRenderer.on('ok', () => {
		canSpin = true;
	});

	ipcRenderer.on('spin', () => {
		if (canSpin) {
			spin();
			setTimeout(() => {
				stop();
			}, 2000);
		}
	});
});
