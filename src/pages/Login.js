import React, { useState } from 'react';
import './Login.css';
import OAuth2LoginButtons from '../components/OAuth2LoginButtons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/login', {
                username,
                password
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                const { token, role } = response.data;

                localStorage.setItem('token', token);

                // role 정보를 배열로 변환하고, 추가적인 대괄호를 제거
                let roles = role;
                if (!Array.isArray(role)) {
                    roles = role.replace(/^\[|\]$/g, '').split(','); // 대괄호를 제거하고, 문자열을 배열로 변환
                }

                // roles 배열에서 공백 제거 및 대문자 변환
                roles = roles.map(r => r.trim().toUpperCase());

                if (roles.includes("ADMIN")) {
                    navigate('/admin');
                } else {
                    navigate('/posts');
                }
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    };



    return (
        <div className="login-container">
            <header>
                <h2>Login to Your Account</h2>
            </header>
            <main>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                <p><Link to="/forgot-password">Forgot Password?</Link></p>
                <OAuth2LoginButtons />
            </main>
        </div>
    );
}

export default Login;
