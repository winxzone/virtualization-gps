const socket = new WebSocket('ws://localhost:4001')

let satelliteData = []

// случайный цвет
function getRandomColor() {
	const letters = '0123456789ABCDEF'
	let color = '#'
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

// Объект для хранения цветов каждого спутника
const satelliteColors = {}

socket.onopen = function () {
	console.log('Соединение по WebSocket установлено')
}

socket.onmessage = function (event) {
	// Парсинг
	const message = JSON.parse(event.data)
	console.log('Получены данные:', message)

	// Вычисляем полярные координаты
	const r = Math.sqrt(message.x ** 2 + message.y ** 2)
	const theta = Math.atan2(message.y, message.x) * (180 / Math.PI) // В градусы

	if (!satelliteColors[message.id]) {
		satelliteColors[message.id] = getRandomColor()
	}

	// Добавляем новые данные в массив 
	satelliteData.push({
		r: r,
		theta: theta,
		id: message.id,
		color: satelliteColors[message.id],
	})

	updateRadar(satelliteData)
}

socket.onclose = function () {
	console.log('Соединение по WebSocket закрыто')
}

// Функция для обновления графика 
function updateRadar(data) {
	const satellites = {
		r: data.map(d => d.r), 
		theta: data.map(d => d.theta), 
		mode: 'markers', 
		type: 'scatterpolar', 
		text: data.map(d => `ID спутника: ${d.id}`), 
		marker: {
			size: 10,
			color: data.map(d => d.color), 
		},
	}

	// График
	const layout = {
		title: 'Радар спутников GPS',
		polar: {
			radialaxis: {
				title: 'Расстояние (км)', 
				range: [0, Math.max(...data.map(d => d.r))], 
			},
			angularaxis: {
				title: 'Угол (градусы)', 
				direction: 'counterclockwise', 
				rotation: 90, 
			},
		},
	}

	
	Plotly.newPlot('radar', [satellites], layout)
}
