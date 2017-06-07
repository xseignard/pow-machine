const ipcRenderer = require('electron').ipcRenderer;

$(document).ready(() => {
	let canSpin = true;
	let count = 0;
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
		console.log(count);
		if (count === 2) {
			first.setRandomize(0);
			second.setRandomize(1);
			last.setRandomize(0);
			count = 0;
		} else {
			first.setRandomize(randomInt(0, 2));
			second.setRandomize(randomInt(0, 2));
			last.setRandomize(randomInt(0, 2));
			count++;
		}
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
		console.log('ok');
		canSpin = true;
	});

	ipcRenderer.on('spin', () => {
		if (canSpin) {
			console.log('spin!!!');
			spin();
			setTimeout(() => {
				stop();
			}, 2000);
		}
	});
});
