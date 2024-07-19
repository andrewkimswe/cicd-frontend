import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';
import InfiniteScroll from 'react-infinite-scroll-component';

function PostDetail() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { postId } = useParams();
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchPost();
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [postId, page]);

    const navigateToBulletinBoard = () => {
        navigate('/posts');
    };

    const fetchPost = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
            setPost(response.data);
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    };

    const handleEdit = () => {
        navigate(`/edit-post/${postId}`);
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;
        const password = prompt("Please enter your password to delete this post:");
        if (!password) return;
        const config = { data: { password } };
        try {
            await axios.delete(`http://localhost:8080/api/posts/${postId}`, config);
            navigate('/posts');
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleLike = async () => {
        try {
            await axios.put(`http://localhost:8080/api/posts/${postId}/like`);
            const updatedPost = await axios.get(`http://localhost:8080/api/posts/${postId}`);
            setPost(updatedPost.data);
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/comments/posts/${postId}?page=${page}&size=10`);
            if (response.data && response.data.content) {
                setComments(prevComments => [...prevComments, ...response.data.content]);
                setHasMore(!response.data.last);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleNewCommentSubmit = async (e) => {
        e.preventDefault();
        const password = prompt('Enter your password to post this comment:');
        if (!newComment.trim() || !password) return;
        try {
            await axios.post(`http://localhost:8080/api/comments`, {
                postId: postId,
                content: newComment,
                password: password
            });
            setNewComment('');
            setPage(0);
            setComments([]);
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const handleEditComment = async (commentId) => {
        const newCommentText = prompt('Edit your comment:');
        const password = prompt('Enter your password:');
        if (newCommentText && password) {
            try {
                await axios.put(`http://localhost:8080/api/comments/${commentId}`, {
                    content: newCommentText,
                    password: password
                });
                setPage(0);
                setComments([]);
            } catch (error) {
                console.error('Error updating comment:', error);
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        const password = prompt('Enter your password:');
        if (password) {
            try {
                await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
                    headers: {
                        'Password': password
                    }
                });
                setPage(0);
                setComments([]);
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    return (
        <div className="post-detail-container">
            <div className="button-container">
                <button onClick={navigateToBulletinBoard}>Back to Bulletin Board</button>
                <div>
                    <button onClick={handleEdit}>Edit Post</button>
                    <button onClick={handleDelete}>Delete Post</button>
                </div>
            </div>
            <h1 className="post-title">{post?.title}</h1>
            <p className="post-content">{post?.content}</p>
            {post?.imagePath && (
                <img src={post.imagePath} alt="Post attachment" style={{ maxWidth: '100%' }} />
            )}
            {post?.filePath && (
                <div>
                    <a href={post.filePath} target="_blank" rel="noopener noreferrer">Download Attached File</a>
                </div>
            )}
            <button onClick={handleLike} className="like-button">Like</button>
            <div className="comments-section">
                <h2>Comments</h2>
                <InfiniteScroll
                    dataLength={comments.length}
                    next={() => setPage(page + 1)}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                >
                    {comments.map((comment, index) => (
                        <div key={comment._id || `comment-${index}`} className="comment-item">
                            <div className="comment-content">
                                <p>{comment.content}</p>
                            </div>
                            <div className="comment-actions">
                                <button onClick={() => handleEditComment(comment._id)}>Edit</button>
                                <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </InfiniteScroll>
            </div>
            <form onSubmit={handleNewCommentSubmit} className="new-comment-form">
                <textarea
                    className="new-comment-textarea"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                />
                <button type="submit" className="submit-comment">Submit Comment</button>
            </form>
        </div>
    );
}

export default PostDetail;