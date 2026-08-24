
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music2, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthModal() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Auth Error', description: error.message });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Auth Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
          <LogIn className="h-5 w-5" />
          Login / Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader className="items-center">
          <div className="bg-primary p-3 rounded-2xl mb-4">
            <Music2 className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join AYUMUSIC'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleEmailAuth} className="space-y-4 py-4">
          <Input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="bg-neutral-800 border-white/10"
            required
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="bg-neutral-800 border-white/10"
            required
          />
          <Button type="submit" className="w-full font-bold h-12" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-900 px-2 text-neutral-500">Or continue with</span></div>
        </div>

        <Button variant="outline" onClick={handleGoogleSignIn} className="w-full border-white/10 hover:bg-white/5 h-12">
          <img src="https://www.gstatic.com/firebase/anonymous-app/png/google.png" className="h-4 w-4 mr-2" alt="Google" />
          Google
        </Button>

        <p className="text-center text-sm text-neutral-500 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
