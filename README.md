# MentionJS

Uma biblioteca JavaScript leve e flexível para adicionar funcionalidade de menções (@mention) em campos de texto editáveis.

## Características

- 🚀 Suporte para múltiplos tipos de menções (@usuarios, @produtos, etc.)
- 🎨 Estilos personalizáveis por tipo de menção
- 🔄 Suporte para dados estáticos e dinâmicos (via API)
- 🔍 Funções de parse personalizadas para cada tipo de dado
- 📝 Compatível com campos contentEditable
- ⚛️ Exemplo de integração com React
- 🌐 Exemplo de uso com HTML puro

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
        // URL direta com função de parse personalizada e label personalizado
        usuarios: {
            label: 'Usuários',
            data: 'https://jsonplaceholder.typicode.com/users?username_like=',
            parseResponse: (data) => data.map(user => ({
                id: user.id,
                label: user.username
            }))
        },
        // API com estrutura diferente e label personalizado
        produtos: {
            label: 'Produtos',
            data: 'https://dummyjson.com/products/search?q=',
            parseResponse: (data) => data.products.map(product => ({
                id: product.id,
                label: product.title
            }))
        },
        // Dados estáticos com label personalizado
        vendas: {
            label: 'Vendas',
            data: [
                { id: 1, label: 'Venda #001' },
                { id: 2, label: 'Venda #002' }
            ]
        }
    },
    types: ['usuarios', 'produtos', 'vendas'],
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
- `data`: Objeto com configuração dos tipos de menção. Cada tipo pode ser:
  - Uma string com URL preparada para busca (ex: 'https://api.exemplo.com/busca?q=')
  - Um array com dados estáticos no formato `{id, label}`
  - Um objeto com as seguintes propriedades:
    - `label`: Nome amigável do tipo que será exibido no menu de seleção
    - `data`: URL ou array de dados
    - `parseResponse`: Função de transformação dos dados
- `types`: Array com os tipos de menções disponíveis
- `styles`: Objeto com estilos personalizados por tipo

### Configuração de Dados

O objeto `data` aceita três formatos para cada tipo:

1. URL direta (usa parser padrão):
```javascript
usuarios: 'https://api.exemplo.com/usuarios?q='
```

2. Array de dados estáticos (já no formato correto):
```javascript
vendas: [
    { id: 1, label: 'Venda #001' },
    { id: 2, label: 'Venda #002' }
]
```

3. Objeto com label, URL e função de parse personalizada:
```javascript
produtos: {
    label: 'Produtos', // Nome amigável que aparecerá no menu
    data: 'https://api.exemplo.com/produtos/busca?q=',
    parseResponse: (data) => {
        // Transforma os dados no formato esperado: array de {id, label}
        return data.results.map(item => ({
            id: item.codigo,
            label: item.nome
        }));
    }
}
```

A função `parseResponse` deve sempre retornar um array de objetos com a estrutura:
```javascript
{
    id: string | number,    // Identificador único
    label: string          // Texto que será exibido
}
```

### Métodos

- `getText()`: Retorna o texto com menções em formato JSON
- `getHtml()`: Retorna o HTML do conteúdo
- `getJson()`: Retorna um array com todas as menções
- `destroy()`: Remove os event listeners e limpa o cache

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