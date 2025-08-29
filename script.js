let historialAnalisis = [];
let modoActual = 'simple';

// Función recursiva original
function contarLetra(cadena, letra) {
    if (cadena.length === 0) {
        return 0;
    }
    if (cadena[0].toLowerCase() === letra.toLowerCase()) {
        return 1 + contarLetra(cadena.slice(1), letra);
    } else {
        return contarLetra(cadena.slice(1), letra);
    }
}

function switchMode(modo) {
    // Actualizar botones
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Ocultar todos los modos
    document.querySelectorAll('.mode-content').forEach(content => content.style.display = 'none');

    // Mostrar modo seleccionado
    document.getElementById(modo + '-mode').style.display = 'block';
    modoActual = modo;
}

function agregarAlHistorial(tipo, datos, resultado) {
    const analisis = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        tipo: tipo,
        datos: datos,
        resultado: resultado,
        timestamp: Date.now()
    };
    
    historialAnalisis.unshift(analisis);
    if (historialAnalisis.length > 50) historialAnalisis.pop();
    
    actualizarHistorial();
    guardarHistorialLocal();
}

function actualizarHistorial() {
    const panel = document.getElementById('panel-historial');
    
    if (historialAnalisis.length === 0) {
        panel.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">📋 No hay análisis en el historial</p>';
        return;
    }

    panel.innerHTML = historialAnalisis.map(item => `
        <div class="history-item">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 600; color: #667eea;">${item.tipo}</span>
                <span style="font-size: 0.9em; color: #666;">${item.fecha}</span>
            </div>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin: 5px 0;">
                <strong>Datos:</strong> ${JSON.stringify(item.datos).substring(0, 100)}...
            </div>
            <div style="color: #28a745; font-weight: 600;">
                <strong>Resultado:</strong> ${item.resultado}
            </div>
            <button class="btn" style="padding: 5px 15px; font-size: 12px; margin-top: 10px;" onclick="reutilizarAnalisis(${item.id})">🔄 Reutilizar</button>
        </div>
    `).join('');
}

function reutilizarAnalisis(id) {
    const analisis = historialAnalisis.find(item => item.id === id);
    if (!analisis) return;

    if (analisis.tipo === 'Búsqueda Simple') {
        switchMode('simple');
        document.getElementById('texto-simple').value = analisis.datos.texto;
        document.getElementById('caracter-simple').value = analisis.datos.caracter;
        setTimeout(() => analizarSimple(), 100);
    }
}

function analizarSimple() {
    const texto = document.getElementById('texto-simple').value;
    const caracter = document.getElementById('caracter-simple').value;
    const resultado = document.getElementById('resultado-simple');

    if (!texto.trim()) {
        mostrarResultado(resultado, "⚠️ Por favor, ingresa un texto.", "error");
        return;
    }

    if (caracter.length !== 1) {
        mostrarResultado(resultado, "⚠️ Por favor, ingresa solo un carácter.", "error");
        return;
    }

    // Mostrar loading
    resultado.innerHTML = '<div class="loading"></div> Analizando...';
    
    setTimeout(() => {
        const cantidad = contarLetra(texto, caracter);
        const porcentaje = ((cantidad / texto.length) * 100).toFixed(2);
        
        const resultadoTexto = `
            <div style="font-size: 1.5em; margin-bottom: 15px;">
                ✅ Encontradas <strong>${cantidad}</strong> ocurrencias del carácter '<strong>${caracter}</strong>'
            </div>
            <div style="font-size: 1.1em; color: #666;">
                Representa el ${porcentaje}% del texto total
            </div>
        `;

        mostrarResultado(resultado, resultadoTexto, "success");
        mostrarEstadisticasSimple(texto, caracter, cantidad);
        mostrarVisualizacion(texto, caracter);
        
        agregarAlHistorial('Búsqueda Simple', {texto: texto.substring(0, 50), caracter}, `${cantidad} ocurrencias (${porcentaje}%)`);
    }, 500);
}

