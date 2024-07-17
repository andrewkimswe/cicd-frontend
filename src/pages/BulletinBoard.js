import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BulletinBoard.css';
import { useNavigate } from 'react-router-dom';

function BulletinBoard() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]); // 게시물 목록 상태
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 오류 상태
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
    const [filter, setFilter] = useState('all'); // 게시물 필터링 상태
    const postsPerPage = 10; // 한 페이지에 표시할 게시물 수

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = pageNumber => setCurrentPage(pageNumber); // 페이지네이션 함수



    useEffect(() => {
        // URL에서 jwt 파라미터를 가져와서 로컬 스토리지에 저장하고 '/posts' 페이지로 리다이렉션합니다.
        const urlParams = new URLSearchParams(window.location.search);
        const jwt = urlParams.get('jwt');

        if (jwt) {
            localStorage.setItem('JWT_TOKEN', jwt);

            // Redirect to the posts page
            navigate('/posts');
        }
    }, [navigate]);

    const handleLogout = () => {
        axios.post('http://localhost:8080/api/logout')
            .then(() => {
                navigate('/login');
            })
            .catch(error => {
                console.error('Logout failed:', error);
            });
    };


    const handleSearch = () => {
        setLoading(true);
        axios.get(`http://localhost:8080/api/posts?search=${searchTerm}`)
            .then(response => {
                setPosts(response.data);
                setCurrentPage(1);
            })
            .catch(err => {
                setError(`Error fetching posts: ${err.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchFilteredPosts = (filterType) => {
        setLoading(true);
        axios.get(`http://localhost:8080/api/posts?filter=${filterType}`)
            .then(response => {
                setPosts(response.data);
                setCurrentPage(1);
            })
            .catch(err => {
                setError(`Error fetching posts: ${err.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
        setFilter(filterType);
    };


    const goToCreatePost = () => {
        navigate('/create-post'); // 글쓰기 페이지로 이동
    };


    return (
        <div className="board-container">
            <header className="board-header">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
                <button className="create-post-button" onClick={goToCreatePost}>글쓰기</button>
            </header>
            <h1 className="board-title">Name</h1>
            <div className="filter-bar">
                <button className={`filter-button ${filter === 'all' ? 'active' : ''}`} onClick={() => fetchFilteredPosts('all')}>전체글</button>
                <button className={`filter-button ${filter === 'popular' ? 'active' : ''}`} onClick={() => fetchFilteredPosts('popular')}>인기글</button>
                <button className={`filter-button ${filter === 'notices' ? 'active' : ''}`} onClick={() => fetchFilteredPosts('notices')}>공지글</button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <p>{error}</p>
            ) : (
                currentPosts.map(post => (
                    <div key={post.id} className="post-item">
                        <h3 onClick={() => navigate(`/posts/${post.id}`)}>{post.title}</h3>
                        <div className="post-info">
                            <span>{post.nickname}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>{post.type}</span>
                            <span>Views: {post.views}</span> {/* Views displayed */}
                            <span>Likes: {post.likes}</span> {/* Likes displayed */}
                        </div>
                    </div>
                ))
            )}
            <div className="pagination">
                {[...Array(Math.ceil(posts.length / postsPerPage)).keys()].map(number => (
                    <button key={number} onClick={() => paginate(number + 1)}>
                        {number + 1}
                    </button>
                ))}
            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
        </div>
    );
}

export default BulletinBoard;
