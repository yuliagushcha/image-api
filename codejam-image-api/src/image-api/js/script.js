const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 512, 512);
ctx.imageSmoothingEnabled = false;

if (localStorage.getItem('currentColorValue') !== null) {
	let currColor = localStorage.getItem('currentColorValue');
	document.querySelector('.current').style.backgroundColor = currColor;
} 
if (localStorage.getItem('previousColorValue') !== null) {
	let prevColor = localStorage.getItem('previousColorValue');
	document.querySelector('.previous').style.backgroundColor = prevColor;
}
if (localStorage.getItem('canvas') !== null) {
	let dataURL = localStorage.getItem('canvas');
	let im = new Image();
	im.src = dataURL;

	im.onload = function () {
		ctx.drawImage(im, 0, 0);
	}
}

let currentColor = 'none';
let pencil = 'pencil';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
const colors = [];

const chooseColor = document.querySelector('#colorWell');
const choosePencil = document.querySelector('.pencil');
const choosePreviousColor = document.querySelector('.choosePreviousColor');
const chooseRedColor = document.querySelector('.chooseRedColor');
const chooseBlueColor = document.querySelector('.chooseBlueColor');

const curr = document.querySelector('.current');
const colorPreviousValue = document.querySelector('.previous');

chooseColor.addEventListener('click', () => {
  chooseColor.classList.add('highlightItem');
  choosePencil.classList.remove('highlightItem');
  currentColor = 'chooseColor';
  pencil = 'none';
});

choosePencil.addEventListener('click', () => {
  chooseColor.classList.remove('highlightItem');
  pencil = 'pencil';
  currentColor = 'none';
	
	const newCol = getComputedStyle(curr).backgroundColor;

	colors.push(newCol);
	if (colors.length === 3) {
		colors.shift(newCol);
		colorPreviousValue.style.backgroundColor = colors[0];
	}
	else if (colors.length === 2) {
		colorPreviousValue.style.backgroundColor = colors[0];
	}
	localStorage.setItem('currentColorValue', newCol);
	localStorage.setItem('previousColorValue', colorPreviousValue.style.backgroundColor);
});

const colorValue = document.querySelector('.current');

document.addEventListener('click', () => {
  if (currentColor === 'chooseColor') {
    chooseColor.addEventListener('input', updateFirst, false);
    chooseColor.addEventListener('change', updateAll, false);
    chooseColor.select();

    function updateFirst(event) {
      if (curr) {
        curr.style.backgroundColor = event.target.value;
      }
    }

    function updateAll(event) {
      document.querySelectorAll('.current').forEach((curr) => {
        curr.style.backgroundColor = event.target.value;
      });
    }
  }

  else if (pencil === 'pencil') {
    ctx.strokeStyle = colorValue.style.backgroundColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';
    ctx.lineWidth = 1;
		ctx.lineHeight = 1;

    function draw(e) {
      if (!isDrawing) return;
      ctx.beginPath();
      ctx.moveTo(lastX / 4, lastY / 4);
      ctx.lineTo(e.offsetX / 4, e.offsetY / 4);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    canvas.addEventListener('mousedown', (e) => {
			isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
		canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);

		canvas.addEventListener('mouseout', () => isDrawing = false);
		localStorage.setItem('canvas', canvas.toDataURL());
	}
});

choosePreviousColor.addEventListener('click', () => {
	const newCurrentColor = getComputedStyle(curr).backgroundColor;
	colors.unshift(newCurrentColor);
	curr.style.backgroundColor = colors[1];
	colorPreviousValue.style.backgroundColor = colors[0];
	if(colors.length === 3) {
		colors.pop();
	}
	localStorage.setItem('currentColorValue', curr.style.backgroundColor);
	localStorage.setItem('previousColorValue', colorPreviousValue.style.backgroundColor);
});

chooseRedColor.addEventListener('click', () => {
	curr.style.backgroundColor = "red";
	const newCurrentColor = getComputedStyle(curr).backgroundColor;
	colors.push(newCurrentColor);
	console.log(colors);
	console.log(colors.length);
	if (colors.length === 3) {
		colors.shift();
		colorPreviousValue.style.backgroundColor = colors[0];
	}

	localStorage.setItem('currentColorValue', newCurrentColor);
	localStorage.setItem('previousColorValue', colorPreviousValue.style.backgroundColor);
});

chooseBlueColor.addEventListener('click', () => {
	curr.style.backgroundColor = "lightskyblue";
	const newCurrentColor = getComputedStyle(curr).backgroundColor;
	colors.push(newCurrentColor);
	console.log(colors);
	console.log(colors.length);
	if (colors.length === 3) {
		colors.shift();
		colorPreviousValue.style.backgroundColor = colors[0];
	}

	localStorage.setItem('currentColorValue', newCurrentColor);
	localStorage.setItem('previousColorValue', colorPreviousValue.style.backgroundColor);
});

let loadImageButton = document.querySelector('.loadImageButton');
let searchInput = document.querySelector('.placeKeyWord');
let ratio;
let width;
let height;
let x;
let y;

loadImageButton.addEventListener('click', getLinkToImage);

async function getLinkToImage() {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let search = await searchWord();
	const url = `https://api.unsplash.com/photos/random?query=${search}&client_id=e2077ad31a806c894c460aec8f81bc2af4d09c4f8104ae3177bb809faf0eac17`;
	
	function searchWord() {
		if (searchInput.value === 0) {
			return searchInput.value = 'image';
		} else {
			return searchInput.value.split(' ').join(',').trim();
		}
	}

	fetch(url)
	.then(res => res.json())
	.then(data => {
		let img = new Image();

		img.onload = function () {
			function checkSizeImage() {
				if (img.width > img.height) {
					ratio = img.width / img.height;
					width = canvas.width;
					height = width / ratio;
				} else {
					ratio = img.height / img.width;
					height = canvas.height;
					width = height / ratio;
				}
			}

			function alignCenter() {
				x = canvas.width / 2 - width / 2;
				y = canvas.height / 2 - height / 2;
			}

			function drawImg(img, x, y, w, h) {
				ctx.drawImage(img, x, y, w, h);
			}

			checkSizeImage();
			alignCenter();
			drawImg(img, x, y, width, height);
		};
		img.src = data.urls.small;
		img.crossOrigin = "Anonymous";

		localStorage.setItem('canvas', canvas.toDataURL());
	})
}

let grayscale = document.querySelector('.blackAndWhiteImageButton');

grayscale.addEventListener('click', () => {
	const ctx = canvas.getContext('2d');
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imageData.data;
	let i = data.length / 2;
	if((data[i] === 255) && (data[i+10] === 255) && (data[i-10] === 255)) {
		alert('Firstly, first you need to upload an image!');
	} else {
			for (let i = 0; i < data.length; i += 4) {
				let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
				data[i]     = avg; // red
				data[i + 1] = avg; // green
				data[i + 2] = avg; // blue
			}
			ctx.putImageData(imageData, 0, 0);
	}
	localStorage.setItem('canvas', canvas.toDataURL());
});