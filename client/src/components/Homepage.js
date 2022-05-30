import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import randomCodeGenerator from '../utils/randomCodeGenerator'

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('')

    return (
        <div className='Homepage'> 
            <div class="modal fade rule-modal" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Zoo! regras</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h5>Conteúdo 119 cartas</h5>
                            <ul>
                                <li>
                                    80 cartas de Grupo:
                                    <ul>
                                        <li>10 cartas de Cnidários</li>
                                        <li>10 cartas de Moluscos</li>
                                        <li>10 cartas de Insetos</li>
                                        <li>10 cartas de Aracnídeos</li>
                                        <li>10 cartas de Peixes</li>
                                        <li>10 cartas de Aves</li>
                                        <li>10 cartas de Mamíferos</li>
                                    </ul>
                                </li>
                                <li>
                                    27 cartas de Campo:
                                    <ul>
                                        <li>16 cartas de +2</li>
                                        <li>8 cartas de Trocar Grupo</li>
                                        <li>3 cartas de Eucarionte</li>
                                    </ul>
                                </li>
                                <li>12 cartas de Origem</li>
                            </ul>
                            <h5>Objetivo</h5>
                            <p>
                                Ser o primeiro jogador a se livrar de todas as cartas de sua
                                mão, através de jogadas ou descartes.
                            </p>
                            <h5>Preparação</h5>
                            <ul>
                                <li>
                                    Um dos jogadores (selecionado de forma aleatória)
                                    embaralha as cartas de Origem e distribui 1 para cada
                                    jogador, incluindo para si. As cartas de Origem não contam
                                    para o total de cartas na mão dos jogadores.
                                </li>
                                <li>
                                    O jogador à esquerda embaralha as cartas de Animais e de
                                    Campo e distribui 7 para cada jogador, incluindo para si.
                                </li>
                                <li>
                                    As cartas restantes serão colocadas para baixo,
                                    equidistantes de todos os jogadores, formando a pilha central
                                    de Compras.
                                </li>
                                <li>
                                    Feito isso, a primeira carta da pilha central deverá ser virada
                                    e colocada ao lado, na pilha de Jogadas.
                                </li>
                                <li>
                                    Do lado oposto, reserve espaço para a futura pilha de
                                    Descartes.
                                </li>
                            </ul>
                            <h5>Jogando</h5>
                            <p>
                                O jogador à esquerda do que fez a distribuição final começa
                                o jogo, e a partir daí as rodadas continuam em ordem de sentido
                                horário. No turno de cada jogador, deve-se <b>jogar uma carta de sua
                                mão na pilha de Jogadas</b> de acordo com sua correspondência:
                                grupo (cor), hábito alimentar (símbolo) ou efeito especial. Pode-se
                                também utilizar uma carta de Origem, caso seu efeito permita. Em
                                caso de dúvida, consulte as Especificações das Cartas ao final do
                                manual.
                            </p>
                            <p>
                                Se o jogador em seu turno <b>não tiver como jogar uma carta </b>
                                na pilha de Jogadas, deve comprar uma nova carta da pilha de
                                Compras. Caso a nova carta seja adequada, o jogador pode jogá-la
                                na mesma rodada. Caso contrário, seu turno terminará.
                            </p>
                            <p>
                                Caso o jogador tenha <b>duas cartas idênticas</b> de Animal ou
                                Campo na mão em seu turno, pode jogar ambas juntas em uma
                                mesma jogada. Caso seja uma carta de +2 ou +4, seu efeito será
                                cumulativo. Caso seja uma Troca de Cor, apenas o combo da
                                segunda carta será efetivo.
                            </p>
                            <p>
                                Caso um jogador tenha uma carta idêntica à que está no topo
                                da pilha central, poderá tentar jogá-la mesmo fora de seu turno, o
                                chamado Corte. A partir daí, a rodada continua a partir do jogador
                                que fez o corte. Isso só será permitido enquanto o jogador do turno
                                não fizer sua jogada.
                            </p>
                            <p>
                                Ao jogar sua penúltima carta, o jogador deve gritar “Zoo!” para
                                que os demais jogadores saibam que <b>só tem uma carta na mão. </b>
                                Caso o jogador não faça o anúncio ao final de seu turno e outro note
                                e alerte o grupo, sofrerá a penalidade de comprar duas cartas. Caso
                                algum jogador faça esse alerta incorretamente, ele é que deverá
                                comprar duas cartas.
                            </p>
                            <h5>Especificações das Cartas de Campo</h5>
                            <div className='row'>
                                <img src={require('../assets/troca-cor.png').default} width='200px' className='col-6'/>
                                <p className='col-6'>
                                    <b>Troca de cor:</b> Esta carta pode ser
                                    usada sobre qualquer outra cor ou
                                    hábito alimentar, e o jogador definirá
                                    qual será a cor que continuará o jogo –
                                    que pode ser a mesma que a anterior.
                                    Além disso, dependendo da cor
                                    representada na Troca de Cor e a carta
                                    sobre a qual for jogada, poderá haver
                                    um efeito específico.
                                </p>
                            </div>
                            <div className='row pt-2'>
                                <img src={require('../assets/comprar2.png').default} width='200px' className='col-6'/>
                                <p className='col-6'>
                                    <b>Comprar Duas Cartas (+2):</b> Esta carta
                                        pode ser usada sobre sua cor
                                        correspondente ou sobre outra carta de
                                        +2. O jogador seguinte deverá comprar
                                        2 cartas e perderá seu turno. Caso um
                                        jogador faça um Corte com um +2, a
                                        penalidade cumulativa será transferida
                                        para o jogador seguinte a esse.
                                </p>
                            </div>
                            <div className='row pt-2'>
                                <img src={require('../assets/eucarionte.png').default} width='200px' className='col-6'/>
                                <p className='col-6'>
                                    <b>Carta de Eucarionte (+4):</b> Esta carta
                                        pode ser usada sobre qualquer outra
                                        carta. O jogador seguinte deverá
                                        comprar 4 cartas e perderá seu turno.
                                        Caso um jogador faça um Corte com
                                        um +4, a penalidade cumulativa será
                                        transferida para o jogador seguinte a
                                        esse.
                                </p>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <nav class="navbar bg-light">
                <div class="container-fluid">
                {/* <img src={require('../assets/logo-zoo.png').default} alt="" width="30" height="24"/> */}
                    <span class="navbar-brand mb-0 h1 headerbar">Zoo! Online</span>
                    <button class="btn btn-outline-dark" type="button"
                        data-bs-toggle="modal" data-bs-target="#exampleModal">Regras</button>
                </div>
            </nav>
            <div className='homepage-menu'>
                <img src={require('../assets/logo-zoo.png').default} width='200px' />
                <div className='row main-container col-8'>
                    <div className='row d-flex'>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control game-input" placeholder="Codigo da partida" 
                                onChange={(event) => setRoomCode(event.target.value)}/>
                            <Link to={`/play?roomCode=${roomCode}`}>
                                <button class="btn btn-success" type="button" id="button-addon2">Entrar em partida</button>
                            </Link>
                        </div>
                    </div>
                    <h1 className="or row">Ou</h1>
                    <div className='row'>
                        <Link to={`/play?roomCode=${randomCodeGenerator(5)}`}>
                            <button className="btn btn-success">Criar partida</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage
