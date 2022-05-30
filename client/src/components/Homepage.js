import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import randomCodeGenerator from '../utils/randomCodeGenerator'
import Header from './Header';

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('')

    return (
        <div className='Homepage'> 
            <Header/>
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
