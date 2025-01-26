# MentionJS

Uma biblioteca JavaScript leve e flexível para adicionar funcionalidade de menções (@) em campos de texto editáveis.

## Características

- Suporte para múltiplos tipos de menções
- Estilização personalizável
- Funciona com texto editável HTML
- Suporte para React
- Navegação por teclado
- Interface responsiva

## Instalação

```bash
npm install @billbarsch/mentionjs
```

## Uso Básico

### HTML Vanilla
```html
<div id="editor" contenteditable="true"></div>

<script src="node_modules/@billbarsch/mentionjs/dist/mentionjs.min.js"></script>
<script>
    const mention = new MentionJS({
        inputElement: document.getElementById('editor'),
        data: {
            usuarios: [
                { id: 1, nome: 'João Silva' },
                { id: 2, nome: 'Maria Santos' }
            ]
        },
        types: ['usuarios'],
        styles: {
            usuarios: {
                background: '#e3f2fd',
                color: '#1565c0',
                border: '#90caf9'
            }
        }
    });
</script>
```

### React
```jsx
import { MentionJS } from '@billbarsch/mentionjs';
import { useEffect, useRef } from 'react';

function Editor() {
    const editorRef = useRef(null);
    
    useEffect(() => {
        const mention = new MentionJS({
            inputElement: editorRef.current,
            data: {
                usuarios: [
                    { id: 1, nome: 'João Silva' },
                    { id: 2, nome: 'Maria Santos' }
                ]
            },
            types: ['usuarios'],
            styles: {
                usuarios: {
                    background: '#e3f2fd',
                    color: '#1565c0',
                    border: '#90caf9'
                }
            }
        });

        return () => mention.destroy();
    }, []);

    return (
        <div ref={editorRef} contentEditable={true}></div>
    );
}

export default Editor;
```

## Documentação

### Opções

- `inputElement`: Elemento HTML onde o editor será inicializado
- `data`: Objeto contendo arrays de dados para cada tipo de menção
- `types`: Array com os tipos de menções disponíveis
- `styles`: Objeto com estilos para cada tipo de menção

### Estilos

Cada tipo de menção pode ter seus próprios estilos:

```javascript
{
    background: '#e3f2fd', // Cor de fundo
    color: '#1565c0',      // Cor do texto
    border: '#90caf9'      // Cor da borda
}
```

## Exemplos

Veja a pasta `/examples` para exemplos completos de implementação em HTML e React.

## Licença

MIT

## Autor

Bill Barsch (billbarsch@gmail.com) 