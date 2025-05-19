import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate() 

  return (
    <div>
      <button  className='text-5xl text-white' onClick={() => navigate('/register')}> 
        Go Register Page
      </button>
    </div>
  )
}

export default Home
