/* eslint-disable no-lone-blocks */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable default-case */
import React, { useEffect, useState } from 'react'
import PACK_OF_ZOO_CARDS from '../utils/cardsZoo'
import PACK_OF_ORIGIN_CARDS from '../utils/originCards'
import shuffleArray from '../utils/shuffleArray'
import io from 'socket.io-client'
import queryString from 'query-string'
import Spinner from './Spinner'
import useSound from 'use-sound'
import "overlayscrollbars/css/OverlayScrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import bgMusic from '../assets/sounds/game-bg-music.mp3'
import zooSound from '../assets/sounds/zoo-sound.mp3'
import shufflingSound from '../assets/sounds/shuffling-cards-1.mp3'
import draw2CardSound from '../assets/sounds/draw2-sound.mp3'
import wildCardSound from '../assets/sounds/wild-sound.mp3'
import draw4CardSound from '../assets/sounds/draw4-sound.mp3'
import gameOverSound from '../assets/sounds/game-over-sound.mp3'

import Header from './Header';
//NUMBER CODES FOR ACTION CARDS
//DRAW 2 - 252
//WILD - 300
//DRAW 4 WILD - 600

let socket
const ENDPOINT = 'http://localhost:5000'
//const ENDPOINT = 'https://fierce-inlet-71587.herokuapp.com/'

