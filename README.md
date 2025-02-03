# MentionJS

Uma biblioteca JavaScript leve e flexível para adicionar funcionalidade de menções (@mention) em campos de texto editáveis.

## Características

- 🚀 Suporte para múltiplos tipos de menções (@usuarios, @produtos, etc.)
- 🎨 Estilos personalizáveis por tipo de menção
- 🔄 Suporte para dados estáticos e dinâmicos (via API)
- 🎯 Display personalizado para cada tipo de menção
- 📝 Compatível com campos contentEditable
- ⚛️ Exemplo de integração com React
- 🌐 Exemplo de uso com HTML puro
- 🏷️ Prefixos personalizáveis por tipo de menção

## Instalação

```bash
npm install @billbarsch/mentionjs
```

## Uso Básico

```javascript
import MentionJS from '@billbarsch/mentionjs';

const editor = document.getElementById('editor');
const mention = new MentionJS({
    inputElement: editor,
    data: {
        // Exemplo com API e display personalizado
        usuarios: {
            label: 'Usuários',
            data: 'https://jsonplaceholder.typicode.com/users?username_like=',
            prefix: 'Usuário: ',
            display: item => `${item.username} (${item.email})`,
            parseResponse: (data) => data.map(user => ({
                tipo: 'usuario',
                id: user.id,
                username: user.username,
                email: user.email
            }))
        },
        // API com estrutura diferente e display personalizado
        produtos: {
            label: 'Produtos',
            data: 'https://dummyjson.com/products/search?q=',
            prefix: 'Produto: ',
            display: item => `${item.title} - ${item.description}`,
            parseResponse: (data) => {
                if (!data || !data.products) return [];
                return data.products.map(product => ({
                    tipo: 'produto',
                    id: product.id,
                    title: product.title,
                    description: product.description
                }));
            }
        },
        // Dados estáticos com display personalizado
        vendas: {
            label: 'Vendas',
            prefix: 'Venda: ',
            display: item => `${item.label} - R$ ${item.valor} (${item.data})`,
            data: [
                {
                    tipo: 'venda',
                    id: 1,
                    label: 'Venda 1',
                    valor: 1000,
                    data: '2024-03-20'
                },
                {
                    tipo: 'venda',
                    id: 2,
                    label: 'Venda 2',
                    valor: 2000,
                    data: '2024-03-21'
                }
            ]
        }
    },
    styles: {
        usuarios: {
            background: '#e3f2fd',
            color: '#1565c0',
            border: '#90caf9'
        },
        produtos: {
            background: '#fff9c4',
            color: '#f57f17',
            border: '#ffd54f'
        },
        vendas: {
            background: '#fff9c4',
            color: '#f57f17',
            border: '#ffd54f'
        }
    }
});
```

## 🎯 Exemplos

O projeto inclui exemplos em HTML e React:

### HTML
Exemplo completo com dados estáticos e dinâmicos:
```bash
# Abra diretamente no navegador
open examples/html/url.html
```

### React
```jsx
import React, { useEffect, useRef } from 'react';
import MentionJS from '@billbarsch/mentionjs';

function App() {
    const editorRef = useRef(null);
    const outputHtmlRef = useRef(null);
    const outputJsonRef = useRef(null);
    const outputTextRef = useRef(null);
    const outputDisplayRef = useRef(null);
    const mentionRef = useRef(null);

    useEffect(() => {
        if (editorRef.current) {
            mentionRef.current = new MentionJS({
                inputElement: editorRef.current,
                data: {
                    usuarios: {
                        label: 'Usuários',
                        data: 'https://jsonplaceholder.typicode.com/users?username_like=',
                        prefix: 'Usuário: ',
                        display: item => `${item.username} (${item.email})`,
                        parseResponse: (data) => data.map(user => ({
                            tipo: 'usuario',
                            id: user.id,
                            username: user.username,
                            email: user.email
                        }))
                    },
                    produtos: {
                        label: 'Produtos',
                        data: 'https://dummyjson.com/products/search?q=',
                        prefix: 'Produto: ',
                        display: item => `${item.title} - ${item.description}`,
                        parseResponse: (data) => {
                            if (!data || !data.products) return [];
                            return data.products.map(product => ({
                                tipo: 'produto',
                                id: product.id,
                                title: product.title,
                                description: product.description
                            }));
                        }
                    },
                    vendas: {
                        label: 'Vendas',
                        prefix: 'Venda: ',
                        display: item => `${item.label} - R$ ${item.valor} (${item.data})`,
                        data: [
                            {
                                tipo: 'venda',
                                id: 1,
                                label: 'Venda 1',
                                valor: 1000,
                                data: '2024-03-20'
                            },
                            {
                                tipo: 'venda',
                                id: 2,
                                label: 'Venda 2',
                                valor: 2000,
                                data: '2024-03-21'
                            }
                        ]
                    }
                },
                styles: {
                    usuarios: {
                        background: '#e3f2fd',
                        color: '#1565c0',
                        border: '#90caf9'
                    },
                    produtos: {
                        background: '#fff9c4',
                        color: '#f57f17',
                        border: '#ffd54f'
                    },
                    vendas: {
                        background: '#fff9c4',
                        color: '#f57f17',
                        border: '#ffd54f'
                    }
                }
            });

            const updateOutputs = () => {
                if (outputHtmlRef.current) {
                    outputHtmlRef.current.textContent = mentionRef.current.getHtml();
                }
                if (outputJsonRef.current) {
                    outputJsonRef.current.textContent = JSON.stringify(mentionRef.current.getJson(), null, 2);
                }
                if (outputTextRef.current) {
                    outputTextRef.current.textContent = mentionRef.current.getText();
                }
                if (outputDisplayRef.current) {
                    outputDisplayRef.current.textContent = mentionRef.current.getDisplayText();
                }
            };

            editorRef.current.addEventListener('input', updateOutputs);
            return () => {
                if (editorRef.current) {
                    editorRef.current.removeEventListener('input', updateOutputs);
                }
                if (mentionRef.current) {
                    mentionRef.current.destroy();
                }
            };
        }
    }, []);

    return (
        <div className="App">
            <h1>MentionJS - Exemplo React</h1>
            <p>Digite @ para mencionar usuários, produtos ou vendas</p>

            <div ref={editorRef} className="editor" contentEditable></div>

            <div className="output">
                <h3>Conteúdo HTML:</h3>
                <pre ref={outputHtmlRef}></pre>

                <h3>Conteúdo JSON:</h3>
                <pre ref={outputJsonRef}></pre>

                <h3>Conteúdo Texto:</h3>
                <pre ref={outputTextRef}></pre>

                <h3>Conteúdo Display:</h3>
                <pre ref={outputDisplayRef}></pre>
            </div>
        </div>
    );
}

export default App;
```

