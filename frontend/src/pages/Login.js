import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import logo from '../assets/logo.png';
import '../pages/css/Login.css';

function Login() {
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo({ ...loginInfo, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        createStarSparkles(e);
    
        const { email, password } = loginInfo;
        if (!email || !password) return handleError('Email and password are required');
    
        try {
            console.log(loginInfo);
            const response = await fetch(`http://localhost:8080/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginInfo),
            });
            const result = await response.json();
            console.log('Login result:', result); 

            const { success, message, jwtToken, name, employeeId, error } = result;

            if (success) {
                handleSuccess(message);
                console.log('JWT Token:', jwtToken);
                localStorage.setItem('token', jwtToken);
                console.log('Stored token:', localStorage.getItem('token')); 
                localStorage.setItem('loggedInUser', JSON.stringify({ name, email, employeeId }));
                console.log('Token stored in localStorage:', localStorage.getItem('token'));
                setTimeout(() => navigate('/projects'), 1000);
            } else {
                handleError(error?.details[0]?.message || message);
            }
        } catch (err) {
            handleError('An error occurred during login');
            console.error('Login error:', err); 
        }
    };

    const createStarSparkles = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();

        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * rect.width}px`;
            sparkle.style.top = `${Math.random() * rect.height}px`;

            button.appendChild(sparkle);
            sparkle.addEventListener('animationend', () => sparkle.remove());
        }
    };

    return (
        <div>
            <header className='header'>
                <div className='header-left'>
                    <img src={logo} alt='Company Logo' className='header-logo' />
                    <h1 className='header-title'>KANEXUS</h1>
                </div>
            </header>

            <div className='container'>
                <div className='left-panel'>
                    <h1>Welcome Back, User!</h1><br />
                    <p>Enter your personal details to use all site features</p><br /><br /><br /><br /><br />
                    <p style={{ color: 'red' }}>Don't have an account?</p>
                    <button onClick={() => navigate('/signup')}>SIGN UP</button>
                </div>

                <div className='right-panel'>
                    <h1>LOGIN</h1>
                    <div className='circles'>
                        <i></i><i></i><i></i><i></i>
                    </div>
                    <form className='login-form' onSubmit={handleLogin}>
                        <div className='input-group'>
                            <label htmlFor='email'>Email Address</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                placeholder='Enter your email address'
                                value={loginInfo.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='input-group'>
                            <label htmlFor='password'>Password</label>
                            <input
                                type='password'
                                id='password'
                                name='password'
                                placeholder='Enter your password'
                                value={loginInfo.password}
                                onChange={handleChange}
                            />
                        </div>
                        <button type='submit'>LOGIN</button>
                    </form>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Login;