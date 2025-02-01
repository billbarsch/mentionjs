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
                    display: item => `${item.username} (${item.email})`,
                    parseResponse: (data) => data.map(user => ({
                        type: 'usuario',
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }))
                },
                produtos: {
                    label: 'Produtos',
                    data: 'https://dummyjson.com/products/search?q=',
                    display: item => `${item.title} - ${item.description}`,
                    parseResponse: (data) => {
                        if (!data || !data.products) return [];
                        return data.products.map(product => ({
                            type: 'produto',
                            id: product.id,
                            title: product.title,
                            description: product.description
                        }));
                    }
                },
                vendas: {
                    label: 'Vendas',
                    display: item => `${item.label} - R$ ${item.valor} (${item.data})`,
                    data: [
                        {
                            id: 1,
                            label: 'Venda 1',
                            valor: 1000,
                            data: '2024-03-20'
                        },
                        {
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
            <p>Digite @ para mencionar usuários</p>

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