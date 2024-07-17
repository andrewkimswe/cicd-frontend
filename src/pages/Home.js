import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h2>Welcome to Name</h2>
            <p>Club of Hongik University</p>
            <div className="action-buttons">
                {/* Button 컴포넌트를 사용하여 로그인 버튼을 렌더링하고, 클릭 시 '/login' 경로로 이동합니다. */}
                <Button onClick={() => navigate('/login')} label="Log in" />
            </div>
        </div>
    );
}

function Button({ onClick, label }) {
    return (
        <button className="action-button" onClick={onClick}>
            {label}
        </button>
    );
}

Button.propTypes = { // Button 컴포넌트의 PropTypes 정의
    onClick: PropTypes.func.isRequired, // onClick 프로퍼티는 함수 타입이어야 합니다.
    label: PropTypes.string.isRequired, // label 프로퍼티는 문자열 타입이어야 합니다.
};

export default Home;
