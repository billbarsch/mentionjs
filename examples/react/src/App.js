import React, { useEffect, useRef } from 'react';
import MentionJS from 'mentionjs';
import './App.css';

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
            editorRef.current.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    requestAnimationFrame(updateOutputs);
                }
            });

            updateOutputs();

            return () => {
                if (editorRef.current) {
                    editorRef.current.removeEventListener('input', updateOutputs);
                    editorRef.current.removeEventListener('keydown', updateOutputs);
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