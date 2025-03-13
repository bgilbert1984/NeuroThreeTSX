// src/components/GemmaDashboard.tsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import GemmaScene from './GemmaScene';
import ThreeJSErrorBoundary from './ErrorBoundary'; // Your existing error boundary
import {  } from "module";
//import { llamaStackClient } from '../your-llama-stack-client-setup'; // Import YOUR configured client

interface Message {
    role: 'user' | 'assistant',
    content: string
}
interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for communication with Llama Stack
  const sendPromptToGemma = async (userPrompt: string) => {

    const userMessage: Message = {role: 'user', content: userPrompt}
    setMessages([...messages, userMessage])
    setIsLoading(true);
    setError(null);
    try {
      // Replace this with your actual llama-stack-client call
      // const result = await llamaStackClient.ask({ prompt: userPrompt, model: 'gemma:7b' });
      // setResponse(result.response); // Assuming the response is in result.response
      //FOR TESTING WITHOUT BACKEND
        const result = {response: "This is a placeholder. Replace the try block with your backend call"}
        setResponse(result.response)

        const assistantMessage: Message = { role: 'assistant', content: result.response}
        setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
        setIsLoading(false)
        setPrompt('')
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      sendPromptToGemma(prompt)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar (Optional) */}
      <div style={{ width: '250px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        Sidebar Content (e.g., settings, history)
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar (Optional) */}
        <div style={{ padding: '10px', backgroundColor: '#ddd' }}>
          Dashboard Header
        </div>

        {/* Chat Area */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', padding: '4rem'}}>
            <div style={{flex: 1, overflowY: 'scroll', marginBottom: '1rem'}}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.role === 'user' ? 'user-message' : 'assistant-message'}>
                        <p><strong>{msg.role.toUpperCase()}:</strong> {msg.content}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem'}}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt..."
                  style={{flexGrow: 1, padding: '.5rem'}}
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} style={{padding: '.5rem', cursor: 'pointer'}}>
                    {isLoading? "Loading..." : "Submit"}
                </button>
            </form>
            {error && <div style={{color: 'red', marginTop: '1rem'}}>{error}</div>}
        </div>
      </div>

         {/* 3D Scene Area */}
         <div style={{ width: '500px', height: '500px' }}>
          <ThreeJSErrorBoundary>
            <Canvas>
                <GemmaScene />
            </Canvas>
          </ThreeJSErrorBoundary>
        </div>
    </div>
  );
};

export default Dashboard;