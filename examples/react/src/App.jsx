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
                    data: 'https://jsonplaceholder.typicode.com/users?username_like=',
                    parseResponse: (data) => data.map(user => ({
                        id: user.id,
                        label: user.username
                    }))
                },
                produtos: {
                    data: 'https://dummyjson.com/products/search?q=',
                    parseResponse: (data) => {
                        if (!data || !data.products) return [];
                        return data.products.map(product => ({
                            id: product.id,
                            label: product.title
                        }));
                    }
                },
                vendas: [
                    { id: 1, label: 'Venda #001' },
                    { id: 2, label: 'Venda #002' },
                    { id: 3, label: 'Venda #003' }
                ]
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
                },
                vendas: {
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    border: '#a5d6a7'
                }
            },
            fieldMappings: {
                usuarios: {
                    id: 'id',
                    label: ['username', 'name', 'email']
                },
                produtos: {
                    id: 'id',
                    label: ['title', 'description']
                }
            }
        });

        editor.addEventListener('input', () => {
            setHtml(mention.getHtml());
            setJson(mention.getJson());
            setText(mention.getText());
        });

        return () => {
            mention.destroy();
        };
    }, []);

    return (
        <div className="container">
            <h1>MentionJS - Exemplo React</h1>

            <div className="instructions">
                <p>Digite @ para mencionar:</p>
                <ul>
                    <li><strong>@usuarios</strong> - busca usuários via API</li>
                    <li><strong>@produtos</strong> - busca produtos via API</li>
                    <li><strong>@vendas</strong> - lista de vendas estática</li>
                </ul>
            </div>

            <div id="editor" contentEditable={true} className="editor" />

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