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
            }

            .mentionjs-item {
                padding: 10px;
                cursor: pointer;
            }

            .mentionjs-item:hover {
                background-color: #e9e9e9;
            }

            .mentionjs-item.selected {
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
        this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.inputElement.addEventListener('keyup', this.handleKeyUp.bind(this));
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

    handleKeyUp(event) {
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

            if (atIndex !== -1) {
                const query = textBeforeCursor.substring(atIndex + 1).toLowerCase();

                if (!this.buscandoRegistro) {
                    this.currentOptions = this.types.filter(option =>
                        option.toLowerCase().includes(query)
                    );
                    if (this.currentOptions.length > 0) {
                        this.selectedIndex = 0;
                        this.showAutocomplete(this.currentOptions, atIndex, false);
                    } else {
                        this.hideAutocomplete();
                    }
                } else {
                    const registros = this.data[this.tipoSelecionado];
                    this.currentOptions = registros.filter(registro =>
                        registro.nome?.toLowerCase().includes(query) ||
                        registro.descricao?.toLowerCase().includes(query)
                    );
                    if (this.currentOptions.length > 0) {
                        this.selectedIndex = 0;
                        this.showAutocompleteRegistros(this.currentOptions, atIndex);
                    } else {
                        this.hideAutocomplete();
                    }
                }
            } else {
                this.hideAutocomplete();
            }
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
        options.forEach((option, index) => {
            const item = document.createElement('div');
            item.classList.add('mentionjs-item');
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            }
            item.textContent = option;
            item.addEventListener('click', () => {
                if (!isRegistro) {
                    this.selectTipo(option, atIndex);
                } else {
                    this.selectRegistro(option, atIndex);
                }
            });
            item.addEventListener('mouseover', () => {
                const items = this.autocompleteContainer.children;
                for (let i = 0; i < items.length; i++) {
                    items[i].classList.remove('selected');
                }
                item.classList.add('selected');
                this.selectedIndex = index;
            });
            this.autocompleteContainer.appendChild(item);
        });

        this.positionAutocomplete();
    }

    showAutocompleteRegistros(registros, atIndex) {
        this.autocompleteContainer.innerHTML = '';
        registros.forEach((registro, index) => {
            const item = document.createElement('div');
            item.classList.add('mentionjs-item');
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            }
            item.textContent = registro.nome || registro.descricao;
            item.addEventListener('click', () => {
                this.selectRegistro(registro, atIndex);
            });
            item.addEventListener('mouseover', () => {
                const items = this.autocompleteContainer.children;
                for (let i = 0; i < items.length; i++) {
                    items[i].classList.remove('selected');
                }
                item.classList.add('selected');
                this.selectedIndex = index;
            });
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

    selectTipo(tipo, atIndex) {
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

        const registros = this.data[tipo];
        this.currentOptions = registros;
        this.selectedIndex = 0;
        this.showAutocompleteRegistros(registros, atIndex);
    }

    selectRegistro(registro, atIndex) {
        const nome = registro.nome || registro.descricao;
        const tipoFormatado = this.tipoSelecionado.charAt(0).toUpperCase() +
            this.tipoSelecionado.slice(1).toLowerCase();
        const textoFinal = `${tipoFormatado}:${nome}`;

        const mention = document.createElement('span');
        mention.classList.add('mentionjs-mention', `mentionjs-mention-${this.tipoSelecionado.toLowerCase()}`);
        mention.textContent = textoFinal;
        mention.contentEditable = false;

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
        this.autocompleteContainer.remove();
    }
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentionJS;
} else {
    window.MentionJS = MentionJS;
} 