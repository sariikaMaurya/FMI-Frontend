import React, { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import api from '../services/api'
import useAuth from '../hooks/useAuth'

export default function Chat(){
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [other, setOther] = useState('')
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting')
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const activeOtherRef = useRef('')

  const currentUserId = user?.id || user?._id
  const trimmedOther = other.trim()
  const trimmedText = text.trim()
  const selectedUser = users.find(item => String(item._id) === String(trimmedOther))

  const normalizeMessage = (message) => ({
    from: message.from || message.senderId,
    to: message.to || message.receiverId,
    message: message.message || '',
    image: message.image,
    _id: message._id || `${Date.now()}-${Math.random()}`,
    timestamp: message.timestamp || new Date().toISOString()
  })

  const appendMessage = (message) => {
    setMsgs(prev => prev.some(item => String(item._id) === String(message._id)) ? prev : [...prev, message])
  }

  const sortedMessages = useMemo(() => {
    return [...msgs].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
  }, [msgs])

  useEffect(() => {
    activeOtherRef.current = trimmedOther
  }, [trimmedOther])

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true)
      try {
        const res = await api.get('/chats/users/list')
        const list = res.data || []
        setUsers(list)
        if (!trimmedOther && list[0]?._id) loadHistory(list[0]._id)
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || 'Users not load')
      } finally {
        setUsersLoading(false)
      }
    }
    loadUsers()
  }, [])

  useEffect(()=>{
    const token = localStorage.getItem('fm_token')
    if(!token) return
    const socketUrl = import.meta.env.VITE_API_URL || '/'
    const s = io(socketUrl, { auth: { token } })
    socketRef.current = s
    s.on('connect', () => setConnectionStatus('Online'))
    s.on('disconnect', () => setConnectionStatus('Offline'))
    s.on('connect_error', () => setConnectionStatus('Offline'))
    s.on('private_message', (m)=>{
      const incoming = normalizeMessage(m)
      const activeOther = activeOtherRef.current
      const belongsToActiveChat = String(incoming.from) === String(activeOther) || String(incoming.to) === String(activeOther)
      if (belongsToActiveChat) appendMessage(incoming)
      else toast.info('New message received.')
    })
    s.on('private_message_error', (err) => {
      toast.error(err?.message || 'Message not send')
    })
    return ()=> s.disconnect()
  },[])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sortedMessages.length])

  const loadHistory = async (userId = trimmedOther)=>{
    const receiverId = String(userId || '').trim()
    if(!receiverId) return
    setOther(receiverId)
    setLoading(true)
    try{
      const res = await api.get(`/chats?with=${encodeURIComponent(receiverId)}`)
      setMsgs((res.data || []).map(normalizeMessage))
    }catch(e){
      console.error(e)
      toast.error(e.response?.data?.message || 'Chat history not load')
    } finally {
      setLoading(false)
    }
  }

  const send = (e)=>{
    e.preventDefault()
    if(!trimmedOther) {
      toast.warning('For chat Select the user.')
      return
    }
    if(!trimmedText) return
    if(!socketRef.current || !socketRef.current.connected) {
      toast.error('Chat is not connect to the server.')
      return
    }

    const outgoing = normalizeMessage({
      from: currentUserId,
      to: trimmedOther,
      message: trimmedText,
      timestamp: new Date().toISOString()
    })
    socketRef.current.emit('private_message', { to: trimmedOther, message: trimmedText })
    appendMessage(outgoing)
    setText('')
  }

  return (
    <div className="chat-page">
      <div className="container">
        <div className="chat-toolbar">
          <div>
            <span className="eyebrow chat-eyebrow">FarmTrade Connect</span>
            <h1>Chat</h1>
            <p>Manage the quick conversion between Buyer and seller.</p>
          </div>
          <div className={`chat-status ${connectionStatus.toLowerCase()}`}>
            <span></span>
            {connectionStatus}
          </div>
        </div>

        <div className="chat-layout">
          <aside className="chat-side">
            <div className="chat-profile">
              <div className="chat-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <strong>{user?.name || 'Your account'}</strong>
                <small>{user?.role || 'User'}</small>
              </div>
            </div>

            <div className="chat-side-heading">
              <strong>Users</strong>
              <span>{users.length}</span>
            </div>
            <div className="chat-user-list">
              {usersLoading && <div className="loading-state compact">Loading users...</div>}
              {!usersLoading && users.length === 0 && <div className="empty-state compact">No users available</div>}
              {!usersLoading && users.map(item => (
                <button
                  type="button"
                  className={`chat-user ${String(item._id) === String(trimmedOther) ? 'active' : ''}`}
                  key={item._id}
                  onClick={() => loadHistory(item._id)}
                >
                  <span className="chat-avatar small">{(item.name || 'U').charAt(0).toUpperCase()}</span>
                  <span>
                    <strong>{item.name || 'User'}</strong>
                    <small>{item.role} - {item.email}</small>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="chat-panel">
            <div className="chat-panel-header">
              <div>
                <strong>{selectedUser?.name || (trimmedOther ? 'Active conversation' : 'No user selected')}</strong>
                <small>{selectedUser ? `${selectedUser.role} - ${selectedUser.email}` : 'Select a user'}</small>
              </div>
              <span>{sortedMessages.length} messages</span>
            </div>

            <div className="chat-messages" aria-live="polite">
              {loading && <div className="loading-state">Loading messages...</div>}

              {!loading && sortedMessages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">...</div>
                  <strong>No messages yet</strong>
                  <span>{trimmedOther ? 'First send the message.' : 'Select User.'}</span>
                </div>
              )}

              {!loading && sortedMessages.map((m) => {
                const isMine = String(m.from) === String(currentUserId)
                return (
                  <div className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`} key={m._id}>
                    <div className="chat-bubble">
                      <div className="chat-bubble-meta">
                        <span>{isMine ? 'You' : (selectedUser?.name || 'User')}</span>
                        <time>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</time>
                      </div>
                      <p>{m.message}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-composer" onSubmit={send}>
              <input
                className="form-control"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={trimmedOther ? `Message ${selectedUser?.name || 'user'}` : 'Select a user'}
                disabled={!trimmedOther}
              />
              <button className="btn btn-primary" type="submit" disabled={!trimmedOther || !trimmedText}>
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
