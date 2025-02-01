class MentionJS {
    constructor(options) {
        this.inputElement = options.inputElement;
        this.data = {};
        this.parseFunctions = {};
        this.typeLabels = {};
        this.displayFunctions = {};

        // Processar dados e configurações
        Object.entries(options.data || {}).forEach(([tipo, config]) => {
            if (typeof config === 'string') {
                // Se for string, é uma URL
                this.data[tipo] = config;
                this.parseFunctions[tipo] = data => Array.isArray(data) ?
                    data.map(item => ({ ...item, type: tipo })) :
                    [{ ...item, type: tipo }];
                this.typeLabels[tipo] = tipo;
                this.displayFunctions[tipo] = item => item.label || item.username || item.title || 'Sem nome';
            } else if (Array.isArray(config)) {
                // Se for array, são dados estáticos
                this.data[tipo] = config;
                this.parseFunctions[tipo] = data => data.map(item => ({
                    ...item,
                    type: tipo
                }));
                this.typeLabels[tipo] = tipo;
                this.displayFunctions[tipo] = config.display || (item => item.label || 'Sem nome');
            } else {
                // Se for objeto, contém dados e função de parse
                this.data[tipo] = config.data;
                this.displayFunctions[tipo] = config.display || (item =>
                    item.label || item.username || item.title || item.name || 'Sem nome'
                );

                // Se os dados são um array, é estático
                if (Array.isArray(config.data)) {
                    this.parseFunctions[tipo] = data => data.map(item => ({
                        ...item,
                        type: tipo
                    }));
                } else {
                    // Se não, usa o parseResponse para dados da URL
                    this.parseFunctions[tipo] = data => {
                        const parsed = config.parseResponse ? config.parseResponse(data) : data;
                        return Array.isArray(parsed) ?
                            parsed.map(item => ({ ...item, type: tipo })) :
                            [{ ...parsed, type: tipo }];
                    };
                }
                this.typeLabels[tipo] = config.label || tipo;
            }
        });

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
        this.currentQuery = '';

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
        return Object.keys(this.typeLabels).map(type => `
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

    // Função para remover acentos de uma string
    removeAcentos(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
                const query = textBeforeCursor.substring(atIndex + 1);
                this.currentQuery = query;

                if (!this.buscandoRegistro) {
                    const tiposDisponiveis = Object.keys(this.data);
                    this.currentOptions = tiposDisponiveis.filter(option => {
                        const label = this.typeLabels[option] || option;
                        return this.removeAcentos(label.toLowerCase())
                            .includes(this.removeAcentos(query.toLowerCase()));
                    });
                    this.selectedIndex = this.currentOptions.length > 0 ? 0 : -1;
                    this.showAutocomplete(this.currentOptions, atIndex, false);
                } else {
                    if (this.searchTimeout) {
                        clearTimeout(this.searchTimeout);
                    }

                    this.searchTimeout = setTimeout(async () => {
                        const registros = await this.fetchData(this.tipoSelecionado, query);
                        const registrosArray = Array.isArray(registros) ? registros : [];
                        this.currentOptions = registrosArray;
                        this.selectedIndex = this.currentOptions.length > 0 ? 0 : -1;
                        this.showAutocompleteRegistros(this.currentOptions, atIndex);
                    }, 300);
                }
            } else {
                this.hideAutocomplete();
                this.buscandoRegistro = false;
                this.tipoSelecionado = null;
                this.currentQuery = '';
            }
        } else {
            this.hideAutocomplete();
            this.buscandoRegistro = false;
            this.tipoSelecionado = null;
            this.currentQuery = '';
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
                item.textContent = this.typeLabels[option] || option;

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

        console.log('Registros recebidos:', registros);

        if (!Array.isArray(registros) || registros.length === 0) {
            const item = document.createElement('div');
            item.classList.add('mentionjs-item', 'mentionjs-no-results');
            item.textContent = 'Nenhum resultado encontrado';
            item.style.color = '#999';
            item.style.fontStyle = 'italic';
            item.style.cursor = 'default';
            this.autocompleteContainer.appendChild(item);
            this.positionAutocomplete();
            return;
        }

        registros.forEach((registro, index) => {
            const item = document.createElement('div');
            item.classList.add('mentionjs-item');
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            }

            // Usar a função de display configurada para este tipo
            const displayFunction = this.displayFunctions[this.tipoSelecionado];
            item.textContent = displayFunction(registro);

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
        const parseFunction = this.parseFunctions[tipo];

        if (typeof url !== 'string') {
            // Se for array de dados estáticos
            const dados = Array.isArray(this.data[tipo]) ? this.data[tipo] : [];
            const dadosNormalizados = parseFunction(dados);

            // Se tiver query, filtra os dados ignorando acentos
            if (query) {
                return dadosNormalizados.filter(item =>
                    this.removeAcentos(item.label?.toLowerCase() || '')
                        .includes(this.removeAcentos(query.toLowerCase()))
                );
            }
            return dadosNormalizados;
        }

        try {
            // Se já temos no cache e não tem query, retorna do cache
            if (this.dataCache[tipo] && !query) {
                return this.dataCache[tipo];
            }

            // Remove espaços extras e caracteres especiais da query
            const queryProcessada = query.trim().replace(/[^\w\s]/gi, '');

            // Concatena a query à URL (mesmo se estiver vazia)
            const urlFinal = url + encodeURIComponent(queryProcessada);

            const response = await fetch(urlFinal);
            if (!response.ok) {
                console.error(`Erro na API: ${response.status} - ${response.statusText}`);
                return [];
            }
            const data = await response.json();

            try {
                // Aplicar função de parse personalizada
                const normalizedData = parseFunction(data);

                // Verificar se o resultado é um array
                if (!Array.isArray(normalizedData)) {
                    console.error('A função parseResponse deve retornar um array');
                    return [];
                }

                // Armazenar no cache apenas se não for uma busca
                if (!query) {
                    this.dataCache[tipo] = normalizedData;
                }

                return normalizedData;

            } catch (parseError) {
                console.error('Erro ao processar dados:', parseError);
                console.error('Dados recebidos:', data);
                return [];
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            console.error('URL:', url);
            console.error('Query:', query);
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
                // Usar o currentQuery para determinar quanto texto remover
                const queryLength = this.currentQuery.length;
                const remainingText = afterText.substring(queryLength);

                currentNode.textContent = beforeText + '@';

                if (remainingText.trim()) {
                    const textNode = document.createTextNode(' ' + remainingText.trimLeft());
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

        // Buscar todos os registros inicialmente
        const registros = await this.fetchData(tipo, '');
        this.currentOptions = registros;
        this.selectedIndex = registros.length > 0 ? 0 : -1;
        this.showAutocompleteRegistros(registros, atIndex);
    }

    selectRegistro(registro, atIndex) {
        const tipoLabel = this.typeLabels[this.tipoSelecionado];
        // Usar a função de display para o texto final também
        const displayFunction = this.displayFunctions[this.tipoSelecionado];
        const label = displayFunction(registro);
        const textoFinal = `${tipoLabel}:${label}`;

        const mention = document.createElement('span');
        mention.classList.add('mentionjs-mention', `mentionjs-mention-${this.tipoSelecionado.toLowerCase()}`);
        mention.textContent = textoFinal;
        mention.contentEditable = false;

        // Armazenar todos os dados do registro no elemento
        Object.entries(registro).forEach(([key, value]) => {
            mention.dataset[key] = value;
        });

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;

        while (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
            const text = currentNode.textContent;
            const atPosition = text.lastIndexOf('@');
            if (atPosition !== -1) {
                const beforeText = text.substring(0, atPosition);
                const afterText = text.substring(atPosition + 1);
                const queryLength = this.currentQuery.length;
                const remainingText = afterText.substring(queryLength);

                currentNode.textContent = beforeText;
                currentNode.parentNode.insertBefore(mention, currentNode.nextSibling);

                const spaceNode = document.createTextNode(' ');
                currentNode.parentNode.insertBefore(spaceNode, mention.nextSibling);

                if (remainingText.trim()) {
                    const textNode = document.createTextNode(remainingText.trimLeft());
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
        this.currentQuery = '';
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
        return Array.from(mentions).map(mention => {
            // Converter todos os data-attributes em um objeto
            const mentionData = {};
            Object.keys(mention.dataset).forEach(key => {
                mentionData[key] = mention.dataset[key];
            });
            return mentionData;
        });
    }

    getText() {
        const fullText = this.inputElement.innerText;
        const mentions = this.inputElement.querySelectorAll('.mentionjs-mention');
        let result = fullText;

        Array.from(mentions)
            .reverse()
            .forEach(mention => {
                // Converter todos os data-attributes em um objeto
                const mentionData = {};
                Object.keys(mention.dataset).forEach(key => {
                    mentionData[key] = mention.dataset[key];
                });

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