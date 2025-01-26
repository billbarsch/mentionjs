class MentionJS {
    constructor(options) {
        this.inputElement = options.inputElement;
        this.data = options.data || {};
        this.types = options.types || [];
        this.styles = options.styles || {};

        // Criar container de autocomplete
        this.autocompleteContainer = document.createElement('div');
        this.autocompleteContainer.id = 'mentionjs-autocomplete';
        this.autocompleteContainer.style.display = 'none';
        document.body.appendChild(this.autocompleteContainer);

        // Estado interno
        this.tipoSelecionado = null;
        this.buscandoRegistro = false;
        this.selectedIndex = -1;
        this.currentOptions = [];
        this.searchTimeout = null;

        // Cache de dados
        this.dataCache = {};

        // Bind dos métodos
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.showAutocomplete = this.showAutocomplete.bind(this);
        this.showAutocompleteRegistros = this.showAutocompleteRegistros.bind(this);
        this.selectTipo = this.selectTipo.bind(this);
        this.selectRegistro = this.selectRegistro.bind(this);
        this.hideAutocomplete = this.hideAutocomplete.bind(this);
        this.navigateOptions = this.navigateOptions.bind(this);
        this.fetchData = this.fetchData.bind(this);

        // Aplicar estilos padrão
        this.applyStyles();

        // Adicionar event listeners
        this.addEventListeners();
    }

    applyStyles() {
        const defaultStyles = `
            #mentionjs-autocomplete {
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                max-height: 150px;
                overflow-y: auto;
                z-index: 1000;
                position: fixed;
                min-width: 200px;
            }

            .mentionjs-item {
                padding: 10px;
                cursor: pointer;
            }

            .mentionjs-item:hover:not(.mentionjs-no-results) {
                background-color: #e9e9e9;
            }

            .mentionjs-item.selected:not(.mentionjs-no-results) {
                background-color: #0078d4;
                color: white;
            }

            .mentionjs-mention {
                padding: 2px 4px;
                border-radius: 3px;
                margin: 0 2px;
                white-space: nowrap;
                display: inline-block;
            }

            .mentionjs-no-results {
                text-align: center;
                background-color: transparent !important;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = defaultStyles + this.generateTypeStyles();
        document.head.appendChild(styleElement);
    }

    generateTypeStyles() {
        return this.types.map(type => `
            .mentionjs-mention-${type.toLowerCase()} {
                background-color: ${this.styles[type]?.background || '#e3f2fd'};
                color: ${this.styles[type]?.color || '#1565c0'};
                border: 1px solid ${this.styles[type]?.border || '#90caf9'};
            }
        `).join('\n');
    }

    addEventListeners() {
        this.inputElement.addEventListener('keydown', this.handleKeyDown);
        this.inputElement.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(event) {
        if (this.autocompleteContainer.style.display === 'block') {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                this.navigateOptions(event.key === 'ArrowDown' ? 1 : -1);
            } else if (event.key === 'Enter' && this.selectedIndex !== -1) {
                event.preventDefault();
                const selectedItem = this.autocompleteContainer.children[this.selectedIndex];
                selectedItem.click();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                this.hideAutocomplete();
            }
        }
    }

    async handleKeyUp(event) {
        if (this.autocompleteContainer.style.display === 'block' &&
            ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
            return;
        }

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const currentNode = range.startContainer;

        if (currentNode.nodeType === Node.TEXT_NODE) {
            const text = currentNode.textContent;
            const cursorPosition = range.startOffset;
            const textBeforeCursor = text.substring(0, cursorPosition);
            const atIndex = textBeforeCursor.lastIndexOf('@');

            if (atIndex !== -1 && textBeforeCursor.slice(atIndex).includes('@')) {
                const query = textBeforeCursor.substring(atIndex + 1).toLowerCase();

                if (!this.buscandoRegistro) {
                    const tiposDisponiveis = Array.isArray(this.types) ? this.types : [];
                    this.currentOptions = tiposDisponiveis.filter(option =>
                        option.toLowerCase().includes(query)
                    );
                    this.selectedIndex = this.currentOptions.length > 0 ? 0 : -1;
                    this.showAutocomplete(this.currentOptions, atIndex, false);
                } else {
                    // Limpar timeout anterior
                    if (this.searchTimeout) {
                        clearTimeout(this.searchTimeout);
                    }

                    // Definir novo timeout para evitar muitas requisições
                    this.searchTimeout = setTimeout(async () => {
                        const registros = await this.fetchData(this.tipoSelecionado, query);
                        const registrosArray = Array.isArray(registros) ? registros : [];
                        this.currentOptions = registrosArray.filter(registro =>
                            (registro.label || '').toLowerCase().includes(query)
                        );
                        this.selectedIndex = this.currentOptions.length > 0 ? 0 : -1;
                        this.showAutocompleteRegistros(this.currentOptions, atIndex);
                    }, 300);
                }
            } else {
                this.hideAutocomplete();
                this.buscandoRegistro = false;
                this.tipoSelecionado = null;
            }
        } else {
            this.hideAutocomplete();
            this.buscandoRegistro = false;
            this.tipoSelecionado = null;
        }
    }

    navigateOptions(direction) {
        const items = this.autocompleteContainer.children;
        if (items.length === 0) return;

        if (this.selectedIndex !== -1) {
            items[this.selectedIndex].classList.remove('selected');
        }

        this.selectedIndex += direction;
        if (this.selectedIndex >= items.length) this.selectedIndex = 0;
        if (this.selectedIndex < 0) this.selectedIndex = items.length - 1;

        items[this.selectedIndex].classList.add('selected');
        items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }

    showAutocomplete(options, atIndex, isRegistro = false) {
        this.autocompleteContainer.innerHTML = '';
        if (!Array.isArray(options)) return;

        if (options.length === 0) {
            const item = document.createElement('div');
            item.classList.add('mentionjs-item', 'mentionjs-no-results');
            item.textContent = 'Nenhum resultado encontrado';
            item.style.color = '#999';
            item.style.fontStyle = 'italic';
            item.style.cursor = 'default';
            this.autocompleteContainer.appendChild(item);
        } else {
            options.forEach((option, index) => {
                const item = document.createElement('div');
                item.classList.add('mentionjs-item');
                if (index === this.selectedIndex) {
                    item.classList.add('selected');
                }
                item.textContent = option;

                const handleClick = () => {
                    if (!isRegistro) {
                        this.selectTipo(option, atIndex);
                    } else {
                        this.selectRegistro(option, atIndex);
                    }
                };

                const handleMouseOver = () => {
                    const items = this.autocompleteContainer.children;
                    for (let i = 0; i < items.length; i++) {
                        items[i].classList.remove('selected');
                    }
                    item.classList.add('selected');
                    this.selectedIndex = index;
                };

                item.addEventListener('click', handleClick);
                item.addEventListener('mouseover', handleMouseOver);
                this.autocompleteContainer.appendChild(item);
            });
        }

        this.positionAutocomplete();
    }

    showAutocompleteRegistros(registros, atIndex) {
        this.autocompleteContainer.innerHTML = '';
        if (!Array.isArray(registros)) return;

        if (registros.length === 0) {
            const item = document.createElement('div');
            item.classList.add('mentionjs-item', 'mentionjs-no-results');
            item.textContent = 'Nenhum resultado encontrado';
            item.style.color = '#999';
            item.style.fontStyle = 'italic';
            item.style.cursor = 'default';
            this.autocompleteContainer.appendChild(item);
        } else {
            registros.forEach((registro, index) => {
                const item = document.createElement('div');
                item.classList.add('mentionjs-item');
                if (index === this.selectedIndex) {
                    item.classList.add('selected');
                }
                item.textContent = registro.label || 'Sem nome';

                const handleClick = () => {
                    this.selectRegistro(registro, atIndex);
                };

                const handleMouseOver = () => {
                    const items = this.autocompleteContainer.children;
                    for (let i = 0; i < items.length; i++) {
                        items[i].classList.remove('selected');
                    }
                    item.classList.add('selected');
                    this.selectedIndex = index;
                };

                item.addEventListener('click', handleClick);
                item.addEventListener('mouseover', handleMouseOver);
                this.autocompleteContainer.appendChild(item);
            });
        }

        this.positionAutocomplete();
    }

    positionAutocomplete() {
        const cursorCoords = this.getCursorCoordinates();
        if (!cursorCoords) return;

        this.autocompleteContainer.style.left = `${cursorCoords.left}px`;
        this.autocompleteContainer.style.top = `${cursorCoords.bottom + 5}px`;
        this.autocompleteContainer.style.minWidth = '150px';
        this.autocompleteContainer.style.display = 'block';

        const containerRect = this.autocompleteContainer.getBoundingClientRect();
        if (containerRect.right > window.innerWidth) {
            this.autocompleteContainer.style.left = `${window.innerWidth - containerRect.width - 10}px`;
        }
        if (containerRect.bottom > window.innerHeight) {
            this.autocompleteContainer.style.top = `${cursorCoords.top - containerRect.height - 5}px`;
        }
    }

    getCursorCoordinates() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        return {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left
        };
    }

    hideAutocomplete() {
        this.autocompleteContainer.style.display = 'none';
    }

    async fetchData(tipo, query = '') {
        const url = this.data[tipo];
        if (typeof url !== 'string') {
            // Se for array de dados estáticos, normaliza para o padrão id e label
            const dados = Array.isArray(this.data[tipo]) ? this.data[tipo] : [];
            const dadosNormalizados = dados.map(item => ({
                id: item.id,
                label: item.label || item.nome || item.name || item.title || item.descricao || item.username
            }));

            // Se tiver query, filtra os dados
            if (query) {
                return dadosNormalizados.filter(item =>
                    item.label.toLowerCase().includes(query.toLowerCase())
                );
            }
            return dadosNormalizados;
        }

        try {
            // Se já temos no cache e não tem query, retorna do cache
            if (this.dataCache[tipo] && !query) {
                return this.dataCache[tipo];
            }

            // Construir URL com parâmetros de busca
            let urlFinal = url;
            if (query) {
                // Verifica o formato da URL e adiciona o parâmetro apropriado
                if (url.includes('_like=')) {
                    // JSONPlaceholder style
                    urlFinal = url + encodeURIComponent(query);
                } else if (url.includes('?')) {
                    // URL já tem parâmetros
                    if (url.endsWith('?') || url.endsWith('&')) {
                        urlFinal = url + 'q=' + encodeURIComponent(query);
                    } else {
                        urlFinal = url + '&q=' + encodeURIComponent(query);
                    }
                } else {
                    // URL sem parâmetros
                    urlFinal = url + '?q=' + encodeURIComponent(query);
                }
            }

            const response = await fetch(urlFinal);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Garantir que data seja um array
            const dataArray = Array.isArray(data) ? data : [data];

            // Normalizar os dados para sempre ter id e label
            const normalizedData = dataArray.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                label: item.label || item.nome || item.name || item.title || item.descricao || item.username || 'Sem nome'
            }));

            // Armazenar no cache apenas se não for uma busca
            if (!query) {
                this.dataCache[tipo] = normalizedData;
            }

            return normalizedData;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            return [];
        }
    }

    async selectTipo(tipo, atIndex) {
        this.tipoSelecionado = tipo;
        this.buscandoRegistro = true;

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;

        while (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
            const text = currentNode.textContent;
            const atPosition = text.lastIndexOf('@');
            if (atPosition !== -1) {
                const beforeText = text.substring(0, atPosition);
                const afterText = text.substring(atPosition + 1);
                const afterSpace = afterText.indexOf(' ');
                const remainingText = afterSpace !== -1 ? afterText.substring(afterSpace + 1) : '';

                currentNode.textContent = beforeText + '@';

                if (remainingText) {
                    const textNode = document.createTextNode(' ' + remainingText);
                    currentNode.parentNode.insertBefore(textNode, currentNode.nextSibling);
                }

                const newRange = document.createRange();
                newRange.setStart(currentNode, atPosition + 1);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                break;
            }
            currentNode = currentNode.previousSibling;
        }

        const registros = await this.fetchData(tipo);
        this.currentOptions = registros;
        this.selectedIndex = 0;
        this.showAutocompleteRegistros(registros, atIndex);
    }

    selectRegistro(registro, atIndex) {
        const label = registro.label;
        const tipoFormatado = this.tipoSelecionado.charAt(0).toUpperCase() +
            this.tipoSelecionado.slice(1).toLowerCase();
        const textoFinal = `${tipoFormatado}:${label}`;

        const mention = document.createElement('span');
        mention.classList.add('mentionjs-mention', `mentionjs-mention-${this.tipoSelecionado.toLowerCase()}`);
        mention.textContent = textoFinal;
        mention.contentEditable = false;
        mention.dataset.id = registro.id;
        mention.dataset.tipo = this.tipoSelecionado;
        mention.dataset.label = label;

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;

        while (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
            const text = currentNode.textContent;
            const atPosition = text.lastIndexOf('@');
            if (atPosition !== -1) {
                const beforeText = text.substring(0, atPosition);
                const afterText = text.substring(atPosition + 1);
                const afterSpace = afterText.indexOf(' ');
                const remainingText = afterSpace !== -1 ? afterText.substring(afterSpace + 1) : '';

                currentNode.textContent = beforeText;
                currentNode.parentNode.insertBefore(mention, currentNode.nextSibling);

                const spaceNode = document.createTextNode(' ');
                currentNode.parentNode.insertBefore(spaceNode, mention.nextSibling);

                if (remainingText) {
                    const textNode = document.createTextNode(remainingText);
                    currentNode.parentNode.insertBefore(textNode, spaceNode.nextSibling);
                }

                const newRange = document.createRange();
                newRange.setStartAfter(spaceNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                break;
            }
            currentNode = currentNode.previousSibling;
        }

        this.hideAutocomplete();
        this.buscandoRegistro = false;
        this.tipoSelecionado = null;
    }

    destroy() {
        // Remover event listeners
        this.inputElement.removeEventListener('keydown', this.handleKeyDown);
        this.inputElement.removeEventListener('keyup', this.handleKeyUp);

        // Remover container de autocomplete
        this.autocompleteContainer.remove();

        // Limpar cache e estados
        this.dataCache = {};
        this.currentOptions = [];
        this.tipoSelecionado = null;
        this.buscandoRegistro = false;
    }

    // Métodos de output
    getHtml() {
        return this.inputElement.innerHTML;
    }

    getJson() {
        const mentions = this.inputElement.querySelectorAll('.mentionjs-mention');
        return Array.from(mentions).map(mention => ({
            type: mention.dataset.tipo,
            id: mention.dataset.id,
            label: mention.dataset.label
        }));
    }

    getText() {
        // Primeiro, vamos obter o texto com as quebras de linha preservadas
        const fullText = this.inputElement.innerText;

        // Agora vamos substituir cada menção pelo seu JSON
        const mentions = this.inputElement.querySelectorAll('.mentionjs-mention');
        let result = fullText;

        // Convertemos para array e invertemos para substituir de trás para frente
        // isso evita que os índices mudem conforme fazemos as substituições
        Array.from(mentions)
            .reverse()
            .forEach(mention => {
                const mentionData = {
                    type: mention.dataset.tipo,
                    id: mention.dataset.id,
                    label: mention.dataset.label
                };
                const startIndex = result.indexOf(mention.textContent);
                if (startIndex !== -1) {
                    result = result.slice(0, startIndex) +
                        JSON.stringify(mentionData) +
                        result.slice(startIndex + mention.textContent.length);
                }
            });

        return result;
    }
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentionJS;
} else {
    window.MentionJS = MentionJS;
} 