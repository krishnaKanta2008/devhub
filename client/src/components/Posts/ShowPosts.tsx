import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, MessageCircle, Send } from "lucide-react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Cross1Icon } from "@radix-ui/react-icons";
import { Avatar, AvatarImage } from "@/components/ui/avatar"

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

interface Post {
    _id: string
    author_username: string
    author_profileImage: string
    description: string
    tags: string
    image_link?: string
    upvotes: number
    downvotes: number
    created_at: string
    comments: Comment[]
}

interface Comment {
    _id: string
    post_id: string
    user_username: string
    text: string
    created_at: string
}

export default function ShowPosts() {
    const [posts, setPosts] = useState<Post[]>([])
    const [commentText, setCommentText] = useState<string>('')
    const [selectedPost, setSelectedPost] = useState<string | null>(null)

    useEffect(() => {
        const fetchPosts = () => {
            axios.get(`${backendUrl}/posts`)
                .then(response => {
                    setPosts(response.data)
                })
                .catch(error => {
                    console.error('Error fetching posts:', error)
                })
        }

        fetchPosts()
    }, [])

    const handleCommentSubmit = (postId: string) => {
        if (!commentText) return

        const commentData = {
            user_username: localStorage.getItem('devhub_username'),
            text: commentText,
        }

        axios.post(`${backendUrl}/posts/${postId}/comments`, commentData)
            .then(response => {
                const updatedPosts = posts.map(post => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            comments: [...post.comments, response.data],
                        }
                    }
                    return post
                })
                setPosts(updatedPosts)
                setCommentText('')
            })
            .catch(error => {
                console.error('Error adding comment:', error)
            })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-0 md:space-y-8">
            {posts.map((post) => (
                <div key={post._id} className="bg-background shadow-lg md:rounded-lg overflow-hidden border">
                    <div className="flex items-center border-b p-4">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.author_username}`} />
                        </Avatar>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{post.author_username}</p>
                            <p className="text-xs text-muted-foreground">
                                Posted {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {post.image_link && (
                        <img
                            src={post.image_link}
                            alt="Post image"
                            className="w-full h-96 object-cover mb-1 border-b"
                        />
                    )}
                    <div className="flex items-center gap-4 ml-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            <ChevronUp className="h-5 w-5" />
                            <span>{post.upvotes}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            <ChevronDown className="h-5 w-5" />
                            <span>{post.downvotes}</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                    <MessageCircle className="h-5 w-5" />
                                    <span>{post.comments.length}</span>
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="grid gap-6 sm:w-80">
                                <AlertDialogHeader>
                                    <div className='flex items-center'>
                                        <AlertDialogHeader className='text-2xl'>Comments</AlertDialogHeader>
                                        <div className='flex-grow'></div>
                                        <AlertDialogCancel>
                                            <Cross1Icon className='h-3 w-3' />
                                        </AlertDialogCancel>
                                    </div>
                                </AlertDialogHeader>

                                {/* Set max height and make it scrollable if needed */}
                                <div className="max-h-56 overflow-y-auto">
                                    {/* Reverse the comments to display the latest on top */}
                                    {post.comments.slice().reverse().map((comment) => (
                                        <div key={comment._id} className="flex items-start gap-2 mb-4">
                                            <div className="h-8 w-8">
                                                <img src="/placeholder.svg?height=32&width=32" alt={comment.user_username} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{comment.user_username}</p>
                                                <p className="text-sm">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleCommentSubmit(post._id);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentText}
                                            onChange={(e) => {
                                                setCommentText(e.target.value);
                                                setSelectedPost(post._id);
                                                console.log(selectedPost);
                                            }}
                                            className="flex-grow"
                                        />
                                        <Button type="submit" size="sm">
                                            <Send className="h-4 w-4" />
                                            <span className="sr-only">Send comment</span>
                                        </Button>
                                    </form>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className='p-4'>
                        <p className="text-sm mb-2">{post.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {JSON.parse(post.tags).map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>
            ))}
        </div>
    )
}