Para usar o exemplo React:
```bash
# Entre na pasta do exemplo React
cd examples/react

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

## API

### Opções

- `inputElement`: Elemento HTML onde as menções serão habilitadas
- `data`: Objeto com configuração dos tipos de menção. Cada tipo deve ser um objeto com:
  - `label`: Nome amigável do tipo que será exibido no menu de seleção
  - `data`: URL para busca ou array de dados estáticos
  - `display`: Função que define como o item será exibido no menu de seleção
  - `prefix`: Prefixo opcional que será adicionado antes do texto do display (ex: "Usuário: ")
  - `parseResponse`: Função de transformação dos dados da API (apenas para URLs)
- `styles`: Objeto com estilos personalizados por tipo

### Configuração de Dados

Cada tipo de menção deve ser configurado como um objeto com as seguintes propriedades:

1. Configuração básica com dados estáticos:
```javascript
vendas: {
    label: 'Vendas',
    display: item => `${item.label} - R$ ${item.valor}`,
    data: [
        { id: 1, label: 'Venda 1', valor: 1000 },
        { id: 2, label: 'Venda 2', valor: 2000 }
    ]
}
```

2. Configuração com API:
```javascript
usuarios: {
    label: 'Usuários',
    data: 'https://api.exemplo.com/usuarios?q=',
    display: item => `${item.nome} (${item.email})`,
    parseResponse: (data) => data.map(user => ({
        type: 'usuario',
        id: user.id,
        nome: user.nome,
        email: user.email
    }))
}
```

A função `parseResponse` pode retornar objetos com qualquer estrutura, desde que:
- Tenha um `id` único
- Contenha todos os campos necessários para a função `display`

A função `display` define como o item será exibido no menu de seleção e pode usar qualquer campo retornado pelo `parseResponse`.

### Métodos

- `getText()`: Retorna o texto puro com as menções em formato JSON
- `getHtml()`: Retorna o HTML do conteúdo com as menções formatadas
- `getJson()`: Retorna um array com todas as menções e seus dados
- `getDisplayText()`: Retorna o texto puro com as menções formatadas usando a função display original

Por exemplo:
```javascript
// Se o texto no editor for: "Olá Usuário: Bret (Sincere@april.biz), como vai?"

mention.getText()
// Retorna: 'Olá {"tipo":"usuario","id":"1","username":"Bret","email":"Sincere@april.biz"}, como vai?'

mention.getDisplayText()
// Retorna: 'Olá Bret (Sincere@april.biz), como vai?'
```

## Desenvolvimento

1. Clone o repositório
```bash
git clone https://github.com/billbarsch/mentionjs.git
```

2. Instale as dependências
```bash
npm install
```

3. Execute o exemplo React
```bash
cd examples/react
npm install
npm start
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Suporte

- Email: billbarsch@gmail.com
- GitHub Issues: [Reportar um problema](https://github.com/billbarsch/mentionjs/issues)

## 🛣️ Roadmap

- [ ] Suporte a TypeScript
- [ ] Temas personalizáveis
- [ ] Mais eventos e callbacks
- [ ] Suporte a Vue.js
- [ ] Suporte a Angular
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Documentação interativa

## ⭐ Autor

Bill Barsch (billbarsch@gmail.com)

## Licença

MIT 