function mostrarResultado(elemento, contenido, tipo) {
    elemento.innerHTML = contenido;
    elemento.className = `result-card main-result ${tipo}`;
}

function mostrarEstadisticasSimple(texto, caracter, cantidad) {
    const stats = {
        caracteres: texto.length,
        palabras: texto.trim().split(/\s+/).filter(word => word.length > 0).length,
        lineas: texto.split('\n').length,
        sinEspacios: texto.replace(/\s/g, '').length,
        porcentaje: ((cantidad / texto.length) * 100).toFixed(2)
    };

    const statsHTML = `
        <div class="stat-card">
            <div class="stat-number">${cantidad}</div>
            <div class="stat-label">Ocurrencias</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.caracteres}</div>
            <div class="stat-label">Total caracteres</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.palabras}</div>
            <div class="stat-label">Palabras</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.lineas}</div>
            <div class="stat-label">Líneas</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.porcentaje}%</div>
            <div class="stat-label">Porcentaje</div>
        </div>
    `;

    document.getElementById('stats-simple').innerHTML = statsHTML;
    document.getElementById('stats-simple').style.display = 'grid';
}

function mostrarVisualizacion(texto, caracter) {
    const resaltado = texto.replace(
        new RegExp(caracter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), // Aquí estaba incompleto, ahora funciona correctamente
        `<span style="background-color: yellow; font-weight: bold;">$&</span>`
    );
    document.getElementById('text-highlight').innerHTML = resaltado;
    document.getElementById('viz-simple').style.display = 'block';
}

function limpiarSimple() {
    document.getElementById('texto-simple').value = '';
    document.getElementById('caracter-simple').value = '';
    document.getElementById('resultado-simple').innerHTML = '🎯 Ingresa texto y un carácter para comenzar el análisis';
    document.getElementById('stats-simple').style.display = 'none';
    document.getElementById('viz-simple').style.display = 'none';
}

function contarTodosCaracteres() {
    const texto = document.getElementById('texto-simple').value;
    if (!texto.trim()) {
        mostrarResultado(document.getElementById('resultado-simple'), "⚠️ Por favor, ingresa un texto para analizar.", "error");
        return;
    }
    analizarCompleto(texto);
    switchMode('advanced');
    document.getElementById('texto-avanzado').value = texto;
}

function analizarPalabras() {
    const texto = document.getElementById('texto-simple').value;
    if (!texto.trim()) {
        mostrarResultado(document.getElementById('resultado-simple'), "⚠️ Por favor, ingresa un texto para analizar.", "error");
        return;
    }
    const palabras = texto.trim().split(/\s+/).filter(word => word.length > 0);
    const frecuencias = {};
    palabras.forEach(palabra => {
        const p = palabra.toLowerCase().replace(/[.,!?;:()]/g, '');
        frecuencias[p] = (frecuencias[p] || 0) + 1;
    });

    const palabrasOrdenadas = Object.entries(frecuencias).sort(([, a], [, b]) => b - a);

    let resultadoHTML = `
        <div style="text-align: left;">
            <p><strong>Total de palabras:</strong> ${palabras.length}</p>
            <p><strong>Palabras únicas:</strong> ${palabrasOrdenadas.length}</p>
            <br>
            <h4>Top 10 Palabras:</h4>
            <ol>
    `;
    palabrasOrdenadas.slice(0, 10).forEach(([palabra, cuenta]) => {
        resultadoHTML += `<li><strong>${palabra}</strong>: ${cuenta} veces</li>`;
    });
    resultadoHTML += `
            </ol>
        </div>
    `;
    mostrarResultado(document.getElementById('resultado-simple'), resultadoHTML, "info");
    agregarAlHistorial('Análisis de Palabras', {texto: texto.substring(0, 50)}, `Top 10 palabras: ${palabrasOrdenadas.slice(0, 3).map(p => p[0]).join(', ')}...`);
}