const Game = (props) => {
    const data = queryString.parse(props.location.search)

    //initialize socket state
    const [room, setRoom] = useState(data.roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState('')

    useEffect(() => {
        const connectionOptions =  {
            "forceNew" : true,
            "reconnectionAttempts": "Infinity", 
            "timeout" : 10000,                  
            "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        socket.emit('join', {room: room}, (error) => {
            if(error)
                setRoomFull(true)
        })

        //cleanup on component unmount
        return function cleanup() {
            socket.emit('disconnect')
            //shut down connnection instance
            socket.off()
        }
    }, [])

    //initialize game state
    const [gameOver, setGameOver] = useState(true)
    const [winner, setWinner] = useState('')
    const [turn, setTurn] = useState('')
    const [player1Deck, setPlayer1Deck] = useState([])
    const [player2Deck, setPlayer2Deck] = useState([])
    const [player1Origin, setPlayer1Origin] = useState('')
    const [player2Origin, setPlayer2Origin] = useState('')
    const [currentColor, setCurrentColor] = useState('') //grupo animal
    const [currentNumber, setCurrentNumber] = useState('') //tipo de predacao
    const [playedCardsPile, setPlayedCardsPile] = useState([])
    const [drawCardPile, setDrawCardPile] = useState([])
    const [origin1TimesUsed, setOrigin1TimesUsed] = useState(0)
    const [origin2TimesUsed, setOrigin2TimesUsed] = useState(0)
    const [shouldFilter1, setShouldFilter1] = useState(false)
    const [shouldFilter2, setShouldFilter2] = useState(false)

    const [iszooButtonPressed, setzooButtonPressed] = useState(false)
    const [isSoundMuted, setSoundMuted] = useState(true)
    const [isMusicMuted, setMusicMuted] = useState(true)

    const [playzooSound] = useSound(zooSound)
    const [playShufflingSound] = useSound(shufflingSound)
    const [playDraw2CardSound] = useSound(draw2CardSound)
    const [playWildCardSound] = useSound(wildCardSound)
    const [playDraw4CardSound] = useSound(draw4CardSound)
    const [playGameOverSound] = useSound(gameOverSound)

    //runs once on component mount
    useEffect(() => {
        //shuffle PACK_OF_CARDS array
        const shuffledCards = shuffleArray(PACK_OF_ZOO_CARDS)
        const shuffledOriginCards = shuffleArray(PACK_OF_ORIGIN_CARDS)
        
        //extract first 7 elements to player1Deck
        const player1Deck = shuffledCards.splice(0, 7)
        //extract 1 origin card
        const player1Origin = shuffledOriginCards.splice(0, 1)

        //extract first 7 elements to player2Deck
        const player2Deck = shuffledCards.splice(0, 7)
        //extract 1 origin card
        const player2Origin = shuffledOriginCards.splice(0, 1)

        //extract random card from shuffledCards and check if its not an action card
        let startingCardIndex
        while(true) {
            //check if initial card is not special
            startingCardIndex = Math.floor(Math.random() * 109)
            if(shuffledCards[startingCardIndex]==='D2R' || shuffledCards[startingCardIndex]==='D2G' || shuffledCards[startingCardIndex]==='D2B' ||
            shuffledCards[startingCardIndex]==='D2Y' || shuffledCards[startingCardIndex]==='D2C' || shuffledCards[startingCardIndex]==='D2O' || 
            shuffledCards[startingCardIndex]==='D2P' || shuffledCards[startingCardIndex]==='D2L' ||
            shuffledCards[startingCardIndex]==='W1' || shuffledCards[startingCardIndex]==='D4W') {
                continue;
            }
            else
                break;
        }

        //extract the card from that startingCardIndex into the playedCardsPile
        const playedCardsPile = shuffledCards.splice(startingCardIndex, 1)

        //store all remaining cards into drawCardPile
        const drawCardPile = shuffledCards

        //send initial state to server
        socket.emit('initGameState', {
            gameOver: false,
            turn: 'Player 1',
            player1Deck: [...player1Deck],
            player2Deck: [...player2Deck],
            player1Origin: player1Origin,
            player2Origin: player2Origin,
            origin1TimesUsed: origin1TimesUsed,
            origin2TimesUsed: origin2TimesUsed,
            currentColor: playedCardsPile[0].charAt(1),
            currentNumber: playedCardsPile[0].charAt(0),
            playedCardsPile: [...playedCardsPile],
            drawCardPile: [...drawCardPile],
            shouldFilter1: false,
            shouldFilter2: false
        })
    }, [])

    useEffect(() => {
        socket.on('initGameState', ({ gameOver, turn, player1Deck, player2Deck, currentColor, currentNumber, 
            playedCardsPile, drawCardPile, player1Origin, player2Origin, origin1TimesUsed, origin2TimesUsed, shouldFilter1, shouldFilter2 }) => {
            setGameOver(gameOver)
            setTurn(turn)
            setPlayer1Deck(player1Deck)
            setPlayer2Deck(player2Deck)
            setPlayer1Origin(player1Origin)
            setPlayer2Origin(player2Origin)
            setCurrentColor(currentColor)
            setCurrentNumber(currentNumber)
            setPlayedCardsPile(playedCardsPile)
            setDrawCardPile(drawCardPile)
            setOrigin1TimesUsed(origin1TimesUsed)
            setOrigin2TimesUsed(origin2TimesUsed)
            setShouldFilter1(shouldFilter1)
            setShouldFilter2(shouldFilter2)
        })

        socket.on('updateGameState', ({ gameOver, winner, turn, player1Deck, player2Deck, currentColor, currentNumber, 
            playedCardsPile, drawCardPile, player1Origin, player2Origin, origin1TimesUsed, origin2TimesUsed, shouldFilter1, shouldFilter2   }) => {
            gameOver && setGameOver(gameOver)
            gameOver===true && playGameOverSound()
            winner && setWinner(winner)
            turn && setTurn(turn)
            player1Deck && setPlayer1Deck(player1Deck)
            player2Deck && setPlayer2Deck(player2Deck)
            currentColor && setCurrentColor(currentColor)
            currentNumber && setCurrentNumber(currentNumber)
            playedCardsPile && setPlayedCardsPile(playedCardsPile)
            drawCardPile && setDrawCardPile(drawCardPile)
            player1Origin && setPlayer1Origin(player1Origin)
            player2Origin && setPlayer2Origin(player2Origin)
            origin1TimesUsed && setOrigin1TimesUsed(origin1TimesUsed)
            origin2TimesUsed && setOrigin2TimesUsed(origin2TimesUsed)
            setzooButtonPressed(false)
            setShouldFilter1(shouldFilter1)
            setShouldFilter2(shouldFilter2)
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })

    }, [])

    //some util functions
    const checkGameOver = (arr) => {
        return arr.length === 1
    }
    
    const checkWinner = (arr, player) => {
        return arr.length === 1 ? player : ''
    }

    const onSimbiosePlayed = (played_card) => {
        const cardPlayedBy = turn

        if(Array.isArray(played_card)) {
            played_card = played_card[0];
        }

        if(shouldFilter1) {
            if(played_card === 'D2P' || played_card === 'D2O' || played_card === 'D2C') {
                const colorOfPlayedCard = played_card.charAt(2)
                const removeIndex = player1Deck.indexOf(played_card)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                socket.emit('updateGameState', {
                    gameOver: checkGameOver(player1Deck),
                    winner: checkWinner(player1Deck, 'Player 1'),
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                    currentColor: colorOfPlayedCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray],
                    shouldFilter1: false
                })
            }
            else {
                const numberOfPlayedCard = played_card.charAt(0)
                const colorOfPlayedCard = played_card.charAt(1)
                const removeIndex = player1Deck.indexOf(played_card)
                socket.emit('updateGameState', {
                    gameOver: checkGameOver(player1Deck),
                    winner: checkWinner(player1Deck, 'Player 1'),
                    turn: 'Player 2',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                    currentColor: colorOfPlayedCard,
                    currentNumber: numberOfPlayedCard,
                    shouldFilter1: false
                })
            }
        }
        else if (shouldFilter2){
            if(played_card === 'D2P' || played_card === 'D2O' || played_card === 'D2C') {
                const colorOfPlayedCard = played_card.charAt(2)
                const removeIndex = player2Deck.indexOf(played_card)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                socket.emit('updateGameState', {
                    gameOver: checkGameOver(player2Deck),
                    winner: checkWinner(player2Deck, 'Player 1'),
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                    currentColor: colorOfPlayedCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray],
                    shouldFilter2: false
                })
            } 
            else {
                const numberOfPlayedCard = played_card.charAt(0)
                const colorOfPlayedCard = played_card.charAt(1)
                const removeIndex = player2Deck.indexOf(played_card)
                socket.emit('updateGameState', {
                    gameOver: checkGameOver(player2Deck),
                    winner: checkWinner(player2Deck, 'Player 2'),
                    turn: 'Player 1',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                    currentColor: colorOfPlayedCard,
                    currentNumber: numberOfPlayedCard,
                    shouldFilter2: false
                })
            }
        }
    }

    //driver functions
    const onCardPlayedHandler = (played_card) => {
        //extract player who played the card
        const cardPlayedBy = turn
        console.log("entered card played ", played_card);
        if(Array.isArray(played_card)) {
            played_card = played_card[0];
        }

        if(played_card === 'OR1' || played_card === 'OR2' || played_card === 'OR3' || played_card === 'OR4' || played_card === 'OR5' || played_card === 'OR6') {
            if(cardPlayedBy === 'Player 1') {
                var timesUsed = origin1TimesUsed;
                timesUsed++;
                console.log("times used 1:", timesUsed);
                console.log("cards before", player1Deck);
                if(played_card === 'OR1') {
                    //glandulas mamarias
                    console.log("glandulas")
                    socket.emit('updateGameState', {
                        origin1TimesUsed: timesUsed
                    })
                    if(timesUsed <= 3) {
                        console.log("da pra tirar");
                    }
                    else {
                        //desabilita botao no front
                        console.log("limite maximo de uso alcancado");
                    }
                }
            }
            else{
                var times2Used = origin2TimesUsed;
                times2Used++;
                if(played_card === 'OR1') {
                    //glandulas mamarias
                    console.log("glandulas")
                    socket.emit('updateGameState', {
                        origin2TimesUsed: times2Used
                    })
                    if(timesUsed <= 3) {
                        console.log("da pra tirar");
                    }
                    else {
                        //desabilita botao no front
                        console.log("limite maximo de uso alcancado");
                    }
                }
            }
        }
        else {
            switch(played_card) {
                //if card played was a number card
                case '6R1': case '4R2': case '3R3': case '1R4': case '2R5': case '1B1': case '2B2': case '3B3': case '4B4': case '4B5': case '0Y1': case '1Y2': case '1Y3': case '0Y4': case '1Y5': case '5C1': case '1C2': case '1C3': case '3C4': case '1C5': case '4G1': case '4G2': case '4G3': case '4G4': case '1G5': case '1O1': case '1O2': case '4O3': case '4O4': case '7O5': case '1P1': case '7P2': case '1P3': case '1P4': case '3P5': case '1L1': case '1L2': case '1L3': case '4L4': case '1L5': {
                    //extract number and color of played card
                    const numberOfPlayedCard = played_card.charAt(0)
                    const colorOfPlayedCard = played_card.charAt(1)

                    //check for color match
                    if(currentColor === colorOfPlayedCard) {
                        console.log('colors matched!')
                        //check who played the card and return new state accordingly
                        if(cardPlayedBy === 'Player 1') {
                            //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                            //then update turn, currentColor and currentNumber
                            const removeIndex = player1Deck.indexOf(played_card)
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player1Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //make a copy of drawCardPile array
                                const copiedDrawCardPileArray = [...drawCardPile]
                                //pull out last two elements from it
                                const drawCard1 = copiedDrawCardPileArray.pop()
                                const drawCard2 = copiedDrawCardPileArray.pop()
                                const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                                updatedPlayer1Deck.push(drawCard1)
                                updatedPlayer1Deck.push(drawCard2)
                                !isSoundMuted && playShufflingSound()
                                // check if played card is simbiose
                                if(numberOfPlayedCard === '5' && (player1Deck.filter(word => word.includes("P")).length > 0 || player1Deck.filter(word => word.includes("O")).length > 0 || player1Deck.filter(word => word.includes("C")).length > 1)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player1Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER1", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter1: true
                                    })
                                    console.log("shouldfilter1 played", shouldFilter1)
                                } else {
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...updatedPlayer1Deck],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        drawCardPile: [...copiedDrawCardPileArray]
                                    })
                                }
                                //send new state to server
                            }
                            else {
                                if(numberOfPlayedCard === '5' && (player1Deck.filter(word => word.includes("P")).length > 0 || player1Deck.filter(word => word.includes("O")).length > 0 || player1Deck.filter(word => word.includes("C")).length > 1)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player1Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER1", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter1: true
                                    })
                                    console.log("shouldfilter1 played", shouldFilter1)

                                }
                                else {

                                    //send new state to server
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard
                                    })
                                }
                            }
                        }
                        else {
                            //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                            //then update turn, currentColor and currentNumber
                            const removeIndex = player2Deck.indexOf(played_card)
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player2Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //make a copy of drawCardPile array
                                const copiedDrawCardPileArray = [...drawCardPile]
                                //pull out last two elements from it
                                const drawCard1 = copiedDrawCardPileArray.pop()
                                const drawCard2 = copiedDrawCardPileArray.pop()
                                const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                                updatedPlayer2Deck.push(drawCard1)
                                updatedPlayer2Deck.push(drawCard2)
                                !isSoundMuted && playShufflingSound()
                                if(numberOfPlayedCard === '5' && (player2Deck.filter(word => word.includes("P")).length > 0 || player2Deck.filter(word => word.includes("O")).length > 0 || player2Deck.filter(word => word.includes("C")).length > 0)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player2Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER 2", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter2: true
                                    })
                                    console.log("shouldfilter2 played", shouldFilter2)

                                } 
                                else {
                                    //send new state to server
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...updatedPlayer2Deck],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        drawCardPile: [...copiedDrawCardPileArray]
                                    })
                                }
                            }
                            else {
                                !isSoundMuted && playShufflingSound()
                                if(numberOfPlayedCard === '5' && (player2Deck.filter(word => word.includes("P")).length > 0 || player2Deck.filter(word => word.includes("O")).length > 0 || player2Deck.filter(word => word.includes("C")).length > 0)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player2Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER 2", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter2: true
                                    })
                                    console.log("shouldfilter2 played", shouldFilter2)

                                }
                                else {
                                    //send new state to server
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard
                                    })
                                }
                            }
                        }
                    }
                    //check for number match or
                    //fugivoro ou piscivoro ou onivoro ou parasita ou simbiose
                    else if(currentNumber === numberOfPlayedCard || (numberOfPlayedCard === '2' && (currentNumber === '4')) || 
                    (numberOfPlayedCard === '3' && (currentNumber === '1')) ||
                    (numberOfPlayedCard === '6' && (currentNumber !== '7' && currentNumber !== '0')) ||
                    (numberOfPlayedCard === '0' && (currentColor === 'P' || currentColor === 'L' || currentColor === 'B' || currentColor === 'R')) ||
                    (numberOfPlayedCard === '5' && (currentNumber === '1')) ||
                    (numberOfPlayedCard === '5' && (currentColor === 'P' || currentColor === 'L' || currentColor === 'B' || currentColor === 'R')) ||
                    (played_card === '1O1' && (currentColor === 'R' || currentColor === 'B' || currentColor === 'C' || currentColor === 'P' || currentColor === 'L'))) {
                        console.log('numbers matched!')
                        //check who played the card and return new state accordingly
                        if(cardPlayedBy === 'Player 1') {
                            //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                            //then update turn, currentColor and currentNumber
                            const removeIndex = player1Deck.indexOf(played_card)
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player1Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press zoo. You drew 2 cards as penalty.')
                                //make a copy of drawCardPile array
                                const copiedDrawCardPileArray = [...drawCardPile]
                                //pull out last two elements from it
                                const drawCard1 = copiedDrawCardPileArray.pop()
                                const drawCard2 = copiedDrawCardPileArray.pop()
                                const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                                updatedPlayer1Deck.push(drawCard1)
                                updatedPlayer1Deck.push(drawCard2)
                                !isSoundMuted && playShufflingSound()
                                //send new state to server
                                //check if its simbiose
                                if(numberOfPlayedCard === '5' && (player1Deck.filter(word => word.includes("P")).length > 0 || player1Deck.filter(word => word.includes("O")).length > 0 || player1Deck.filter(word => word.includes("C")).length > 1)) {
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...updatedPlayer1Deck],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        drawCardPile: [...copiedDrawCardPileArray],
                                        shouldFilter1: true
                                    })
                                }
                                else {
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...updatedPlayer1Deck],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        drawCardPile: [...copiedDrawCardPileArray]
                                    })
                                }
                            }
                            else {
                                !isSoundMuted && playShufflingSound()
                                //send new state to server
                                if(numberOfPlayedCard === '5' && (player1Deck.filter(word => word.includes("P")).length > 0 || player1Deck.filter(word => word.includes("O")).length > 0 || player1Deck.filter(word => word.includes("C")).length > 1)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player1Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER1", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter1: true
                                    })
                                    console.log("shouldfilter1 played", shouldFilter1)

                                }
                                else {
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player1Deck),
                                        winner: checkWinner(player1Deck, 'Player 1'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard
                                    })
                                }
                            }
                        }
                        else {
                            //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                            //then update turn, currentColor and currentNumber
                            const removeIndex = player2Deck.indexOf(played_card)
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player2Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //make a copy of drawCardPile array
                                const copiedDrawCardPileArray = [...drawCardPile]
                                //pull out last two elements from it
                                const drawCard1 = copiedDrawCardPileArray.pop()
                                const drawCard2 = copiedDrawCardPileArray.pop()
                                const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                                updatedPlayer2Deck.push(drawCard1)
                                updatedPlayer2Deck.push(drawCard2)
                                if(numberOfPlayedCard === '5' && (player2Deck.filter(word => word.includes("P")).length > 0 || player2Deck.filter(word => word.includes("O")).length > 0 || player2Deck.filter(word => word.includes("C")).length > 0)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player2Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER 2", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter2: true
                                    })
                                    console.log("shouldfilter2 played", shouldFilter2)

                                } 
                                else {
                                    !isSoundMuted && playShufflingSound()
                                    //send new state to server
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...updatedPlayer2Deck],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        drawCardPile: [...copiedDrawCardPileArray]
                                    })
                                }
                            }
                            else {
                                !isSoundMuted && playShufflingSound()
                                //send new state to server
                                if(numberOfPlayedCard === '5' && (player2Deck.filter(word => word.includes("P")).length > 0 || player2Deck.filter(word => word.includes("O")).length > 0 || player2Deck.filter(word => word.includes("C")).length > 0)) {
                                    console.log("entered if cards p, o, c")
                                    var test = player2Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el)))
                                    console.log("deck filtrado PLAYER 2", test);
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 2',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard,
                                        shouldFilter2: true
                                    })
                                    console.log("shouldfilter2 played", shouldFilter2)

                                }
                                else {
                                    socket.emit('updateGameState', {
                                        gameOver: checkGameOver(player2Deck),
                                        winner: checkWinner(player2Deck, 'Player 2'),
                                        turn: 'Player 1',
                                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                        currentColor: colorOfPlayedCard,
                                        currentNumber: numberOfPlayedCard
                                    })
                                }
                            }
                        }
                    }
                    //if no color or number match, invalid move - do not update state
                    else {
                        alert('Invalid Move!')
                    }
                    break;
                }
                
                //if card played was a draw 2 card
                case 'D2R': case 'D2G': case 'D2B': case 'D2Y': case 'D2C': case 'D2O': case 'D2P': case 'D2L':{
                    //extract color of played draw 2 card
                    const colorOfPlayedCard = played_card.charAt(2)
                    //check for color match
                    if(currentColor === colorOfPlayedCard) {
                        console.log('colors matched!')
                        //check who played the card and return new state accordingly
                        if(cardPlayedBy === 'Player 1') {
                            //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                            //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                            //then update currentColor and currentNumber - turn will remain same
                            const removeIndex = player1Deck.indexOf(played_card)
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player1Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //pull out last two elements from drawCardPile
                                const drawCard1X = copiedDrawCardPileArray.pop()
                                const drawCard2X = copiedDrawCardPileArray.pop()
                                const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                                updatedPlayer1Deck.push(drawCard1X)
                                updatedPlayer1Deck.push(drawCard2X)
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player1Deck),
                                    winner: checkWinner(player1Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player1Deck: [...updatedPlayer1Deck],
                                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                            else {
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player1Deck),
                                    winner: checkWinner(player1Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                        }
                        else {
                            //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                            //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                            //then update currentColor and currentNumber - turn will remain same
                            const removeIndex = player2Deck.indexOf(played_card)
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player2Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //pull out last two elements from drawCardPile
                                const drawCard1X = copiedDrawCardPileArray.pop()
                                const drawCard2X = copiedDrawCardPileArray.pop()
                                const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                                updatedPlayer2Deck.push(drawCard1X)
                                updatedPlayer2Deck.push(drawCard2X)
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player2Deck),
                                    winner: checkWinner(player2Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player2Deck: [...updatedPlayer2Deck],
                                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                            else {
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player2Deck),
                                    winner: checkWinner(player2Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                        }
                    }
                    //check for number match - if draw 2 card played on draw 2 card
                    else if(currentNumber === 252) {                        
                        console.log('number matched!')
                        //check who played the card and return new state accordingly
                        if(cardPlayedBy === 'Player 1') {
                            //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                            //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                            //then update currentColor and currentNumber - turn will remain same
                            const removeIndex = player1Deck.indexOf(played_card)
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player1Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //pull out last two elements from drawCardPile
                                const drawCard1X = copiedDrawCardPileArray.pop()
                                const drawCard2X = copiedDrawCardPileArray.pop()
                                const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                                updatedPlayer1Deck.push(drawCard1X)
                                updatedPlayer1Deck.push(drawCard2X)
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player1Deck),
                                    winner: checkWinner(player1Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player1Deck: [...updatedPlayer1Deck],
                                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                            else {
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player1Deck),
                                    winner: checkWinner(player1Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                        }
                        else {
                            //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                            //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                            //then update currentColor and currentNumber - turn will remain same
                            const removeIndex = player2Deck.indexOf(played_card)
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            //if two cards remaining check if player pressed zoo button
                            //if not pressed add 2 cards as penalty
                            if(player2Deck.length===2 && !iszooButtonPressed) {
                                alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                                //pull out last two elements from drawCardPile
                                const drawCard1X = copiedDrawCardPileArray.pop()
                                const drawCard2X = copiedDrawCardPileArray.pop()
                                const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                                updatedPlayer2Deck.push(drawCard1X)
                                updatedPlayer2Deck.push(drawCard2X)
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player2Deck),
                                    winner: checkWinner(player2Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player2Deck: [...updatedPlayer2Deck],
                                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                            else {
                                !isSoundMuted && playDraw2CardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player2Deck),
                                    winner: checkWinner(player2Deck, 'Player 1'),
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                    currentColor: colorOfPlayedCard,
                                    currentNumber: 252,
                                    drawCardPile: [...copiedDrawCardPileArray]
                                })
                            }
                        }
                    }
                    //if no color or number match, invalid move - do not update state
                    else {
                        alert('Invalid Move!')
                    }
                    break;
                }
                //if card played was a wild card
                case 'W1': {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        //ask for new color
                        const newColor = prompt('Cores: R = vermelho, G = verde, B = azul, Y = amarelo, C = cinza, O = laranja, P = rosa, L = azul claro. Entre a letra da cor:(R/G/B/Y/C/O/P/L)').toUpperCase()
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        const removeIndex = player1Deck.indexOf(played_card)
                        //then update turn, currentColor and currentNumber
                        //if two cards remaining check if player pressed zoo button
                        //if not pressed add 2 cards as penalty
                        if(player1Deck.length===2 && !iszooButtonPressed) {
                            alert('Oops! You forgot to press Zoo. You drew 2 cards as penalty.')
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1)
                            updatedPlayer1Deck.push(drawCard2)
                            !isSoundMuted && playWildCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                turn: 'Player 2',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                currentColor: newColor,
                                currentNumber: 300,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            if(currentColor === "C") { //if its a cnidario (gray), change turn order
                                console.log("cnidario com troca cor");
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player1Deck),
                                    winner: checkWinner(player1Deck, 'Player 1'),
                                    turn: 'Player 1',
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                    currentColor: newColor,
                                    currentNumber: 300
                                })
                            }
                            else {
                                console.log("troca cor");
                                !isSoundMuted && playWildCardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player1Deck),
                                    winner: checkWinner(player1Deck, 'Player 1'),
                                    turn: 'Player 2',
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                    currentColor: newColor,
                                    currentNumber: 300
                                })
                            }
                        }
                    }
                    else {
                        //ask for new color
                        const newColor = prompt('Cores: R = vermelho, G = verde, B = azul, Y = amarelo, C = cinza, O = laranja, P = rosa, L = azul claro. Entre a letra da cor:(R/G/B/Y/C/O/P/L)').toUpperCase()
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        const removeIndex = player2Deck.indexOf(played_card)
                        //then update turn, currentColor and currentNumber
                        //if two cards remaining check if player pressed zoo button
                        //if not pressed add 2 cards as penalty
                        if(player2Deck.length===2 && !iszooButtonPressed) {
                            alert('Oops! You forgot to press zoo. You drew 2 cards as penalty.')
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1)
                            updatedPlayer2Deck.push(drawCard2)
                            !isSoundMuted && playWildCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                turn: 'Player 1',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                currentColor: newColor,
                                currentNumber: 300,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            if(currentColor === "C") { //if its a cnidario (gray), change turn order
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player2Deck),
                                    winner: checkWinner(player2Deck, 'Player 2'),
                                    turn: 'Player 2',
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                    currentColor: newColor,
                                    currentNumber: 300
                                })
                            }
                            else {
                                !isSoundMuted && playWildCardSound()
                                //send new state to server
                                socket.emit('updateGameState', {
                                    gameOver: checkGameOver(player2Deck),
                                    winner: checkWinner(player2Deck, 'Player 2'),
                                    turn: 'Player 1',
                                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                    player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                    currentColor: newColor,
                                    currentNumber: 300
                                })
                            }
                        }
                    }
                    break;
                }
                //if card played was a draw four wild card
                case 'D4W': {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        //ask for new color
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        const removeIndex = player1Deck.indexOf(played_card)
                        //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last four elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        const drawCard3 = copiedDrawCardPileArray.pop()
                        const drawCard4 = copiedDrawCardPileArray.pop()
                        //then update currentColor and currentNumber - turn will remain same
                        //if two cards remaining check if player pressed zoo button
                        //if not pressed add 2 cards as penalty
                        if(player1Deck.length===2 && !iszooButtonPressed) {
                            alert('Oops! You forgot to press zoo. You drew 2 cards as penalty.')
                            //pull out last two elements from drawCardPile
                            const drawCard1X = copiedDrawCardPileArray.pop()
                            const drawCard2X = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1X)
                            updatedPlayer1Deck.push(drawCard2X)
                            !isSoundMuted && playDraw4CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                                //currentColor: newColor,
                                currentNumber: 600,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playDraw4CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                              //  currentColor: newColor,
                                currentNumber: 600,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                    }
                    else {
                        //ask for new color
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        const removeIndex = player2Deck.indexOf(played_card)
                        //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last four elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        const drawCard3 = copiedDrawCardPileArray.pop()
                        const drawCard4 = copiedDrawCardPileArray.pop()
                        //then update currentColor and currentNumber - turn will remain same
                        !isSoundMuted && playDraw4CardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player2Deck),
                            winner: checkWinner(player2Deck, 'Player 2'),
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                            player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                          // currentColor: newColor,
                            currentNumber: 600,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })
                        //if two cards remaining check if player pressed zoo button
                        //if not pressed add 2 cards as penalty
                        if(player2Deck.length===2 && !iszooButtonPressed) {
                            alert('Oops! You forgot to press zoo. You drew 2 cards as penalty.')
                            //pull out last two elements from drawCardPile
                            const drawCard1X = copiedDrawCardPileArray.pop()
                            const drawCard2X = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1X)
                            updatedPlayer2Deck.push(drawCard2X)
                            !isSoundMuted && playDraw4CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                               // currentColor: newColor,
                                currentNumber: 600,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playDraw4CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                               // currentColor: newColor,
                                currentNumber: 600,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                    }
                }
                break;
            }
        }
        
    }


    const onCardDrawnOR1Handler = (played_card) => {
        //extract player who drew the card
        const cardDrawnBy = turn

        //check who drew the card and return new state accordingly
        if(cardDrawnBy === 'Player 1') {
            const removeIndex = player1Deck.indexOf(played_card)
            var player1NewDeck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)];
            //remove 1 new card from drawCardPile and add it to player1's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]

            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()

            //extract number and color of drawn card
            const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)

            let numberOfDrawnCard = drawCard.charAt(0)

            if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y' || drawCard === 'D2C' || drawCard === 'D2O' || drawCard === 'D2P' || drawCard === 'D2L')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray],
                    turn: 'Player 1',
                    player1Deck: player1NewDeck,
                })
            }
            else if(drawCard === 'W1') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
                const newColor = prompt('Cores: R = vermelho, G = verde, B = azul, Y = amarelo, C = cinza, O = laranja, P = rosa, L = azul claro. Entre a letra da cor:(R/G/B/Y/C/O/P/L)').toUpperCase()
                !isSoundMuted && playWildCardSound()
                //send new state to server
                if(currentColor === "C") { 
                    socket.emit('updateGameState', {
                        turn: 'Player 1',
                        player1Deck: player1NewDeck,
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
                else {     
                    socket.emit('updateGameState', {
                        turn: 'Player 2',
                        player1Deck: player1NewDeck,
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
            }
            else if(drawCard === 'D4W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
               // const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                   // currentColor: newColor,
                    currentNumber: 600,
                    drawCardPile: [...copiedDrawCardPileArray],
                    turn: 'Player 1',
                    player1Deck: player1NewDeck,
                })
            }
            //if not action card - check if drawn card is playable
            //check for number match or
            //fugivoro ou piscivoro ou onivoro ou parasita 
            else if(numberOfDrawnCard === currentNumber || colorOfDrawnCard === currentColor 
                || (numberOfDrawnCard === '2' && (currentNumber === '4')) || 
                (numberOfDrawnCard === '3' && (currentNumber === '1')) ||
                (numberOfDrawnCard === '6' && (currentNumber !== '7' && currentNumber !== '0')) ||
                (numberOfDrawnCard === '0' && (currentColor === 'P' || currentColor === 'L' || currentColor === 'B' || currentColor === 'R'))) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: numberOfDrawnCard,
                    drawCardPile: [...copiedDrawCardPileArray],
                    turn: 'Player 1',
                    player1Deck: player1NewDeck,
                })
            }
            //else add the drawn card to player1's deck
            else {
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    player1Deck: [...player1NewDeck.slice(0, player1NewDeck.length), drawCard, ...player1NewDeck.slice(player1NewDeck.length)],
                    drawCardPile: [...copiedDrawCardPileArray],
                })
            }
        }
        else { //player 2
            const remove2Index = player2Deck.indexOf(played_card)
            var player2NewDeck = [...player2Deck.slice(0, remove2Index), ...player2Deck.slice(remove2Index + 1)];

            //remove 1 new card from drawCardPile and add it to player2's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            //extract number and color of drawn card
            const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
            let numberOfDrawnCard = drawCard.charAt(0)
            if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y' || drawCard === 'D2C' || drawCard === 'D2O' || drawCard === 'D2P' || drawCard === 'D2L')) {
                alert(`You drew ${drawCard}. It was played for you.`)

                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray],
                    turn: 'Player 2',
                    player2Deck: player2NewDeck,
                })
            }
            else if(drawCard === 'W1') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
                const newColor = prompt('Cores: R = vermelho, G = verde, B = azul, Y = amarelo, C = cinza, O = laranja, P = rosa, L = azul claro. Entre a letra da cor:(R/G/B/Y/C/O/P/L)').toUpperCase()
                !isSoundMuted && playWildCardSound()
                //send new state to server
                if(currentColor === "C") { 
                    socket.emit('updateGameState', {
                        turn: 'Player 2',
                        player2Deck: player2NewDeck,
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
                else {
                    socket.emit('updateGameState', {
                        turn: 'Player 1',
                        player2Deck: player2NewDeck,
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
                
            }
            else if(drawCard === 'D4W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
                //const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                   // currentColor: newColor,
                    currentNumber: 600,
                    drawCardPile: [...copiedDrawCardPileArray],
                    turn: 'Player 2',
                    player2Deck: player2NewDeck
                })
            }
            //if not action card - check if drawn card is playable
            //check for number match or color match
            //fugivoro ou piscivoro ou onivoro ou parasita 
            else if(numberOfDrawnCard === currentNumber || colorOfDrawnCard === currentColor 
                || (numberOfDrawnCard === '2' && (currentNumber === '4')) || 
                (numberOfDrawnCard === '3' && (currentNumber === '1')) ||
                (numberOfDrawnCard === '6' && (currentNumber !== '7' && currentNumber !== '0')) ||
                (numberOfDrawnCard === '0' && (currentColor === 'P' || currentColor === 'L' || currentColor === 'B' || currentColor === 'R'))) {

                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: numberOfDrawnCard,
                    drawCardPile: [...copiedDrawCardPileArray],
                    player2Deck: player2NewDeck,
                })
            }
            //else add the drawn card to player2's deck
            else {
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    player2Deck: [...player2NewDeck.slice(0, player2Deck.length), drawCard, ...player2NewDeck.slice(player2Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
        }
    }

    
    const onCardDrawnHandler = () => {
        //extract player who drew the card
        const cardDrawnBy = turn
        //check who drew the card and return new state accordingly
        if(cardDrawnBy === 'Player 1') {
            //remove 1 new card from drawCardPile and add it to player1's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            console.log("drawn card:", drawCard);
            let colorOfDrawnCard;
            let numberOfDrawnCard;
            //extract number and color of drawn card
            if(!isNumber(drawCard.charAt(1))){
                colorOfDrawnCard = drawCard.charAt(1)
                numberOfDrawnCard = drawCard.charAt(0)
            }
            else if(drawCard.charAt(1) === "2") {
                colorOfDrawnCard = drawCard.charAt(2)
                numberOfDrawnCard = 252
            }
            else if(drawCard.charAt(1) === "4"){
                colorOfDrawnCard = drawCard.charAt(2)
                numberOfDrawnCard = 600
            }
            else {
                colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
                numberOfDrawnCard = drawCard.charAt(0)
            }

            console.log("color drawn card:", colorOfDrawnCard);
            console.log("numberOfDrawnCard drawn card:", numberOfDrawnCard);
            //acho que falta o caso em que o numero da carta eh 252 e a carta jogada eh uma dessas ai
            //TESTARRRRRRRRRRRRRRRRRR
            if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y' || drawCard === 'D2C' || drawCard === 'D2O' || drawCard === 'D2P' || drawCard === 'D2L')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou d2");
                //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if(drawCard === 'W1') {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou w1");
                //ask for new color
                const newColor = prompt('Cores: R = vermelho, G = verde, B = azul, Y = amarelo, C = cinza, O = laranja, P = rosa, L = azul claro. Entre a letra da cor:(R/G/B/Y/C/O/P/L)').toUpperCase()
                !isSoundMuted && playWildCardSound()
                //send new state to server
                if(currentColor === "C") { //if its a cnidario (gray), change turn order
                    socket.emit('updateGameState', {
                        turn: 'Player 1',
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                } 
                else {
                    socket.emit('updateGameState', {
                        turn: 'Player 2',
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
                
            }
            else if(drawCard === 'D4W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou d4");
                //ask for new color
                //const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                    //currentColor: newColor,
                    currentNumber: 600,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //if not action card - check if drawn card is playable
            //check for number match or
            //fugivoro ou piscivoro ou onivoro ou parasita 
            else if(numberOfDrawnCard === currentNumber || colorOfDrawnCard === currentColor 
                || (numberOfDrawnCard === '2' && (currentNumber === '4')) || 
                (numberOfDrawnCard === '3' && (currentNumber === '1')) ||
                (numberOfDrawnCard === '6' && (currentNumber !== '7' && currentNumber !== '0')) ||
                (numberOfDrawnCard === '0' && (currentColor === 'P' || currentColor === 'L' || currentColor === 'B' || currentColor === 'R'))) {
                alert(`You drew ${drawCard} aqui. It was played for you.`)
                console.log("comrprou cor ou numero igual")
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: numberOfDrawnCard,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //else add the drawn card to player1's deck
            else {
                !isSoundMuted && playShufflingSound()
                console.log("adicionou no deck")
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard, ...player1Deck.slice(player1Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
        }
        else {
            //remove 1 new card from drawCardPile and add it to player2's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            console.log("drawn card:", drawCard);
            let colorOfDrawnCard;
            let numberOfDrawnCard;
            //extract number and color of drawn card
            if(!isNumber(drawCard.charAt(1))){
                colorOfDrawnCard = drawCard.charAt(1)
                numberOfDrawnCard = drawCard.charAt(0)
            }
            else if(drawCard.charAt(1) === "2") {
                colorOfDrawnCard = drawCard.charAt(2)
                numberOfDrawnCard = 252
            }
            else if(drawCard.charAt(1) === "4"){
                colorOfDrawnCard = drawCard.charAt(2)
                numberOfDrawnCard = 600
            }
            else {
                colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
                numberOfDrawnCard = drawCard.charAt(0)
            }
        
            console.log("color drawn card:", colorOfDrawnCard);
            console.log("numberOfDrawnCard drawn card:", numberOfDrawnCard);
            if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y'|| drawCard === 'D2C' || drawCard === 'D2O' || drawCard === 'D2P' || drawCard === 'D2L')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou d2");
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if(drawCard === 'W1') {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou w1");
                //ask for new color
                const newColor = prompt('Cores: R = vermelho, G = verde, B = azul, Y = amarelo, C = cinza, O = laranja, P = rosa, L = azul claro. Entre a letra da cor:(R/G/B/Y/C/O/P/L)').toUpperCase()
                !isSoundMuted && playWildCardSound()
                //send new state to server
                if(currentColor === "C") { //if its a cnidario (gray), change turn order
                    socket.emit('updateGameState', {
                        turn: 'Player 2',
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
                else {
                    socket.emit('updateGameState', {
                        turn: 'Player 1',
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                        currentColor: newColor,
                        currentNumber: 300,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                }
                
            }
            else if(drawCard === 'D4W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou d4");
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                   // currentColor: newColor,
                    currentNumber: 600,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //if not action card - check if drawn card is playable
            //check for number match or
            //fugivoro ou piscivoro ou onivoro ou parasita 
            else if(numberOfDrawnCard === currentNumber || colorOfDrawnCard === currentColor 
                || (numberOfDrawnCard === '2' && (currentNumber === '4')) || 
                (numberOfDrawnCard === '3' && (currentNumber === '1')) ||
                (numberOfDrawnCard === '6' && (currentNumber !== '7' && currentNumber !== '0')) ||
                (numberOfDrawnCard === '0' && (currentColor === 'P' || currentColor === 'L' || currentColor === 'B' || currentColor === 'R'))) {
                alert(`You drew ${drawCard}. It was played for you.`)
                console.log("comprou cor ou num igual");
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: numberOfDrawnCard,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //else add the drawn card to player2's deck
            else {
                !isSoundMuted && playShufflingSound()
                console.log("pos no deck");
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard, ...player2Deck.slice(player2Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
        }
    }
    
    function isNumber(char) {
        return /^\d$/.test(char);
    }


    return (
        <div className={`Game`}>
            <Header/>
            {(!roomFull) ? <>

                <div className='topInfo'>
                    <h1>Código da partida: {room}</h1>
                </div>  

                {/* PLAYER LEFT MESSAGES */}
                {users.length===1 && currentUser === 'Player 2' && <h1 className='topInfoText'>Player 1 has left the game.</h1> }
                {users.length===1 && currentUser === 'Player 1' && <h1 className='topInfoText'>Aguardando jogador 2 juntar-se a partida.</h1> }

                {users.length===2 && <>

                    {gameOver ? <div>{winner !== '' && <><h1>GAME OVER</h1><h2>{winner} wins!</h2></>}</div> :
                    <div>
                        
                        {/* PLAYER 1 VIEW */}
                        {currentUser === 'Player 1' && <>
                        <div className='col originRow'>
                            <div className='d-flex origin-text'>
                                <span className='fs-4'>Carta de Origem:</span>
                                <span className='fs-6'>Quantas vezes foi usada: {origin2TimesUsed}</span>            
                            </div>
                            {playedCardsPile && playedCardsPile.length>0 &&
                                <img
                                className='CardOrigin'
                                onClick={() => onCardPlayedHandler(player2Origin)}
                                src={require(`../assets/origin-cards/${player2Origin}.svg`).default}
                                /> }  
                        </div>    
                        <div className='player2Deck' style={{pointerEvents: 'none'}}>
                            <p className='playerDeckText'>Player 2</p>
                            {player2Deck.map((item, i) => (
                                <img
                                    key={i}
                                    className='opponentCard'
                                    onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../assets/card-back.png`).default}
                                    />
                            ))}
                            {turn==='Player 2' && <Spinner />}
                        </div>
                        <br />
                        <div className='middleInfo' style={turn === 'Player 2' ? {pointerEvents: 'none'} : null}>
                            <button className='game-button' disabled={turn !== 'Player 1'} onClick={onCardDrawnHandler}>Comprar Carta</button>
                            <div className='middle-card-container'>
                                {playedCardsPile && playedCardsPile.length>0 && !isNumber(currentColor) &&
                                    <img className='selected-color' src={require(`../assets/colors/${currentColor}.svg`).default} ></img>
                                }
                                {playedCardsPile && playedCardsPile.length>0 &&
                                <img
                                    className='Card'
                                    src={require(`../assets/cards-zoo/${playedCardsPile[playedCardsPile.length-1]}.svg`).default}
                                    /> }
                                {playedCardsPile && playedCardsPile.length>0 && !isNumber(currentColor) &&
                                    <img className='selected-color' src={require(`../assets/colors/${currentColor}.svg`).default} ></img>
                                }
                            </div>
                            <button className='game-button orange' disabled={player1Deck.length !== 2} onClick={() => {
                                setzooButtonPressed(!iszooButtonPressed)
                                playzooSound()
                            }}>Zoo</button>
                        </div>
                        <br />
                        <OverlayScrollbarsComponent>
                            <div className='player1Deck' id="p1" style={turn === 'Player 1' ? null : {pointerEvents: 'none'}}>
                                <p className='playerDeckText'>Player 1</p>
                                {shouldFilter1 && <>
                                {player1Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el))).map((item, i) => (
                                            <img
                                            key={i}
                                            className='Card'
                                            onClick={() => onSimbiosePlayed(item)}
                                            src={require(`../assets/cards-zoo/${item}.svg`).default}
                                            />
                                        ))}</>}
                                {shouldFilter1 !== true && <>
                                            {player1Deck.map((item, i) => (
                                    <img
                                        key={i}
                                        className='Card'
                                        onClick={() => onCardPlayedHandler(item)}
                                        src={require(`../assets/cards-zoo/${item}.svg`).default}
                                        />
                                ))} </>}
                                    
                            </div>
                        </OverlayScrollbarsComponent>

                        <div class="modal fade" id="OR1modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="OR1modalLabel" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="OR1modalLabel">Selecione carta a descartar:</h5>
                                    </div>
                                    <div class="modal-body">
                                        {player1Deck.filter(word => word.includes("R")).length > 0 && <>
                                        {player1Deck.filter(word => word.includes("R")).map((item, i) => (
                                            <a data-bs-dismiss="modal"><img
                                                key={i}
                                                className='Card'
                                                onClick={() => onCardDrawnOR1Handler(item)}
                                                src={require(`../assets/cards-zoo/${item}.svg`).default}
                                                /></a>
                                        ))} </>}       
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                    </div>
                                </div>
                            </div>
                        </div>        


                        <div className='col originRow'>
                            <div className='d-flex origin-text'>
                                <span className='fs-4'>Carta de Origem:</span>
                                <span className='fs-6'>Quantas vezes foi usada: {origin1TimesUsed}</span>            
                            </div>
                            
                            {playedCardsPile && playedCardsPile.length>0 &&
                                <img
                                className='CardOrigin'
                                src={require(`../assets/origin-cards/${player1Origin}.svg`).default}
                                /> }
                                {turn !== 'Player 1' &&
                                    <button type="button" class="btn btn-dark pl-2" disabled onClick={() => onCardPlayedHandler(player1Origin)}>Usar efeito</button>
                                }
                                {turn === 'Player 1' && origin1TimesUsed <= 3 && player1Deck.filter(word => word.includes("R")).length > 0 &&
                                    <button type="button" class="btn btn-dark pl-2" onClick={() => onCardPlayedHandler(player1Origin)} data-bs-toggle="modal" data-bs-target="#OR1modal">Usar efeito</button>
                                }
                        </div>
                        </> }

                        {/* PLAYER 2 VIEW */}
                        {currentUser === 'Player 2' && <>
                        <div className='col originRow justify-content-evenly'>
                            <div className='d-flex origin-text'>
                                <span className='fs-4'>Carta de Origem:</span>
                                <span className='fs-6'>Quantas vezes foi usada: {origin1TimesUsed}</span>            
                            </div>
                            {playedCardsPile && playedCardsPile.length>0 &&
                                <img
                                className='CardOrigin'
                                onClick={() => onCardPlayedHandler(player1Origin)}
                                src={require(`../assets/origin-cards/${player1Origin}.svg`).default}
                                /> }
                        </div>
                        <div className='player1Deck' style={{pointerEvents: 'none'}}>
                            <p className='playerDeckText'>Player 1</p>
                            {player1Deck.map((item, i) => (
                                <img
                                    key={i}
                                    className='opponentCard'
                                    onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../assets/card-back.png`).default}
                                    />
                            ))}
                            {turn==='Player 1' && <Spinner />}
                        </div>
                        <br />
                        <div className='middleInfo' style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
                            <button className='game-button' disabled={turn !== 'Player 2'} onClick={onCardDrawnHandler}>Comprar Carta</button>
                            <div className='middle-card-container'>
                                {playedCardsPile && playedCardsPile.length>0 && !isNumber(currentColor) && currentColor !== "" && 
                                    <img className='selected-color' src={require(`../assets/colors/${currentColor}.svg`).default} ></img>}
                                {playedCardsPile && playedCardsPile.length>0 &&
                                    <img
                                        className='Card'
                                        src={require(`../assets/cards-zoo/${playedCardsPile[playedCardsPile.length-1]}.svg`).default}
                                        /> }
                                {playedCardsPile && playedCardsPile.length>0 && !isNumber(currentColor) && currentColor !== "" && 
                                    <img className='selected-color' src={require(`../assets/colors/${currentColor}.svg`).default} ></img>}
                            </div>
                            <button className='game-button orange' disabled={player2Deck.length !== 2} onClick={() => {
                                setzooButtonPressed(!iszooButtonPressed)
                                playzooSound()
                            }}>Zoo</button>
                        </div>
                        <br />
                        <OverlayScrollbarsComponent className="direction-rtl">
                            <div className='player2Deck' id="p2" style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
                                <p className='playerDeckText'>Player 2</p>
                                {shouldFilter2 && <>
                                {player2Deck.filter(word => ["P", "O", "C"].some(el => word.includes(el))).map((item, i) => (
                                            <img
                                            key={i}
                                            className='Card'
                                            onClick={() => onSimbiosePlayed(item)}
                                            src={require(`../assets/cards-zoo/${item}.svg`).default}
                                            />
                                        ))}</>}
                                {shouldFilter2 !== true && <>
                                            {player2Deck.map((item, i) => (
                                    <img
                                        key={i}
                                        className='Card'
                                        onClick={() => onCardPlayedHandler(item)}
                                        src={require(`../assets/cards-zoo/${item}.svg`).default}
                                        />
                                ))} </>}
                            </div>
                        </OverlayScrollbarsComponent>
                        <div class="modal fade" id="OR1modalP2" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="OR1modalP2Label" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="OR1modalP2Label">Selecione carta a descartar:</h5>
                                    </div>
                                    <div class="modal-body">
                                        {player2Deck.filter(word => word.includes("R")).length > 0 && <>
                                        {player2Deck.filter(word => word.includes("R")).map((item, i) => (
                                            <a data-bs-dismiss="modal"><img
                                                key={i}
                                                className='Card'
                                                onClick={() => onCardDrawnOR1Handler(item)}
                                                src={require(`../assets/cards-zoo/${item}.svg`).default}
                                                /></a>
                                        ))} </>}       
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                    </div>
                                </div>
                            </div>
                        </div>        

                        <div className='col originRow'>
                        <div className='d-flex origin-text'>
                                <span className='fs-4'>Carta de Origem:</span>
                                <span className='fs-6'>Quantas vezes foi usada: {origin2TimesUsed}</span>            
                            </div>
                            
                            {playedCardsPile && playedCardsPile.length>0 &&
                                <img
                                className='CardOrigin'
                                onClick={() => onCardPlayedHandler(player2Origin)}
                                src={require(`../assets/origin-cards/${player2Origin}.svg`).default}
                                /> }
                                {turn !== 'Player 2' &&
                                    <button type="button" class="btn btn-dark pl-2" disabled onClick={() => onCardPlayedHandler(player2Origin)}>Usar efeito</button>
                                }
                                {turn === 'Player 2' && origin2TimesUsed <= 3 && player2Deck.filter(word => word.includes("R")).length > 0 &&
                                    <button type="button" class="btn btn-dark pl-2" onClick={() => onCardPlayedHandler(player2Origin)} data-bs-toggle="modal" data-bs-target="#OR1modalP2">Usar efeito</button>
                                }
                        </div>
                        </> }
                    </div> }
                </> }
            </> : <h1>Room full</h1> }

            <br />
            <a href='/'><button type="button" class="btn btn-danger">Sair</button></a>
        </div>
    )
}

export default Game