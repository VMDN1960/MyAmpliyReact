import { useEffect, useState } from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { generateClient } from 'aws-amplify/data'
import type { AuthUser } from 'aws-amplify/auth'
import type { Schema } from '../amplify/data/resource'
import './App.css'

const client = generateClient<Schema>()

type Todo = Schema['Todo']['type']

interface TodosProps {
  user?: AuthUser
  signOut?: () => void
}

function Todos({ user, signOut }: TodosProps) {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos([...items]),
    })
    return () => sub.unsubscribe()
  }, [])

  function createTodo() {
    const content = window.prompt('Todo content')
    if (content) client.models.Todo.create({ content })
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main style={{ padding: '2rem', textAlign: 'left' }}>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)} style={{ cursor: 'pointer' }}>
            {todo.content}
          </li>
        ))}
      </ul>
      <p>Click a todo to delete it.</p>
      <button onClick={signOut}>Sign out</button>
    </main>
  )
}

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => <Todos user={user} signOut={signOut} />}
    </Authenticator>
  )
}

export default App
