import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import logo from '../assets/logo.png';
import '../pages/css/Login.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        employeeId: '' 
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo({ ...signupInfo, [name]: value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        createStarSparkles(e);

        const { name, email, password, confirmPassword, employeeId } = signupInfo;

        if (!name || !email || !password || !confirmPassword || !employeeId) {
            return handleError('All fields are required');
        }

        if (password !== confirmPassword) {
            return handleError('Passwords do not match');
        }

        try {
            const response = await fetch(`http://localhost:8080/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, employeeId }),
            });
            const result = await response.json();
            const { success, message, error } = result;

            if (success) {
                handleSuccess(message);
                setTimeout(() => navigate('/login'), 1000);
            } else {
                handleError(error?.details[0]?.message || message);
            }
        } catch (err) {
            handleError('An error occurred during signup');
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
                    <h1>Hello, Friend!</h1><br />
                    <p>Register with your personal details to use all site features</p><br /><br /><br /><br /><br />
                    <p style={{ color: 'red' }}>Already have an account?</p>
                    <button onClick={() => navigate('/login')}>LOGIN</button>
                </div>

                <div className='right-panel'>
                    <h1>Create Account</h1>
                    <div className='circles'>
                        <i></i><i></i><i></i><i></i>
                    </div>
                    <form className='login-form' onSubmit={handleSignup}>
                        <div className='input-group'>
                            <label htmlFor='name'>Full Name</label>
                            <input 
                                type='text' 
                                id='name' 
                                name='name' 
                                placeholder='Enter your full name' 
                                value={signupInfo.name} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className='input-row'>
                            <div className='input-column'>
                                <div className='input-group'>
                                    <label htmlFor='employeeId'>Employee ID</label>
                                    <input 
                                        type='text' 
                                        id='employeeId' 
                                        name='employeeId' 
                                        placeholder='Enter employee ID' 
                                        value={signupInfo.employeeId} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            <div className='input-column'>
                                <div className='input-group'>
                                    <label htmlFor='email'>Email Address</label>
                                    <input 
                                        type='email' 
                                        id='email' 
                                        name='email' 
                                        placeholder='Enter email address' 
                                        value={signupInfo.email} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='input-row'>
                            <div className='input-column'>
                                <div className='input-group'>
                                    <label htmlFor='password'>Password</label>
                                    <input 
                                        type='password' 
                                        id='password' 
                                        name='password' 
                                        placeholder='Create password' 
                                        value={signupInfo.password} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            <div className='input-column'>
                                <div className='input-group'>
                                    <label htmlFor='confirmPassword'>Confirm Password</label>
                                    <input 
                                        type='password' 
                                        id='confirmPassword' 
                                        name='confirmPassword' 
                                        placeholder='Re-enter password' 
                                        value={signupInfo.confirmPassword} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                        </div>

                        <button type='submit'>SIGN UP</button>
                    </form>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Signup;