function analizarCompleto(textoAnalizar = null) {
    const texto = textoAnalizar || document.getElementById('texto-avanzado').value;
    const resultadoDiv = document.getElementById('resultado-avanzado');
    if (!texto.trim()) {
        mostrarResultado(resultadoDiv, "⚠️ Por favor, ingresa un texto para análisis completo.", "error");
        document.getElementById('frecuencias-viz').style.display = 'none';
        return;
    }

    resultadoDiv.innerHTML = '<div class="loading"></div> Analizando...';

    setTimeout(() => {
        const stats = {
            caracteres: texto.length,
            letras: texto.replace(/[^a-zA-Z]/g, '').length,
            numeros: texto.replace(/[^0-9]/g, '').length,
            espacios: (texto.match(/\s/g) || []).length,
            palabras: texto.trim().split(/\s+/).filter(word => word.length > 0).length,
            lineas: (texto.match(/\n/g) || []).length + 1
        };

        const resultadoHTML = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-number">${stats.caracteres}</div><div class="stat-label">Caracteres totales</div></div>
                <div class="stat-card"><div class="stat-number">${stats.letras}</div><div class="stat-label">Letras</div></div>
                <div class="stat-card"><div class="stat-number">${stats.numeros}</div><div class="stat-label">Números</div></div>
                <div class="stat-card"><div class="stat-number">${stats.palabras}</div><div class="stat-label">Palabras</div></div>
                <div class="stat-card"><div class="stat-number">${stats.lineas}</div><div class="stat-label">Líneas</div></div>
            </div>
        `;
        mostrarResultado(resultadoDiv, resultadoHTML, "success");
        agregarAlHistorial('Análisis Completo', {texto: texto.substring(0, 50)}, `Caracteres: ${stats.caracteres}, Palabras: ${stats.palabras}`);
        mostrarFrecuencias(texto);
    }, 500);
}

function mostrarFrecuencias(texto) {
    const frec = {};
    texto.toLowerCase().replace(/\s/g, '').split('').forEach(char => {
        frec[char] = (frec[char] || 0) + 1;
    });

    const frecOrdenada = Object.entries(frec).sort(([, a], [, b]) => b - a);
    const totalChars = texto.replace(/\s/g, '').length;
    const chartDiv = document.getElementById('frequency-chart');
    chartDiv.innerHTML = '';

    frecOrdenada.forEach(([char, count]) => {
        const porcentaje = (count / totalChars) * 100;
        const bar = document.createElement('div');
        bar.className = 'freq-bar';
        bar.innerHTML = `
            <span class="freq-char">${char}</span>
            <div class="freq-visual">
                <div class="freq-fill" style="width: ${porcentaje}%;"></div>
            </div>
            <span class="freq-count">${count} (${porcentaje.toFixed(1)}%)</span>
        `;
        chartDiv.appendChild(bar);
    });
    document.getElementById('frecuencias-viz').style.display = 'block';
}

function limpiarAvanzado() {
    document.getElementById('texto-avanzado').value = '';
    document.getElementById('resultado-avanzado').innerHTML = '📊 Realiza un análisis completo de tu texto';
    document.getElementById('frecuencias-viz').style.display = 'none';
}

function compararTextos() {
    const texto1 = document.getElementById('texto1').value;
    const texto2 = document.getElementById('texto2').value;
    const resultadoDiv = document.getElementById('resultado-comparacion');

    if (!texto1.trim() || !texto2.trim()) {
        mostrarResultado(resultadoDiv, "⚠️ Por favor, ingresa ambos textos para comparar.", "error");
        return;
    }
    
    resultadoDiv.innerHTML = '<div class="loading"></div> Comparando...';

    setTimeout(() => {
        const palabras1 = new Set(texto1.toLowerCase().split(/\s+/));
        const palabras2 = new Set(texto2.toLowerCase().split(/\s+/));

        const interseccion = new Set([...palabras1].filter(p => palabras2.has(p)));
        const soloTexto1 = new Set([...palabras1].filter(p => !palabras2.has(p)));
        const soloTexto2 = new Set([...palabras2].filter(p => !palabras1.has(p)));

        const resultadoHTML = `
            <div class="comparison-result">
                <h4>Similitudes:</h4>
                <p><strong>Palabras comunes (${interseccion.size}):</strong> ${[...interseccion].join(', ').substring(0, 200)}...</p>
                <h4>Diferencias:</h4>
                <p><strong>Solo en Texto 1 (${soloTexto1.size}):</strong> ${[...soloTexto1].join(', ').substring(0, 200)}...</p>
                <p><strong>Solo en Texto 2 (${soloTexto2.size}):</strong> ${[...soloTexto2].join(', ').substring(0, 200)}...</p>
            </div>
        `;
        mostrarResultado(resultadoDiv, resultadoHTML, "info");
        agregarAlHistorial('Comparación de Textos', {texto1: texto1.substring(0, 50), texto2: texto2.substring(0, 50)}, `Similitudes: ${interseccion.size}, Diferencias: ${soloTexto1.size + soloTexto2.size}`);
    }, 500);
}

function limpiarComparacion() {
    document.getElementById('texto1').value = '';
    document.getElementById('texto2').value = '';
    document.getElementById('resultado-comparacion').innerHTML = '⚖️ Compara dos textos para ver diferencias y similitudes';
}

function buscarPatrones() {
    const texto = document.getElementById('texto-patrones').value;
    const patron = document.getElementById('patron').value;
    const resultadoDiv = document.getElementById('resultado-patrones');

    if (!texto.trim() || !patron.trim()) {
        mostrarResultado(resultadoDiv, "⚠️ Por favor, ingresa texto y un patrón de búsqueda.", "error");
        return;
    }
    
    resultadoDiv.innerHTML = '<div class="loading"></div> Buscando...';

    setTimeout(() => {
        try {
            const regex = new RegExp(patron, 'g');
            const coincidencias = (texto.match(regex) || []);
            const unicas = new Set(coincidencias);
            const resultadoHTML = `
                <div class="comparison-result">
                    <h4>Resultados del Patrón "${patron}":</h4>
                    <p><strong>Total de coincidencias:</strong> ${coincidencias.length}</p>
                    <p><strong>Coincidencias únicas:</strong> ${unicas.size}</p>
                    <p><strong>Ejemplos:</strong> ${[...unicas].slice(0, 10).join(', ').substring(0, 200)}...</p>
                </div>
            `;
            mostrarResultado(resultadoDiv, resultadoHTML, "success");
            agregarAlHistorial('Búsqueda de Patrones', {patron, texto: texto.substring(0, 50)}, `Coincidencias: ${coincidencias.length}`);
        } catch (e) {
            mostrarResultado(resultadoDiv, `❌ Error en el patrón de expresión regular: ${e.message}`, "danger");
        }
    }, 500);
}

function patronesComunes() {
    const texto = document.getElementById('texto-patrones').value;
    const resultadoDiv = document.getElementById('resultado-patrones');

    if (!texto.trim()) {
        mostrarResultado(resultadoDiv, "⚠️ Por favor, ingresa un texto para buscar patrones comunes.", "error");
        return;
    }

    const patrones = {
        'Teléfonos (ej. 123-456-7890)': /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g,
        'Correos Electrónicos': /[\w\.-]+@[\w\.-]+\.\w+/g,
        'URLs': /(https?:\/\/[^\s]+)/g,
        'Fechas (YYYY-MM-DD)': /\d{4}-\d{2}-\d{2}/g
    };

    let resultadoHTML = '<div class="comparison-result"><h4>Patrones Comunes encontrados:</h4><ul>';
    let encontro = false;
    for (const [nombre, regex] of Object.entries(patrones)) {
        const coincidencias = (texto.match(regex) || []);
        if (coincidencias.length > 0) {
            encontro = true;
            resultadoHTML += `<li><strong>${nombre} (${coincidencias.length}):</strong> ${coincidencias.slice(0, 5).join(', ').substring(0, 200)}...</li>`;
        }
    }
    resultadoHTML += '</ul></div>';

    if (!encontro) {
        mostrarResultado(resultadoDiv, "🔍 No se encontraron patrones comunes en el texto.", "info");
    } else {
        mostrarResultado(resultadoDiv, resultadoHTML, "success");
    }
}

function limpiarPatrones() {
    document.getElementById('texto-patrones').value = '';
    document.getElementById('patron').value = '';
    document.getElementById('resultado-patrones').innerHTML = '🔍 Busca patrones específicos usando expresiones regulares';
}

function limpiarHistorial() {
    historialAnalisis = [];
    actualizarHistorial();
    guardarHistorialLocal();
}

function guardarHistorialLocal() {
    localStorage.setItem('analisisHistorial', JSON.stringify(historialAnalisis));
}

function cargarHistorialLocal() {
    const historialGuardado = localStorage.getItem('analisisHistorial');
    if (historialGuardado) {
        historialAnalisis = JSON.parse(historialGuardado);
        actualizarHistorial();
    }
}

window.onload = cargarHistorialLocal;

function generarReporte() {
    const texto = document.getElementById('texto-avanzado').value;
    if (!texto.trim()) {
        alert("Por favor, ingresa un texto para generar el reporte.");
        return;
    }
    const stats = {
        caracteres: texto.length,
        letras: texto.replace(/[^a-zA-Z]/g, '').length,
        numeros: texto.replace(/[^0-9]/g, '').length,
        espacios: (texto.match(/\s/g) || []).length,
        palabras: texto.trim().split(/\s+/).filter(word => word.length > 0).length,
        lineas: (texto.match(/\n/g) || []).length + 1
    };

    const frec = {};
    texto.toLowerCase().replace(/\s/g, '').split('').forEach(char => {
        frec[char] = (frec[char] || 0) + 1;
    });
    const frecOrdenada = Object.entries(frec).sort(([, a], [, b]) => b - a);
    const top5Frec = frecOrdenada.slice(0, 5).map(([char, count]) => `${char} (${count})`).join(', ');

    const reporteHTML = `
        <div style="font-family: monospace; line-height: 1.6;">
            <p><strong>Fecha del Reporte:</strong> ${new Date().toLocaleString()}</p>
            <h3>Estadísticas Generales:</h3>
            <p><strong>Caracteres totales:</strong> ${stats.caracteres}</p>
            <p><strong>Palabras:</strong> ${stats.palabras}</p>
            <p><strong>Líneas:</strong> ${stats.lineas}</p>
            <p><strong>Letras:</strong> ${stats.letras}</p>
            <p><strong>Números:</strong> ${stats.numeros}</p>
            <h3>Análisis de Frecuencia:</h3>
            <p><strong>Top 5 caracteres más frecuentes:</strong> ${top5Frec}</p>
        </div>
    `;

    document.getElementById('contenido-reporte').innerHTML = reporteHTML;
    document.getElementById('modal-reporte').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal-reporte').style.display = 'none';
}

function copiarReporte() {
    const reporteTexto = document.getElementById('contenido-reporte').innerText;
    navigator.clipboard.writeText(reporteTexto).then(() => {
        alert('Reporte copiado al portapapeles.');
    }).catch(err => {
        console.error('Error al copiar el reporte: ', err);
    });
}

function descargarReporte() {
    const reporteTexto = document.getElementById('contenido-reporte').innerText;
    const blob = new Blob([reporteTexto], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'reporte-analisis-texto.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function exportarHistorial() {
    const historialJSON = JSON.stringify(historialAnalisis, null, 2);
    const blob = new Blob([historialJSON], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'historial-analisis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}