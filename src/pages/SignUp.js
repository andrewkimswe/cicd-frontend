import React, { useState } from 'react';
import OAuth2LoginButtons from '../components/OAuth2LoginButtons';
import './SignUp.css'; // Reuse the same CSS file for styling
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // confirmPassword 상태 추가
    const [message, setMessage] = useState(''); // 추가: 사용자에게 안내 메시지를 표시하기 위한 상태

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return; // 일치하지 않으면 함수 실행 종료
        }

        try {
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.log("회원가입 실패: ", errorData);
                setMessage(`회원가입 실패: ${errorData.message}`);
            } else {
                console.log("회원가입 성공");
                setMessage('회원가입에 성공했습니다. 이메일을 확인하여 인증해주세요.');
            }
        } catch (error) {
            console.error("회원가입 중 오류 발생", error);
        }
    };

    return (
        <div className="signup-container">
            <header>
                <h2>Sign Up</h2>
            </header>
            <main>
                {message && <p className="signup-message">{message}</p>} {/* 안내 메시지를 표시합니다. */}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit">Sign Up</button>
                </form>
                <p className="terms-conditions">
                    회원가입하면 쿠키 사용을 포함해 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
                    계정을 안전하게 보호하고 광고를 포함한 맞춤 서비스를 제공하는 등 개인정보 처리방침에 명시된 목적을 위해 이메일 주소 및 전화번호 등의 내 연락처 정보를 사용할 수 있습니다.
                    <Link to="/privacy"> 자세히 알아보기</Link>
                </p>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
                <OAuth2LoginButtons /> {/* "Login With Google" 버튼을 렌더링합니다. */}
            </main>
        </div>
    );
}

export default Signup;