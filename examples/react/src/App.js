import React, { useEffect, useRef } from 'react';
import MentionJS from '@billbarsch/mentionjs';
import './App.css';

function App() {
    const editorRef = useRef(null);
    const outputHtmlRef = useRef(null);
    const outputJsonRef = useRef(null);
    const outputTextRef = useRef(null);
    const mentionRef = useRef(null);

    useEffect(() => {
        if (editorRef.current) {
            mentionRef.current = new MentionJS({
                inputElement: editorRef.current,
                data: {
                    usuarios: {
                        label: 'Usuários',
                        data: 'https://jsonplaceholder.typicode.com/users?username_like=',
                        parseResponse: (data) => data.map(user => ({
                            id: user.id,
                            label: user.username
                        }))
                    },
                    produtos: {
                        label: 'Produtos',
                        data: 'https://dummyjson.com/products/search?q=',
                        parseResponse: (data) => {
                            if (!data || !data.products) return [];
                            return data.products.map(product => ({
                                id: product.id,
                                label: product.title
                            }));
                        }
                    },
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
                    },
                    vendas: {
                        background: '#f3e5f5',
                        color: '#7b1fa2',
                        border: '#ce93d8'
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
            };

            editorRef.current.addEventListener('input', updateOutputs);
            editorRef.current.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    requestAnimationFrame(updateOutputs);
                }
            });

            updateOutputs();

            return () => {
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
            </div>
        </div>
    );
}

export default App; 