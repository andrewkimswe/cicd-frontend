import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 'root'라는 ID를 가진 HTML 요소를 가져와서 root 변수에 할당합니다.
const root = createRoot(document.getElementById('root'));

// React.StrictMode를 사용하여 앱을 엄격한 모드로 실행합니다.
// 엄격한 모드는 애플리케이션 내의 잠재적인 문제를 감지하고 경고를 표시합니다.
// 주로 개발 환경에서 사용됩니다.
root.render(
    // <React.StrictMode> 두 번 조회되게 되게함
    <App /> // {/* App 컴포넌트를 렌더링합니다. */}
    // </React.StrictMode>
);
