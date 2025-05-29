import NextAuth, { DefaultUser } from 'next-auth'; 

declare module 'next-auth' {
  interface User extends DefaultUser {
    role: string | undefined; 
  }
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
      role: string | undefined; 
    };
  }
  interface JWT {
      id?: string;
      role: string | undefined; 
  }
}
