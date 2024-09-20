import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
        import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
        import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

        // Adiciona manipuladores de eventos para os botões
        document.querySelectorAll('.botao-excluir').forEach(botao => {
            botao.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const index = tarefas.findIndex(t => t.id === id);
                if (index > -1) {
                    tarefas.splice(index, 1); // Remove a tarefa do array
                    carregarTarefas(); // Atualiza a lista de tarefas
                }
            });
        });

        document.querySelectorAll('.botao-editar').forEach(botao => {
            botao.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const tarefa = tarefas.find(t => t.id === id);
                const novaDescricao = prompt('Editar tarefa:', tarefa.descricao);
                if (novaDescricao && novaDescricao.trim() !== '') {
                    tarefa.descricao = novaDescricao.trim(); // Atualiza a descrição da tarefa
                    carregarTarefas(); // Atualiza a lista de tarefas
                }
            });
        });

        document.querySelectorAll('.botao-confirmar').forEach(botao => {
            botao.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const inputValor = document.querySelector(`.input-valor[data-id="${id}"]`);
                const valorInput = inputValor.querySelector('.valor-input');
                const quantidadeInput = inputValor.querySelector('.quantidade-input');

                if (this.classList.contains('verde')) {
                    this.classList.remove('verde'); // Remove a classe verde
                    inputValor.style.display = 'none'; // Esconde o campo de valor
                } else {
                    this.classList.add('verde'); // Adiciona a classe verde
                    inputValor.style.display = 'block'; // Mostra o campo de valor
                }

                // Adiciona manipulador de evento para o botão de salvar valor
                inputValor.querySelector('.botao-salvar').addEventListener('click', function () {
                    const novaQuantidade = parseInt(quantidadeInput.value);
                    const novoValor = parseFloat(valorInput.value.trim());
                    if (!isNaN(novoValor) && !isNaN(novaQuantidade)) {
                        const tarefa = tarefas.find(t => t.id === id);
                        tarefa.valor = novoValor; // Atualiza o valor da tarefa
                        tarefa.quantidade = novaQuantidade; // Atualiza a quantidade da tarefa
                        carregarTarefas(); // Atualiza a lista de tarefas
                    }
                });
            });
        });


        // Função para atualizar o valor total
        function atualizarTotal() {
            const totalValor = tarefas.reduce((total, tarefa) => total + (tarefa.valor * tarefa.quantidade), 0);
            document.getElementById('totalValor').textContent = totalValor.toFixed(2);
        }
        // Configurações do Firebase
        const configuracaoFirebase = {
            apiKey: "AIzaSyAB82G87QwbLBYp8ygkn36XnxMqjnYXwPk",
            authDomain: "item-8602d.firebaseapp.com",
            projectId: "item-8602d",
            storageBucket: "item-8602d.appspot.com",
            messagingSenderId: "481487464832",
            appId: "1:481487464832:web:37a18de141261542b8b965"
        };

        // Inicializar Firebase
        const app = initializeApp(configuracaoFirebase);
        const db = getFirestore(app);
        const auth = getAuth(app);

        // Função de autenticação de usuários
        document.getElementById('formLogin').addEventListener('submit', async function (evento) {
            evento.preventDefault();

            const email = document.getElementById('inputEmail').value;
            const senha = document.getElementById('inputSenha').value;

            try {
                await signInWithEmailAndPassword(auth, email, senha);
                alert('Login bem-sucedido!');
            } catch (erro) {
                console.error('Erro ao fazer login:', erro);
                alert('Erro ao fazer login. Verifique suas credenciais.');
            }
        });

        // Função de cadastro de novos usuários
        document.getElementById('botaoCadastro').addEventListener('click', async function () {
            const email = prompt('Digite seu e-mail:');
            const senha = prompt('Digite sua senha:');
            if (email && senha) {
                try {
                    await createUserWithEmailAndPassword(auth, email, senha);
                    alert('Cadastro realizado com sucesso!');
                } catch (erro) {
                    console.error('Erro ao cadastrar usuário:', erro);
                    alert('Erro ao cadastrar usuário. Erro: ' + erro.message);
                }
            }
        });

        // Função de logout
        document.getElementById('botaoLogout').addEventListener('click', async function () {
            try {
                await signOut(auth);
                alert('Logout realizado com sucesso!');
            } catch (erro) {
                console.error('Erro ao fazer logout:', erro);
                alert('Erro ao fazer logout. Erro: ' + erro.message);
            }
        });

        // Verificar mudanças no estado de autenticação
        onAuthStateChanged(auth, (user) => {
            if (user) {
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('crudContainer').style.display = 'block';
                carregarTarefas(); // Carregar tarefas se o usuário estiver logado
            } else {
                document.getElementById('authContainer').style.display = 'block';
                document.getElementById('crudContainer').style.display = 'none';
            }
        });

        // Manipulador de envio de formulário de tarefas
        document.getElementById('formTarefa').addEventListener('submit', async function (evento) {
            evento.preventDefault();

            const tarefa = document.getElementById('inputTarefa').value;
            const usuario = auth.currentUser;

            if (usuario) {
                try {
                    await addDoc(collection(db, 'tarefas'), {
                        tarefa: tarefa,
                        usuarioId: usuario.uid
                    });
                    alert('Tarefa adicionada com sucesso!');
                    document.getElementById('formTarefa').reset();
                    carregarTarefas(); // Carregar tarefas após envio
                } catch (erro) {
                    console.error('Erro ao adicionar tarefa:', erro);
                    alert('Erro ao adicionar tarefa. Erro: ' + erro.message);
                }
            } else {
                alert('Usuário não autenticado.');
            }
        });

        // Função para carregar tarefas do Firestore
        // Função para carregar tarefas do Firestore
        async function carregarTarefas() {
            const containerTarefas = document.getElementById('containerTarefas');
            containerTarefas.innerHTML = ''; // Limpa o conteúdo atual

            const usuario = auth.currentUser;

            if (usuario) {
                try {
                    const consulta = query(collection(db, 'tarefas'), where('usuarioId', '==', usuario.uid));
                    const consultaSnapshot = await getDocs(consulta);
                    const tarefas = []; // Array para armazenar todas as tarefas para o cálculo do total

                    consultaSnapshot.forEach((docSnapshot) => {
                        const tarefaData = docSnapshot.data();
                        const tarefa = {
                            id: docSnapshot.id,
                            descricao: tarefaData.tarefa,
                            quantidade: tarefaData.quantidade || 1,
                            valor: tarefaData.valor || 0.00
                        };
                        tarefas.push(tarefa); // Adiciona cada tarefa ao array

                        const divTarefa = document.createElement('div');
                        divTarefa.className = 'tarefa';
                        divTarefa.innerHTML = `
                    <div class="conteudo-tarefa">
                        <strong>Tarefa:</strong> ${tarefa.descricao} - 
                        Quantidade: <input type="number" class="quantidade-input" min="1" value="${tarefa.quantidade}" style="width: 60px;">
                        Valor Unitário: R$ <input type="number" class="valor-input" step="0.01" placeholder="Digite um valor" value="${tarefa.valor.toFixed(2)}">
                    </div>
                    <div class="acoes-tarefa">
                        <button class="botao-editar">Editar</button>
                        <button class="botao-excluir">Excluir</button>
                        <button class="botao-confirmar">salvar</button>
                        
                    </div>
                `;

                        // Função para excluir tarefa
                        divTarefa.querySelector('.botao-excluir').addEventListener('click', async function () {
                            try {
                                const tarefaRef = doc(db, 'tarefas', tarefa.id);
                                await deleteDoc(tarefaRef);
                                alert('Tarefa excluída com sucesso!');
                                carregarTarefas(); // Recarregar tarefas após exclusão
                            } catch (erro) {
                                console.error('Erro ao excluir a tarefa:', erro);
                                alert('Erro ao excluir a tarefa. Erro: ' + erro.message);
                            }
                        });

                        // Função para editar tarefa
                        divTarefa.querySelector('.botao-editar').addEventListener('click', async function () {
                            const novaTarefa = prompt('Editar tarefa:', tarefa.descricao);
                            if (novaTarefa) {
                                try {
                                    const tarefaRef = doc(db, 'tarefas', tarefa.id);
                                    await updateDoc(tarefaRef, {
                                        tarefa: novaTarefa
                                    });
                                    alert('Tarefa atualizada com sucesso!');
                                    carregarTarefas(); // Recarregar tarefas após atualização
                                } catch (erro) {
                                    console.error('Erro ao atualizar a tarefa:', erro);
                                    alert('Erro ao atualizar a tarefa. Erro: ' + erro.message);
                                }
                            }
                        });

                        // Função para confirmar e salvar o valor da tarefa
                        divTarefa.querySelector('.botao-confirmar').addEventListener('click', function () {
                            const quantidadeInput = divTarefa.querySelector('.quantidade-input');
                            const valorInput = divTarefa.querySelector('.valor-input');

                            const quantidade = parseInt(quantidadeInput.value);
                            const valor = parseFloat(valorInput.value);

                            if (!isNaN(valor) && !isNaN(quantidade)) {
                                // Atualiza o valor da tarefa e quantidade
                                const tarefaRef = doc(db, 'tarefas', tarefa.id);
                                updateDoc(tarefaRef, {
                                    quantidade: quantidade,
                                    valor: valor
                                }).then(() => {
                                    tarefa.quantidade = quantidade; // Atualiza a quantidade no objeto tarefa
                                    tarefa.valor = valor; // Atualiza o valor no objeto tarefa
                                    atualizarTotal(); // Atualiza o valor total após a confirmação
                                    alert('Tarefa atualizada com sucesso!');
                                    carregarTarefas(); // Recarregar tarefas após atualização
                                }).catch(erro => {
                                    console.error('Erro ao atualizar a tarefa:', erro);
                                    alert('Erro ao atualizar a tarefa. Erro: ' + erro.message);
                                });
                            } else {
                                alert('Por favor, insira valores válidos para quantidade e preço.');
                            }
                        });

                        containerTarefas.appendChild(divTarefa);
                    });

                    // Função para atualizar o valor total de todas as tarefas
                    function atualizarTotal() {
                        const totalValor = tarefas.reduce((total, tarefa) => {
                            return total + (tarefa.quantidade * tarefa.valor);
                        }, 0);
                        document.getElementById('totalValor').textContent = totalValor.toFixed(2);
                    }

                    atualizarTotal(); // Chama a função para calcular o total inicial ao carregar as tarefas

                } catch (erro) {
                    console.error('Erro ao carregar tarefas:', erro);
                    alert('Erro ao carregar tarefas. Erro: ' + erro.message);
                }
            }
        }



        //segundo codigo