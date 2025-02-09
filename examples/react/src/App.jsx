import { useState, useEffect } from 'react';
import MentionJS from 'mentionjs';
import './App.css';

function App() {
    const [html, setHtml] = useState('');
    const [json, setJson] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        const editor = document.getElementById('editor');
        const mention = new MentionJS({
            inputElement: editor,
            data: {
                usuarios: {
                    label: 'Usuários',
                    data: 'https://jsonplaceholder.typicode.com/users?username_like=',
                    prefix: 'Usuario: ',
                    display: item => `${item.username} (${item.email})`,
                    parseResponse: (data) => data.map(user => ({
                        tipo: 'usuario',
                        id: user.id,
                        username: user.username,
                        email: user.email
                    })),
                    styles: {
                        background: '#e3f2fd',
                        color: '#1565c0',
                        border: '#90caf9'
                    }
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
                    },
                    styles: {
                        background: '#fff9c4',
                        color: '#f57f17',
                        border: '#ffd54f'
                    }
                },
                vendas: {
                    label: 'Vendas',
                    prefix: 'Venda: ',
                    display: item => `${item.label} - R$ ${item.valor}`,
                    data: [
                        {
                            tipo: 'venda',
                            id: 1,
                            label: 'Venda 1',
                            valor: 1000
                        },
                        {
                            tipo: 'venda',
                            id: 2,
                            label: 'Venda 2',
                            valor: 2000
                        }
                    ],
                    parseResponse: (data) => data.map(venda => ({
                        ...venda,
                        tipo: 'venda'
                    })),
                    styles: {
                        background: '#e8f5e9',
                        color: '#2e7d32',
                        border: '#a5d6a7'
                    }
                }
            }
        });

        const updateOutputs = () => {
            setHtml(mention.getHtml());
            setJson(mention.getJson());
            setText(mention.getText());
        };

        editor.addEventListener('input', updateOutputs);
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                requestAnimationFrame(updateOutputs);
            }
        });

        updateOutputs();

        return () => {
            editor.removeEventListener('input', updateOutputs);
            editor.removeEventListener('keydown', updateOutputs);
        };
    }, []);

    return (
        <div className="App">
            <h1>MentionJS - Exemplo com URL</h1>
            <p>Digite @ e escolha o tipo de menção (usuários, produtos ou vendas)</p>

            <div id="editor" contentEditable="true"></div>

            <div className="output">
                <h3>Conteúdo HTML:</h3>
                <pre>{html}</pre>

                <h3>Conteúdo JSON:</h3>
                <pre>{JSON.stringify(json, null, 2)}</pre>

                <h3>Conteúdo Texto:</h3>
                <pre>{text}</pre>
            </div>
        </div>
    );
}

export default App; 