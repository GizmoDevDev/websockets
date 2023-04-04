import { useState } from 'react'
import './App.css'

type Message = {
  name: string,
  text: string,
  isOur: boolean,
} | {
  name: string,
}

function App() {
  const [ws, setWS] = useState<WebSocket | null>(null)
  const [input, setInput] = useState('')
  const [name, setName] = useState('Biba')
  const [messages, setMessages] = useState<Message[]>([])

  const handleConnectButtonClick = () => {
    if (ws) return;
    const webSocket = new WebSocket('ws://localhost:4000')
    webSocket.onopen = () => {
      console.log('ws open')
      setWS(webSocket)
      webSocket.send(JSON.stringify({type: 'Connect', payload: { name }}))
    }

    webSocket.onclose = () => {
      console.log('ws close')
      setWS(null)
    }

    webSocket.onmessage = (event) => {
      const evData = JSON.parse(event.data)
      switch(evData.type) {
        case 'Connect':
          setMessages((prev) => [
            ...prev,
            { name: evData.payload.name }
          ])
          break;
        case 'Message':
          setMessages((prev) => [
            ...prev,
            { name: evData.payload.name, text: evData.payload.message, isOur: false }
          ])
          break;
        default:
          console.log('UNKNOWN EVENT')
      }
    }
  }

  const handleCloseButtonClick = () => {
    if (!ws) return;
    ws.close();
  }

  const handleSendMessage = () => {
    if (!ws) return;
    ws.send(JSON.stringify({type: 'Message', payload: {name, message: input}}));
    setMessages((prev) => [...prev, { name, text: input, isOur: true }]);
    setInput('');
  }

  return (
    <div className="App">
      Name: <input value={name} onChange={({target}) => setName(target.value)} /><br />
      {messages.map((message) => (<p>
          { 'isOur' in message
            ? <>{message.isOur ? (<b>{message.name}</b>) : message.name}: {message.text}</>
            : <i>{message.name} was connected</i>}
      </p>))}

      <input value={input} onChange={({target}) => setInput(target.value)} />
      <button disabled={!ws} onClick={handleSendMessage}>Send</button>
        <br />
      <button disabled={Boolean(ws)} onClick={handleConnectButtonClick}>Connect</button>
      <button disabled={!ws} onClick={handleCloseButtonClick}>Disconnect</button>
    </div>
  )
}

export default App
