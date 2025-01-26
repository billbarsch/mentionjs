# MentionJS

Uma biblioteca JavaScript leve e flexível para adicionar funcionalidade de menções (@mention) em campos de texto editáveis.

## Características

- 🚀 Suporte para múltiplos tipos de menções (@usuarios, @produtos, etc.)
- 🎨 Estilos personalizáveis por tipo de menção
- 🔄 Suporte para dados estáticos e dinâmicos (via API)
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
        usuarios: 'https://api.exemplo.com/usuarios?q=',
        produtos: [
            { id: 1, label: 'Produto 1' },
            { id: 2, label: 'Produto 2' }
        ]
    },
    types: ['usuarios', 'produtos'],
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

## Exemplos

### HTML Puro
Veja o exemplo em `/examples/html/url.html`

### React
Veja o exemplo completo em `/examples/react`

## API

### Opções

- `inputElement`: Elemento HTML onde as menções serão habilitadas
- `data`: Objeto com dados estáticos ou URLs para busca dinâmica
- `types`: Array com os tipos de menções disponíveis
- `styles`: Objeto com estilos personalizados por tipo

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

## Licença

MIT

## 🎯 Exemplos

O projeto inclui exemplos completos em HTML e React na pasta `/examples`:

- `/examples/html/index.html` - Exemplo completo em HTML
- `/examples/html/basico.html` - Exemplo básico em HTML
- `/examples/react` - Exemplo em React

Para executar os exemplos:

### HTML
Abra diretamente os arquivos HTML no navegador:
```bash
# Exemplo completo
open examples/html/index.html

# Exemplo básico
open examples/html/basico.html
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