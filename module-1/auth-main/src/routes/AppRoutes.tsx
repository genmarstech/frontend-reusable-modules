import React from 'react'
import { Route, Routes } from 'react-router'
import Home from '../pages/Home'
import Intro from '../components/modules/Intro'
import RegistrationForm from '../components/forms/module-1'
import LoginModule1 from '../components/authentication/login-module-1'

function AppRoutes() {
  return (
    <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/intro' element={<Intro />}/>
        <Route path='/module-1' element={<RegistrationForm />}/>
        <Route path='/login-module' element={<LoginModule1 />}/>

    </Routes>
  )
}

export default AppRoutes