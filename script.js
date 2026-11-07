const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const btnComplete = document.getElementById('btn-complete');
const btnIncomplete = document.getElementById('btn-incomplete');
const btnNext = document.getElementById('btn-next');
const feedbackDiv = document.getElementById('feedback');
const scoreCorrectEl = document.getElementById('score-correct');
const scoreIncorrectEl = document.getElementById('score-incorrect');
const themeToggle = document.getElementById('theme-toggle');

let isCurrentTreeComplete = false;
let scores = { correct: 0, incorrect: 0 };
let currentPositions = [];
let currentValues = [];

// Coordenadas hasta nivel 4
const coords = {
    0: {x: 300, y: 40},
    1: {x: 150, y: 110},   2: {x: 450, y: 110},
    3: {x: 75,  y: 180},   4: {x: 225, y: 180},   5: {x: 375, y: 180},   6: {x: 525, y: 180},
    7: {x: 37,  y: 260},   8: {x: 112, y: 260},   9: {x: 187, y: 260},  10: {x: 262, y: 260},
   11: {x: 337, y: 260},  12: {x: 412, y: 260},  13: {x: 487, y: 260},  14: {x: 562, y: 260}
};

// Alternar Modo Oscuro
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if(document.body.classList.contains('dark-theme')){
        themeToggle.textContent = '☀️ Modo Claro';
    } else {
        themeToggle.textContent = '🌙 Modo Oscuro';
    }
    // Redibujar para que las líneas cambien de color inmediatamente
    if(currentPositions.length > 0) drawTree(currentPositions, currentValues);
});

// Iniciar el juego
generateNewTree();

btnComplete.addEventListener('click', () => checkAnswer(true));
btnIncomplete.addEventListener('click', () => checkAnswer(false));
btnNext.addEventListener('click', generateNewTree);

function generateNewTree() {
    resetUI();
    isCurrentTreeComplete = Math.random() < 0.5;
    const numNodes = Math.floor(Math.random() * 5) + 6; 
    
    currentPositions = getTreePositions(numNodes, isCurrentTreeComplete);
    currentValues = assignBSTValues(currentPositions); // Asignar valores estilo BST
    
    drawTree(currentPositions, currentValues);
}

// Generar las posiciones de los nodos
function getTreePositions(n, makeComplete) {
    if (makeComplete) {
        let pos = [];
        for (let i = 0; i < n; i++) pos.push(i);
        return pos;
    } else {
        let posArray;
        let isCompleteByAccident = true;
        while (isCompleteByAccident) {
            let posSet = new Set([0]);
            let attempts = 0;
            while (posSet.size < n && attempts < 1000) {
                let currentNodes = Array.from(posSet);
                let parent = currentNodes[Math.floor(Math.random() * currentNodes.length)];
                let child = Math.random() < 0.5 ? (2 * parent + 1) : (2 * parent + 2);
                if (child < 15 && !posSet.has(child)) posSet.add(child);
                attempts++;
            }
            let maxIndex = Math.max(...Array.from(posSet));
            if (maxIndex !== n - 1) isCompleteByAccident = false; 
            posArray = Array.from(posSet).sort((a, b) => a - b);
        }
        return posArray;
    }
}

// 🌟 NUEVO: Lógica para que los números sigan la regla (Menores a la Izquierda, Mayores a la Derecha)
function assignBSTValues(positions) {
    // 1. Recorrido In-Order (Izquierda -> Raíz -> Derecha) para saber el orden de los nodos
    const inOrderNodes = [];
    function traverse(nodeIndex) {
        if (!positions.includes(nodeIndex)) return;
        traverse(2 * nodeIndex + 1); // Subárbol Izquierdo
        inOrderNodes.push(nodeIndex); // Nodo actual
        traverse(2 * nodeIndex + 2); // Subárbol Derecho
    }
    traverse(0); // Empezar por la raíz

    // 2. Generar números aleatorios únicos
    const randomSet = new Set();
    while(randomSet.size < positions.length) {
        randomSet.add(Math.floor(Math.random() * 500) + 1);
    }
    // 3. Ordenarlos de menor a mayor
    const sortedNumbers = Array.from(randomSet).sort((a, b) => a - b);

    // 4. Mapear los números ordenados al recorrido In-Order
    const valueMap = {};
    for(let i = 0; i < inOrderNodes.length; i++) {
        valueMap[inOrderNodes[i]] = sortedNumbers[i];
    }

    // 5. Devolver los valores en el mismo orden que el arreglo original de 'positions'
    return positions.map(pos => valueMap[pos]);
}

function drawTree(positions, values) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Obtener el color de la línea desde CSS según el modo (Claro/Oscuro)
    const lineColor = getComputedStyle(document.body).getPropertyValue('--line-color').trim() || '#7f8c8d';

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    positions.forEach(pos => {
        if (pos > 0) {
            let parent = Math.floor((pos - 1) / 2);
            if (positions.includes(parent)) { 
                ctx.beginPath();
                ctx.moveTo(coords[parent].x, coords[parent].y);
                ctx.lineTo(coords[pos].x, coords[pos].y);
                ctx.stroke();
            }
        }
    });

    positions.forEach((pos, index) => {
        const {x, y} = coords[pos];
        
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#2ecc71'; 
        ctx.fill();
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Nunito, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(values[index], x, y);
    });
}

function checkAnswer(userAnswer) {
    btnComplete.disabled = true;
    btnIncomplete.disabled = true;
    
    feedbackDiv.classList.remove('hidden', 'success', 'error');
    
    if (userAnswer === isCurrentTreeComplete) {
        feedbackDiv.textContent = "¡Correcto! 🎉 " + 
            (isCurrentTreeComplete ? "Todos los niveles están llenos hacia la izquierda sin dejar huecos." : "El árbol tiene huecos intermedios o a la izquierda en su último nivel.");
        feedbackDiv.classList.add('success');
        scores.correct++;
        scoreCorrectEl.textContent = scores.correct;
    } else {
        feedbackDiv.textContent = "¡Incorrecto! ❌ " + 
            (isCurrentTreeComplete ? "Este árbol SÍ es completo. Fíjate que no hay huecos, están alineados a la izquierda." : "Este árbol NO es completo por que tiene huecos que rompen la regla.");
        feedbackDiv.classList.add('error');
        scores.incorrect++;
        scoreIncorrectEl.textContent = scores.incorrect;
    }
    
    btnNext.classList.remove('hidden');
}

function resetUI() {
    btnComplete.disabled = false;
    btnIncomplete.disabled = false;
    feedbackDiv.classList.add('hidden');
    feedbackDiv.classList.remove('success', 'error');
    btnNext.classList.add('hidden');
}